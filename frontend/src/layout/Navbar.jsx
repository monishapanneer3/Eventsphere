import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Button, Modal, Tag } from "antd";
import {
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  DashboardOutlined,
  IdcardOutlined,
  LogoutOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { logout } from "../store/slices/authSlice";
import { normalizeRole } from "../store/slices/authSlice";
import "./Navbar.css";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, username, role } = useSelector((state) => state.auth);
  const isAdmin = normalizeRole(role) === "ROLE_ADMIN";

  const [modalType, setModalType] = useState(null); // 'reports' | 'settings' | 'notifications' | 'profile'

  const handleLogout = () => {
    Modal.confirm({
      title: "Sign Out",
      content: "Are you sure you want to log out of EventSphere?",
      okText: "Logout",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      onOk: () => {
        dispatch(logout());
        navigate("/login");
      },
    });
  };

  if (!isAuthenticated) return null;

  const adminNav = [
    { to: "/", label: "Dashboard", icon: <DashboardOutlined /> },
    { to: "/sessions", label: "Sessions", icon: <CalendarOutlined /> },
    { to: "/speakers", label: "Speakers", icon: <TeamOutlined /> },
    { to: "/attendees", label: "Attendees", icon: <UserOutlined /> },
  ];

  const userNav = [
    { to: "/", label: "Dashboard", icon: <DashboardOutlined /> },
    { to: "/sessions", label: "Sessions", icon: <CalendarOutlined /> },
    { to: "/my-agenda", label: "My Agenda", icon: <CalendarOutlined /> },
    { to: "/speakers", label: "Speakers", icon: <TeamOutlined /> },
  ];

  const navItems = isAdmin ? adminNav : userNav;

  return (
    <>
      <aside className="eventsphere-navbar">
        <div className="navbar-brand">
          <span className="brand-mark">E</span>
          <div className="brand-text">
            <span className="brand-title">EventSphere</span>
            <span className="brand-subtitle">Conference Hub</span>
          </div>
        </div>

        <div className="navbar-section-label">Navigation</div>
        <nav className="navbar-links">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `navbar-link${isActive ? " active" : ""}`
              }
            >
              <span className="navbar-icon">{icon}</span>
              <span className="navbar-label">{label}</span>
            </NavLink>
          ))}

          {isAdmin ? (
            <>
              <button
                type="button"
                className="navbar-link navbar-action-link"
                onClick={() => setModalType("reports")}
              >
                <span className="navbar-icon"><BarChartOutlined /></span>
                <span className="navbar-label">Reports</span>
              </button>
              <button
                type="button"
                className="navbar-link navbar-action-link"
                onClick={() => setModalType("settings")}
              >
                <span className="navbar-icon"><SettingOutlined /></span>
                <span className="navbar-label">Settings</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="navbar-link navbar-action-link"
                onClick={() => setModalType("notifications")}
              >
                <span className="navbar-icon"><BellOutlined /></span>
                <span className="navbar-label">Notifications</span>
              </button>
              <button
                type="button"
                className="navbar-link navbar-action-link"
                onClick={() => setModalType("profile")}
              >
                <span className="navbar-icon"><IdcardOutlined /></span>
                <span className="navbar-label">Profile</span>
              </button>
            </>
          )}
        </nav>

        <div className="navbar-footer">
          <div
            className="navbar-profile-card"
            onClick={() => setModalType(isAdmin ? "settings" : "profile")}
          >
            <Avatar
              size={36}
              className="navbar-avatar"
              icon={<UserOutlined />}
            />
            <div className="profile-info">
              <span className="profile-name">{username || "User"}</span>
              <span className="profile-role-text">
                {isAdmin ? "Administrator" : "Participant"}
              </span>
            </div>
            <Tag className={`navbar-role-pill ${isAdmin ? "pill-admin" : "pill-user"}`}>
              {isAdmin ? "ADMIN" : "USER"}
            </Tag>
          </div>

          <Button
            className="navbar-logout-btn"
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Auxiliary Modals for Settings, Reports, Notifications, Profile */}
      <Modal
        open={Boolean(modalType)}
        title={
          modalType === "reports"
            ? "Conference Reports"
            : modalType === "settings"
            ? "Platform Settings"
            : modalType === "notifications"
            ? "Event Notifications"
            : "User Profile"
        }
        onCancel={() => setModalType(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setModalType(null)}>
            Done
          </Button>,
        ]}
      >
        {modalType === "reports" && (
          <div className="nav-modal-content">
            <p>Export attendance summaries, session participation logs, and speaker metrics directly to CSV or PDF reports.</p>
            <div className="nav-modal-stat-box">
              <div><strong>System Health:</strong> Active</div>
              <div><strong>Audit Logging:</strong> Enabled (Spring Security)</div>
            </div>
          </div>
        )}
        {modalType === "settings" && (
          <div className="nav-modal-content">
            <p>Manage conference configuration, security parameters, and registration policies.</p>
            <div className="nav-modal-stat-box">
              <div><strong>RBAC Policy:</strong> ADMIN / USER</div>
              <div><strong>Token Provider:</strong> JWT Bearer Authentication</div>
            </div>
          </div>
        )}
        {modalType === "notifications" && (
          <div className="nav-modal-content">
            <p>Stay up to date with real-time conference announcements and schedule updates.</p>
            <div className="nav-modal-notice">
              <span>All sessions scheduled on time. Check your personal agenda for rooms.</span>
            </div>
          </div>
        )}
        {modalType === "profile" && (
          <div className="nav-modal-content">
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <Avatar size={48} icon={<UserOutlined />} style={{ background: "var(--coffee-900)" }} />
              <div>
                <h3 style={{ margin: 0, color: "var(--coffee-950)" }}>{username || "User"}</h3>
                <small style={{ color: "var(--taupe)" }}>{isAdmin ? "Conference Administrator" : "Conference Attendee"}</small>
              </div>
            </div>
            <p>Account authenticated via secure JWT Bearer credentials.</p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Navbar;
