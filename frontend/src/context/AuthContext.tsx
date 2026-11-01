import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: 'passenger' | 'admin' | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: { email: string; password: string; full_name: string; phone?: string; role?: string }) => Promise<AuthResponse>;
  quickDemoLogin: (role: 'passenger' | 'admin') => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'passenger' | 'admin' | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('smartbus_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('smartbus_user');
    const savedRole = localStorage.getItem('smartbus_role') as 'passenger' | 'admin' | null;
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        setRole(savedRole);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, [token]);

  const handleAuthSuccess = (data: AuthResponse) => {
    const userData: User = {
      id: data.user_id,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
    };
    localStorage.setItem('smartbus_token', data.access_token);
    localStorage.setItem('smartbus_user', JSON.stringify(userData));
    localStorage.setItem('smartbus_role', data.role);
    setToken(data.access_token);
    setUser(userData);
    setRole(data.role);
    return data;
  };

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    return handleAuthSuccess(data);
  };

  const register = async (userData: { email: string; password: string; full_name: string; phone?: string; role?: string }) => {
    const data = await authApi.register(userData);
    return handleAuthSuccess(data);
  };

  const quickDemoLogin = async (demoRole: 'passenger' | 'admin') => {
    if (demoRole === 'admin') {
      return login('admin@smartbus.demo', 'Admin@123');
    } else {
      return login('passenger@smartbus.demo', 'Passenger@123');
    }
  };

  const logout = () => {
    localStorage.removeItem('smartbus_token');
    localStorage.removeItem('smartbus_user');
    localStorage.removeItem('smartbus_role');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        quickDemoLogin,
        logout,
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
