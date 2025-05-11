import { Navigate } from "react-router-dom";

// Protected route for authenticated users only with role checking
export const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userRole = parseInt(localStorage.getItem("userRole"));

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={userRole === 1 ? "/staff" : "/adopter"} replace />;
  }

  return children;
};


export const PublicOnlyRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (token) {
    const userRole = parseInt(localStorage.getItem("userRole"));
    return <Navigate to={userRole === 1 ? "/staff" : "/adopter"} replace />;
  }

  return children;
}; 