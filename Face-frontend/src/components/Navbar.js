import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderNavLinks = () => {
    if (!user) return null;

    switch (user.role) {
      case "student":
        return (
          <>
            <Link className="nav-link" to="/student-dashboard">Dashboard</Link>
            <Link className="nav-link" to="/attendance-history">History</Link>
          </>
        );
      case "teacher":
        return (
          <>
            <Link className="nav-link" to="/teacher-dashboard">Dashboard</Link>
          </>
        );
      case "admin":
        return (
          <>
            <Link className="nav-link" to="/admin-dashboard">Dashboard</Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid">
        <span className="navbar-brand">🎓 Face Attendance</span>

        {user && (
          <>
            <div className="navbar-nav me-auto">
              {renderNavLinks()}
            </div>

            <div className="d-flex align-items-center text-white me-3">
              <small>
                👤 {user.username || user.studentId} {user.fullName} - <b>{user.role}</b>
              </small>
            </div>

            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              🚪 Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
