import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService } from '../services/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  resendVerificationEmail: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Export the provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.token);
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        isEmailVerified: data.isEmailVerified
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await authService.register(name, email, password);
      localStorage.setItem('token', data.token);
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        isEmailVerified: data.isEmailVerified
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const resendVerificationEmail = async () => {
    try {
      await authService.resendVerificationEmail();
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email);
    } catch (error) {
      console.error('Failed to process forgot password:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        resendVerificationEmail,
        forgotPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook that returns the auth context
function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export the hook (named export, not a declaration)
export { useAuthContext as useAuth };
