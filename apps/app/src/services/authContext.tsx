import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole, DEMO_CREDENTIALS, ROLE_PERMISSIONS_MAP } from '../types/auth';

interface AuthResponse {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isImpersonating: boolean;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  quickSwitchRole: (role: UserRole) => Promise<void>;
  returnToOwnerRole: () => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canAccessTab: (tabId: string) => boolean;
  isLoginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('chessplay_auth_jwt'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('chessplay_auth_user');
    const savedToken = localStorage.getItem('chessplay_auth_jwt');
    if (saved && savedToken) {
      try {
        return JSON.parse(saved);
      } catch {
        // Corrupted cache
      }
    }
    // Protected by default: Unauthenticated visitors MUST log in
    return null;
  });
  const [isImpersonating, setIsImpersonating] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('chessplay_owner_token'));
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  // Sync session with backend on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('chessplay_auth_jwt');
      if (!savedToken) {
        setUser(null);
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
          } else {
            // Invalid session payload
            localStorage.removeItem('chessplay_auth_jwt');
            localStorage.removeItem('chessplay_auth_user');
            setUser(null);
            setToken(null);
          }
        } else {
          // Token expired or invalid on server
          localStorage.removeItem('chessplay_auth_jwt');
          localStorage.removeItem('chessplay_auth_user');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.warn('Backend session verification skipped (network or local mode):', err);
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
          avatar: u.avatar_emoji || (u.role === 'saas_owner' ? '👑' : u.role === 'academy_admin' ? '🏛️' : u.role === 'head_coach' ? '👨‍🏫' : '🧑‍🏫'),
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
      return { success: false, error: 'Connection failed. Please check your internet or try again.' };
    }
  }, []);

  const quickSwitchRole = useCallback(async (role: UserRole) => {
    // Security Guard: Only SaaS Owner or an owner currently impersonating can trigger role switcher
    const ownerToken = localStorage.getItem('chessplay_owner_token');
    if (user?.role !== 'saas_owner' && !ownerToken) {
      console.warn('Unauthorized role switch attempt blocked: Restricted to SaaS Owner.');
      return;
    }

    // Preserve original owner credentials for 1-click return
    if (user?.role === 'saas_owner' && token) {
      localStorage.setItem('chessplay_owner_token', token);
      localStorage.setItem('chessplay_owner_user', JSON.stringify(user));
      setIsImpersonating(true);
    }

    if (role === 'saas_owner') {
      localStorage.removeItem('chessplay_owner_token');
      localStorage.removeItem('chessplay_owner_user');
      setIsImpersonating(false);
    }

    const authHeader = ownerToken || token;

    try {
      const res = await fetch('/api/auth.php?action=demo_login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(authHeader ? { 'Authorization': `Bearer ${authHeader}` } : {})
        },
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
      // Fallback
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
  }, [user, token]);

  const returnToOwnerRole = useCallback(async () => {
    const ownerToken = localStorage.getItem('chessplay_owner_token');
    const ownerUser = localStorage.getItem('chessplay_owner_user');
    if (ownerToken && ownerUser) {
      try {
        const parsed = JSON.parse(ownerUser);
        setToken(ownerToken);
        setUser(parsed);
        localStorage.setItem('chessplay_auth_jwt', ownerToken);
        localStorage.setItem('chessplay_auth_user', ownerUser);
      } catch {
        await quickSwitchRole('saas_owner');
      }
    } else {
      await quickSwitchRole('saas_owner');
    }
    localStorage.removeItem('chessplay_owner_token');
    localStorage.removeItem('chessplay_owner_user');
    setIsImpersonating(false);
    setLoginModalOpen(false);
  }, [quickSwitchRole]);

  const logout = useCallback(() => {
    localStorage.removeItem('chessplay_auth_jwt');
    localStorage.removeItem('chessplay_auth_user');
    localStorage.removeItem('chessplay_owner_token');
    localStorage.removeItem('chessplay_owner_user');
    setIsImpersonating(false);
    setToken(null);
    setUser(null);
    setLoginModalOpen(false);
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'saas_owner') return true;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  }, [user]);

  const canAccessTab = useCallback((tabId: string): boolean => {
    if (!user) return false;
    switch (tabId) {
      case 'owner_overview':
        return user.role === 'saas_owner';
      case 'faculty':
        return user.role === 'saas_owner' || user.role === 'academy_admin';
      case 'classroom':
        return hasPermission('classroom:view') || hasPermission('classroom:master') || hasPermission('classroom:assist');
      case 'tournaments':
        return hasPermission('tournaments:manage') || hasPermission('tournaments:play') || hasPermission('tournaments:view');
      case 'academy':
        return hasPermission('homework:create') || hasPermission('homework:grade') || hasPermission('homework:submit');
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
        isLoggedIn: Boolean(user && token),
        isImpersonating,
        login,
        quickSwitchRole,
        returnToOwnerRole,
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
