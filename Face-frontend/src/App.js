import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Saveface from "./pages/Saveface";
import Scanface from "./pages/Scanface";
import StudentDashboard from "./pages/StudentDashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import AttendanceHistory from "./pages/AttendanceHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar /> {/* ✅ แสดงบนทุกหน้า */}
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/save-face" element={
              <ProtectedRoute><Saveface /></ProtectedRoute>
          } />
          <Route path="/scan-face" element={
              <ProtectedRoute><Scanface /></ProtectedRoute>
          } />
          <Route path="/student-dashboard" element={
              <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/attendance-history" element={
              <ProtectedRoute><AttendanceHistory /></ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
              <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
