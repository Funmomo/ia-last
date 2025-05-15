import { Navigate } from "react-router-dom";
import { validateRole } from '../utils/auth';

// Helper function to convert role number to route path
const getRoleRoute = (role) => {
  switch (role) {
    case 0:
      return "/admin";
    case 1:
      return "/staff";
    case 2:
      return "/adopter";
    default:
      return "/";
  }
};

// Protected route for authenticated users only with role checking
export const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const rawRole = localStorage.getItem("userRole");
  
  console.log('=== PrivateRoute Check ===');
  console.log('Token exists:', !!token);
  console.log('Raw role from storage:', rawRole);
  
  // Validate the role
  const userRole = validateRole(rawRole);
  if (userRole === null) {
    console.error('Unrecognized user role in ProtectedRoute:', rawRole);
    return <div style={{color: 'red', padding: '2rem'}}>Unrecognized user role. Please contact support.</div>;
  }
  console.log('Validated user role:', userRole);
  console.log('Allowed roles:', allowedRoles);
  console.log('Is role allowed:', allowedRoles.includes(userRole));

  if (!token) {
    console.log('No token, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    const redirectPath = getRoleRoute(userRole);
    console.log('Role not allowed, redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const rawRole = localStorage.getItem("userRole");
  
  console.log('=== PublicOnlyRoute Check ===');
  console.log('Token exists:', !!token);
  console.log('Raw role from storage:', rawRole);
  
  if (token) {
    const userRole = validateRole(rawRole);
    if (userRole === null) {
      console.error('Unrecognized user role in PublicOnlyRoute:', rawRole);
      return <div style={{color: 'red', padding: '2rem'}}>Unrecognized user role. Please contact support.</div>;
    }
    const redirectPath = getRoleRoute(userRole);
    console.log('User authenticated, redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}; 