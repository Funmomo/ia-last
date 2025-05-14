import { Navigate } from "react-router-dom";

const validateRole = (roleValue) => {
  console.log('=== Route Role Validation ===');
  console.log('Raw role value:', roleValue);
  console.log('Role type:', typeof roleValue);

  // Handle string roles
  if (typeof roleValue === 'string') {
    // Convert "Admin" to 0
    if (roleValue.toLowerCase() === 'admin') {
      console.log('Converting "Admin" string to role 0');
      return 0;
    }
    // Convert "Staff" to 1
    if (roleValue.toLowerCase() === 'staff') {
      return 1;
    }
    // Try converting to number if it's a numeric string
    const numericRole = Number(roleValue);
    if (!isNaN(numericRole)) {
      return validateRole(numericRole);
    }
  }

  // Handle numeric roles
  if (typeof roleValue === 'number' && !isNaN(roleValue)) {
    if (roleValue === 0 || roleValue === 1 || roleValue === 2) {
      return roleValue;
    }
  }

  // Default to adopter (2) for any invalid values
  console.warn('Invalid role value, defaulting to 2');
  return 2;
};

// Helper function to convert role number to route path
const getRoleRoute = (role) => {
  switch (role) {
    case 0:
      return "/admin";
    case 1:
      return "/staff";
    default:
      return "/adopter";
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
    console.log('Validated user role:', userRole);
    
    const redirectPath = getRoleRoute(userRole);
    console.log('User authenticated, redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}; 