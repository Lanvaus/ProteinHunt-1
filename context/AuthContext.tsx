import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import ApiService from '../services/api-service';
import TokenService from '../services/token-service';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  roles: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (token: string, userData: User) => {
    await TokenService.saveToken(token);
    await TokenService.saveUser(userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await TokenService.clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    setLoading(true);
    try {
      const response = await ApiService.validateToken();
      
      if (response.success && response.data) {
        setUser({
          id: response.data.id,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: null, // The validate endpoint doesn't return email
          roles: response.data.roles
        });
        setIsAuthenticated(true);
      } else {
        // If token validation fails, clear auth state
        await logout();
      }
    } catch (error) {
      await logout();
    } finally {
      setLoading(false);
    }
  };

  // Check token validity on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const token = await TokenService.getToken();
        
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        const response = await ApiService.validateToken();
        
        if (response.success && response.data) {
          const userData = await TokenService.getUser();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // If we have a token but no user data, refresh the user data
            await refreshUser();
          }
        } else {
          // Token is invalid
          await logout();
        }
      } catch (error) {
        await logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#18853B" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
