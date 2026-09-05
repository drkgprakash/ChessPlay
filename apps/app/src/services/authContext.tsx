import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, DEMO_CREDENTIALS } from '../types/auth';

interface AuthContextType {
  user: UserProfile;
  login: (email: string, pass: string) => boolean;
  quickSwitchRole: (role: UserRole) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
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

  const [isLoginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('chessplay_auth_user', JSON.stringify(user));
  }, [user]);

  const quickSwitchRole = (role: UserRole) => {
    const demo = DEMO_CREDENTIALS.find(d => d.role === role);
    if (!demo) return;

    const newUser: UserProfile = {
      id: `usr-${role}`,
      name: demo.name,
      email: demo.email,
      role: demo.role,
      academyName: demo.academyName,
      avatar: role === 'saas_owner' ? '👑' : role === 'academy_admin' ? '🏛️' : role === 'head_coach' ? '👨‍🏫' : '🧑‍🏫',
      permissions: role === 'saas_owner' ? ['*'] : [
        'classroom:view',
        role === 'head_coach' ? 'classroom:master' : 'classroom:assist',
        role === 'academy_admin' ? 'academy:billing' : '',
      ].filter(Boolean)
    };

    setUser(newUser);
    setLoginModalOpen(false);
  };

  const login = (email: string, pass: string): boolean => {
    const match = DEMO_CREDENTIALS.find(d => d.email.toLowerCase() === email.toLowerCase() && d.password === pass);
    if (match) {
      quickSwitchRole(match.role);
      return true;
    }
    return false;
  };

  const logout = () => {
    // Return to default demo role
    quickSwitchRole('head_coach');
  };

  const hasPermission = (permission: string): boolean => {
    if (user.role === 'saas_owner') return true;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        quickSwitchRole,
        logout,
        hasPermission,
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
