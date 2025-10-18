import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getLoggedInVendor } from '@/services/supabaseService';

interface VendorProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const VendorProtectedRoute: React.FC<VendorProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/' 
}) => {
  const vendor = getLoggedInVendor();
  const location = useLocation();

  if (!vendor) {
    // Redirect to home page with return url
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
