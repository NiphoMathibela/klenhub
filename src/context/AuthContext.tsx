import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService } from '../services/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          console.log('Current user data:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Failed to get user data:', error);
          localStorage.removeItem('token');
        }
      } else {
        console.log('No token found, user is not authenticated');
      }
    };

    initializeAuth();
  }, []);

  // Log user state changes
  useEffect(() => {
    console.log('Auth state changed:', {
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      user
    });
  }, [user]);

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('Attempting to register user:', { name, email });
      const data = await authService.register(name, email, password);
      console.log('Registration successful:', data);
      localStorage.setItem('token', data.token);
      setUser(data);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting to login user:', { email });
      const data = await authService.login(email, password);
      console.log('Login successful:', data);
      localStorage.setItem('token', data.token);
      setUser(data);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out user:', user?.email);
    setUser(null);
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, isAdmin }}>
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
