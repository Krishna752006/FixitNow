import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'user' | 'professional';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredUserType,
  redirectTo 
}) => {
  const { isAuthenticated, userType, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    const loginPath = requiredUserType === 'professional' ? '/login/professional' : '/login/user';
    return <Navigate to={redirectTo || loginPath} state={{ from: location }} replace />;
  }

  // If user type doesn't match requirement, redirect appropriately
  if (requiredUserType && userType !== requiredUserType) {
    if (requiredUserType === 'professional' && userType === 'user') {
      return <Navigate to="/dashboard/user" replace />;
    } else if (requiredUserType === 'user' && userType === 'professional') {
      return <Navigate to="/dashboard/provider" replace />;
    }
  }

  // User is authenticated and has correct permissions
  return <>{children}</>;
};

export default ProtectedRoute;
