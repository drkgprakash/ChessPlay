import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole, DEMO_CREDENTIALS, ROLE_PERMISSIONS_MAP } from '../types/auth';

interface AuthResponse {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: UserProfile;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  quickSwitchRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canAccessTab: (tabId: string) => boolean;
  isLoginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-owner',
  name: 'Platform Owner (You)',
  email: 'owner@chessplay.in',
  role: 'saas_owner',
  avatar: '👑',
  permissions: ['*']
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('chessplay_auth_jwt'));
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('chessplay_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return DEFAULT_USER;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  // Sync session with backend on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('chessplay_auth_jwt');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth.php?action=me', {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && data.user) {
            const u = data.user;
            const restoredProfile: UserProfile = {
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              academyId: u.academy_id,
              academyName: u.academy_name,
              avatar: u.avatar_emoji || (u.role === 'saas_owner' ? '👑' : u.role === 'academy_admin' ? '🏛️' : u.role === 'head_coach' ? '👨‍🏫' : '🧑‍🏫'),
              permissions: u.permissions || ROLE_PERMISSIONS_MAP[u.role as UserRole] || [],
              token: savedToken
            };
            setUser(restoredProfile);
            localStorage.setItem('chessplay_auth_user', JSON.stringify(restoredProfile));
          }
        } else {
          // Token invalid/expired
          localStorage.removeItem('chessplay_auth_jwt');
          setToken(null);
        }
      } catch (err) {
        console.warn('Auth check skipped (offline or network error):', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<AuthResponse> => {
    try {
      const res = await fetch('/api/auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const u = data.user;
        const loggedUser: UserProfile = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          academyId: u.academy_id,
          academyName: u.academy_name,
          avatar: u.avatar_emoji || (u.role === 'saas_owner' ? '👑' : '👨‍🏫'),
          permissions: u.permissions || ROLE_PERMISSIONS_MAP[u.role as UserRole] || [],
          token: data.token
        };

        setToken(data.token);
        setUser(loggedUser);
        localStorage.setItem('chessplay_auth_jwt', data.token);
        localStorage.setItem('chessplay_auth_user', JSON.stringify(loggedUser));
        setLoginModalOpen(false);
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Invalid email or password' };
      }
    } catch (err) {
      // Offline fallback: check local demo credentials
      const match = DEMO_CREDENTIALS.find(d => d.email.toLowerCase() === email.toLowerCase() && d.password === pass);
      if (match) {
        await quickSwitchRole(match.role);
        return { success: true };
      }
      return { success: false, error: 'Network connection failed. Please check server.' };
    }
  }, []);

  const quickSwitchRole = useCallback(async (role: UserRole) => {
    try {
      const res = await fetch('/api/auth.php?action=demo_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.user) {
          const u = data.user;
          const switchedUser: UserProfile = {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            academyId: u.academy_id,
            academyName: u.academy_name,
            avatar: u.avatar_emoji || (u.role === 'saas_owner' ? '👑' : u.role === 'academy_admin' ? '🏛️' : u.role === 'head_coach' ? '👨‍🏫' : '🧑‍🏫'),
            permissions: u.permissions || ROLE_PERMISSIONS_MAP[u.role as UserRole] || [],
            token: data.token
          };

          setToken(data.token);
          setUser(switchedUser);
          localStorage.setItem('chessplay_auth_jwt', data.token);
          localStorage.setItem('chessplay_auth_user', JSON.stringify(switchedUser));
          setLoginModalOpen(false);
          return;
        }
      }
    } catch {
      // Fallback to local
    }

    // Local fallback if API unreachable
    const demo = DEMO_CREDENTIALS.find(d => d.role === role);
    if (!demo) return;

    const fallbackUser: UserProfile = {
      id: `usr-${role}`,
      name: demo.name,
      email: demo.email,
      role: demo.role,
      academyName: demo.academyName,
      avatar: role === 'saas_owner' ? '👑' : role === 'academy_admin' ? '🏛️' : role === 'head_coach' ? '👨‍🏫' : '🧑‍🏫',
      permissions: ROLE_PERMISSIONS_MAP[role] || ['*']
    };

    setUser(fallbackUser);
    localStorage.setItem('chessplay_auth_user', JSON.stringify(fallbackUser));
    setLoginModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('chessplay_auth_jwt');
    localStorage.removeItem('chessplay_auth_user');
    setToken(null);
    quickSwitchRole('head_coach');
  }, [quickSwitchRole]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (user.role === 'saas_owner') return true;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  }, [user]);

  const canAccessTab = useCallback((tabId: string): boolean => {
    switch (tabId) {
      case 'saas-owner':
        return user.role === 'saas_owner';
      case 'coaches':
        return user.role === 'saas_owner' || user.role === 'academy_admin';
      case 'classroom':
        return hasPermission('classroom:view') || hasPermission('classroom:master') || hasPermission('classroom:assist');
      case 'tournaments':
        return hasPermission('tournaments:manage') || hasPermission('tournaments:play') || hasPermission('tournaments:view');
      case 'lms':
        return hasPermission('homework:create') || hasPermission('homework:grade') || hasPermission('homework:submit');
      case 'settings':
        return user.role === 'saas_owner' || user.role === 'academy_admin';
      default:
        return true;
    }
  }, [user, hasPermission]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        quickSwitchRole,
        logout,
        hasPermission,
        canAccessTab,
        isLoginModalOpen,
        setLoginModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
