import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AdminRole } from '../types/user';
import { DEMO_MODE } from '../services/runtime';

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
    const saved = DEMO_MODE ? sessionStorage.getItem('nomikos_demo_user') : null;
    if (saved) {
      try {
        return JSON.parse(saved) as User;
      } catch {
        sessionStorage.removeItem('nomikos_demo_user');
      }
    }

    return null;
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('nomikos_demo_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('nomikos_demo_user');
    }
  }, [user]);

  const login = (
    email: string,
    role: 'customer' | 'admin' = 'customer',
    adminRole: AdminRole = 'Super Admin'
  ) => {
    if (!DEMO_MODE) throw new Error('Η υπηρεσία σύνδεσης δεν έχει συνδεθεί.');
    const newUser: User = {
      id: role === 'customer' ? `demo-${email.toLowerCase()}` : `demo-${adminRole}`,
      name: role === 'customer' ? 'Δοκιμαστικός Πελάτης' : 'Δοκιμαστικός Διαχειριστής',
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
    setUser((prev) => (prev ? { ...prev, name: updates.name ?? prev.name, phone: updates.phone ?? prev.phone,
      companyName: updates.companyName ?? prev.companyName, vatNumber: updates.vatNumber ?? prev.vatNumber,
      taxOffice: updates.taxOffice ?? prev.taxOffice } : null));
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
