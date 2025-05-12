import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Layout from "./components/Layout";
import Landing from "./Pages/Landing";
import Login from "./Pages/login";
import Register from "./Pages/register";
import Adaptor from "./Pages/Adaptor";
import Staff from "./Pages/Staff";
import Profile from "./Pages/Profile";
import MyPets from "./Pages/MyPets";
import Messaging from "./Pages/Messaging";
import { PrivateRoute, PublicOnlyRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            localStorage.getItem("token") ? (
              <Navigate 
                to={parseInt(localStorage.getItem("userRole")) === 1 ? "/staff" : "/adopter"} 
                replace 
              />
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
        
        {/* Messaging route - accessible to both staff and adopters */}
        <Route
          path="/messages"
          element={
            <PrivateRoute allowedRoles={[1, 2]}>
              <Messaging />
            </PrivateRoute>
          }
        />
        
        {/* User profile route - accessible to both staff and adopters */}
        <Route
          path="/profile"
          element={
            <PrivateRoute allowedRoles={[1, 2]}>
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
