import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  api, 
  User, 
  Professional, 
  setAuthToken, 
  removeAuthToken, 
  setUserData, 
  getUserData, 
  getAuthToken,
  SignupUserData,
  SignupProfessionalData,
  LoginData
} from '@/services/api';
import { toast } from '@/components/ui/use-toast';
interface AuthContextType {
  user: User | Professional | null;
  userType: 'user' | 'professional' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData, type: 'user' | 'professional') => Promise<boolean>;
  signup: (data: SignupUserData | SignupProfessionalData, type: 'user' | 'professional') => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserLocal: (partial: Partial<User | Professional>) => void;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | Professional | null>(null);
  const [userType, setUserType] = useState<'user' | 'professional' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!getAuthToken();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAuthToken();
        const userData = getUserData();

        if (token && userData) {
          // Verify token is still valid by fetching current user
          try {
            const response = await api.getCurrentUser();
            if (response.success) {
              setUser(response.data.user);
              setUserType(response.data.userType);
            } else {
              // Token is invalid, clear auth data
              removeAuthToken();
            }
          } catch (error) {
            // Token is invalid or expired
            removeAuthToken();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData, type: 'user' | 'professional'): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = type === 'user' 
        ? await api.loginUser(data)
        : await api.loginProfessional(data);
      console.log("Login response:", response);

      if (response.success && response.data) {
        const { token } = response.data;
        const userData = response.data.user || response.data.professional;
        
        if (userData && token) {
          // Store auth data
          setAuthToken(token);
          setUserData(userData, type);
          
          // Update state
          setUser(userData);
          setUserType(type);

          toast({
            title: "Login Successful",
            description: `Welcome back, ${userData.firstName}!`,
          });

          return true;
        }
      }

      toast({
        title: "Login Failed",
        description: response.message || "Invalid credentials",
        variant: "destructive",
      });

      return false;
    } catch (error) {
      console.error('Login error:', error);
      
      // Improved error handling for the specific JSON parsing issue
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) {
        if (error.message.includes("Unexpected token") || error.message.includes("invalid json response body")) {
          errorMessage = "Too many login attempts. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    data: SignupUserData | SignupProfessionalData, 
    type: 'user' | 'professional'
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = type === 'user' 
        ? await api.signupUser(data as SignupUserData)
        : await api.signupProfessional(data as SignupProfessionalData);

      if (response.success && response.data) {
        const { token } = response.data;
        const userData = response.data.user || response.data.professional;
        
        if (userData && token) {
          // Store auth data
          setAuthToken(token);
          setUserData(userData, type);
          
          // Update state
          setUser(userData);
          setUserType(type);

          toast({
            title: "Account Created",
            description: `Welcome to FixItNow, ${userData.firstName}!`,
          });

          return true;
        }
      }

      // Handle validation errors
      if (response.errors && response.errors.length > 0) {
        const errorMessages = response.errors.map(err => `${err.field}: ${err.message}`).join(', ');
        toast({
          title: "Validation Error",
          description: errorMessages,
          variant: "destructive",
        });
        console.log('Validation errors:', response.errors);
      } else {
        toast({
          title: "Signup Failed",
          description: response.message || "Failed to create account",
          variant: "destructive",
        });
        console.log('Signup failed:', response.message);
      }

      return false;
    } catch (error) {
      console.error('Signup error:', error);
      
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) {
        if (error.message.includes("Unexpected token") || error.message.includes("invalid json response body")) {
          errorMessage = "An API error occurred. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Signup Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      // Call logout API (optional, for server-side cleanup)
      api.logout().catch(console.error);
      
      // Clear local auth data
      removeAuthToken();
      setUser(null);
      setUserType(null);

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async () => {
    try {
      if (!getAuthToken()) return;
      
      const response = await api.getCurrentUser();
      if (response.success) {
        setUser(response.data.user);
        setUserType(response.data.userType);
        setUserData(response.data.user, response.data.userType);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If refresh fails, user might be logged out
      logout();
    }
  };

  const updateUserLocal = (partial: Partial<User | Professional>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial } as User | Professional;
      if (userType) setUserData(updated, userType);
      return updated;
    });
  };

  const value: AuthContextType = {
    user,
    userType,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
    updateUserLocal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
