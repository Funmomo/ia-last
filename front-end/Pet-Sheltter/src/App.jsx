import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Layout from "./components/Layout";
import Landing from "./Pages/Landing";
import Login from "./Pages/login";
import Register from "./Pages/register";
import Adaptor from "./Pages/Adaptor";
import Staff from "./Pages/Staff";
import Admin from "./Pages/Admin";
import Profile from "./Pages/Profile";
import MyPets from "./Pages/MyPets";
import Messaging from "./Pages/Messaging";
import { PrivateRoute, PublicOnlyRoute } from "./components/ProtectedRoute";

export default function App() {
  const getDefaultRoute = () => {
    const userRole = parseInt(localStorage.getItem("userRole"));
    switch (userRole) {
      case 0: return "/admin";
      case 1: return "/staff";
      case 2: return "/adopter";
      default: return "/";
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            localStorage.getItem("token") ? (
              <Navigate to={getDefaultRoute()} replace />
            ) : (
              <Landing />
            )
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={[0]}>
              <Admin />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff/*"
          element={
            <PrivateRoute allowedRoles={[1]}>
              <Staff />
            </PrivateRoute>
          }
        />
        <Route
          path="/adopter/*"
          element={
            <PrivateRoute allowedRoles={[2]}>
              <Adaptor />
            </PrivateRoute>
          }
        />
        
        {/* Messaging route - accessible to all authenticated users */}
        <Route
          path="/messages"
          element={
            <PrivateRoute allowedRoles={[0, 1, 2]}>
              <Messaging />
            </PrivateRoute>
          }
        />
        
        {/* User profile route - accessible to all authenticated users */}
        <Route
          path="/profile"
          element={
            <PrivateRoute allowedRoles={[0, 1, 2]}>
              <Profile />
            </PrivateRoute>
          }
        />
        
        {/* My pets route - only for adopters */}
        <Route
          path="/adopter/mypets"
          element={
            <PrivateRoute allowedRoles={[2]}>
              <MyPets />
            </PrivateRoute>
          }
        />

        {/* Catch all route */}
        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />
      </Routes>
    </Router>
  );
}
