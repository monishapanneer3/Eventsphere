import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import AccessDenied from "./AccessDenied";
import { normalizeRole } from "./store/slices/authSlice";
import SessionList from "./components/sessions/SessionList";
import MyAgenda from "./components/sessions/MyAgenda";
import SpeakerList from "./components/speakers/SpeakerList";
import AttendeeList from "./components/attendees/AttendeeList";
import "./App.css";
import "./Management.css";

// Redirects unauthenticated users to the Login gateway before rendering
// protected page content.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return normalizeRole(role) === "ROLE_ADMIN" ? children : <AccessDenied />;
};

const UserRoute = ({ children }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return normalizeRole(role) === "ROLE_USER" ? children : <AccessDenied />;
};

const App = () => {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/403" element={<ProtectedRoute><AccessDenied /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Home /></AdminRoute>} />
          <Route path="/admin/sessions" element={<AdminRoute><SessionList /></AdminRoute>} />
          <Route path="/admin/speakers" element={<AdminRoute><SpeakerList /></AdminRoute>} />
          <Route path="/admin/attendees" element={<AdminRoute><AttendeeList /></AdminRoute>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <SessionList />
              </ProtectedRoute>
            }
          />
          <Route path="/my-agenda" element={<UserRoute><MyAgenda /></UserRoute>} />
          <Route path="/agenda" element={<UserRoute><MyAgenda /></UserRoute>} />
          <Route
            path="/speakers"
            element={
              <ProtectedRoute>
                <SpeakerList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendees"
            element={
              <AdminRoute>
                <AttendeeList />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
