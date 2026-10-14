import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AdminRole } from '../types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, role?: 'customer' | 'admin', adminRole?: AdminRole) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nomikos_user');
    if (saved) {
      try {
        return JSON.parse(saved) as User;
      } catch {
        localStorage.removeItem('nomikos_user');
      }
    }

    return {
          id: 'usr-admin-01',
          name: 'Γιώργος Νομικός',
          email: 'g.nomikos@nomikostools.gr',
          role: 'admin',
          adminRole: 'Super Admin',
          phone: '2110069347',
          isB2B: true,
          companyName: 'ΝΟΜΙΚΟΣ TOOLS Α.Ε.Β.Ε.',
          vatNumber: '094827102',
          taxOffice: 'ΦΑΕ ΠΕΙΡΑΙΑ',
        };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('nomikos_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nomikos_user');
    }
  }, [user]);

  const login = (
    email: string,
    role: 'customer' | 'admin' = 'customer',
    adminRole: AdminRole = 'Super Admin'
  ) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      adminRole: role === 'admin' ? adminRole : undefined,
      phone: '2105550000',
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        updateUser,
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
