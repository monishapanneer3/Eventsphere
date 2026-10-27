import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Alert, Button, Empty, Spin, Tag } from "antd";
import {
  ArrowRightOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dashboardService from "./services/dashboardService";
import { normalizeRole } from "./store/slices/authSlice";
import "./Home.css";
import { formatSessionDate, getSessionStart, getSessionStatus } from "./utils/sessionStatus";

const Home = () => {
  const { isAuthenticated, username, role } = useSelector((state) => state.auth);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const isAdmin = normalizeRole(role) === "ROLE_ADMIN";

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) return undefined;
    setLoading(true);
    dashboardService
      .getDashboard()
      .then(({ data }) => {
        if (active) setDashboard(data);
      })
      .catch(() => {
        if (active) setError("Unable to load upcoming sessions.");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [isAuthenticated, reloadKey]);

  const allSessions = useMemo(
    () => dashboard?.upcomingSessions || dashboard?.recentSessions || [],
    [dashboard]
  );
  
  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return allSessions
      .map((session) => ({ ...session, scheduledAt: getSessionStart(session) }))
      .filter((session) => session.scheduledAt && session.scheduledAt >= now)
      .sort((first, second) => first.scheduledAt - second.scheduledAt)
      .slice(0, 5);
  }, [allSessions]);

  const categories = useMemo(() => {
    const counts = allSessions.reduce((result, session) => {
      const topic = session.topic || "General";
      result[topic] = (result[topic] || 0) + 1;
      return result;
    }, {});
    return Object.entries(counts).slice(0, 5);
  }, [allSessions]);

  const refresh = () => {
    setError("");
    setDashboard(null);
    setReloadKey((current) => current + 1);
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
        <span>Loading conference dashboard...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header-main">
          <p className="eyebrow">{isAdmin ? "Conference Operations" : "Participant Hub"}</p>
          <h1>{isAdmin ? "Admin Dashboard" : "User Dashboard"}</h1>
          <p className="dashboard-subtitle">
            {isAdmin
              ? "Oversee conference schedule, speaker engagements, and attendee registrations."
              : "Welcome to EventSphere! Plan your itinerary and discover upcoming sessions."}{" "}
            Welcome, <strong>{dashboard?.username || username || "Guest"}</strong>.
          </p>
        </div>
        <div className="dashboard-header-actions">
          {isAdmin && (
            <div className="dashboard-actions">
              <Link to="/sessions" className="dash-action-btn">
                <PlusOutlined /> Add Session
              </Link>
              <Link to="/speakers" className="dash-action-btn">
                <PlusOutlined /> Add Speaker
              </Link>
              <Link to="/attendees" className="dash-action-btn primary-dash-btn">
                <PlusOutlined /> Register Attendee
              </Link>
            </div>
          )}
          <Button className="refresh-button" icon={<ReloadOutlined />} onClick={refresh}>
            Refresh
          </Button>
        </div>
      </header>

      {error && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          message={error}
          action={<Button size="small" onClick={refresh}>Retry</Button>}
        />
      )}

      {isAdmin ? (
        <AdminDashboard data={dashboard} sessions={upcomingSessions} categories={categories} />
      ) : (
        <UserDashboard data={dashboard} sessions={upcomingSessions} />
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, tone, detail, link }) => (
  <div className={`stat-card stat-tone-${tone}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-copy">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {detail && <small className="stat-detail">{detail}</small>}
    </div>
    {link && (
      <Link className="stat-link" to={link}>
        View <ArrowRightOutlined />
      </Link>
    )}
  </div>
);

const SessionRows = ({ sessions }) =>
  sessions.length ? (
    <div className="session-list">
      {sessions.map((session) => {
        const status = getSessionStatus(session);
        return (
          <div className="session-row" key={session.id}>
            <div className="session-mark">
              <CalendarOutlined />
            </div>
            <div className="session-info">
              <strong className="session-title">{session.sessionName}</strong>
              <span className="session-speaker">
                {session.speaker?.name || session.speakerName || "Speaker TBA"}
                {session.topic ? ` • ${session.topic}` : ""}
              </span>
            </div>
            <div className="session-time">
              <ClockCircleOutlined style={{ marginRight: 4, color: "var(--caramel)" }} />
              <span>{formatSessionDate(session)}</span>
              <small>
                {session.startTime || "TBA"}
                {session.endTime ? ` - ${session.endTime}` : ""}
              </small>
            </div>
            <Tag className={`session-status status-${status.toLowerCase()}`}>{status}</Tag>
            <Link className="row-action" to="/sessions">
              Details <ArrowRightOutlined />
            </Link>
          </div>
        );
      })}
    </div>
  ) : (
    <div className="panel-empty-wrap">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No upcoming sessions scheduled."
      />
    </div>
  );

const AdminDashboard = ({ data, sessions, categories }) => (
  <>
    <section className="stats-grid admin-stats">
      <StatCard
        icon={<CalendarOutlined />}
        label="Total Sessions"
        value={data?.sessionCount || 0}
        tone="coffee"
        detail="Active on conference schedule"
        link="/sessions"
      />
      <StatCard
        icon={<TeamOutlined />}
        label="Total Speakers"
        value={data?.speakerCount || 0}
        tone="caramel"
        detail="Keynote and session leads"
        link="/speakers"
      />
      <StatCard
        icon={<UserOutlined />}
        label="Total Attendees"
        value={data?.attendeeCount || 0}
        tone="champagne"
        detail="Registered participants"
        link="/attendees"
      />
      <StatCard
        icon={<UserOutlined />}
        label="Platform Users"
        value={data?.userCount || 0}
        tone="beige"
        detail="Authenticated accounts"
      />
    </section>

    <section className="dashboard-columns">
      <div className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Schedule Pulse</span>
            <h2>Upcoming Sessions</h2>
          </div>
          <Link to="/sessions" className="panel-more-link">
            View All <ArrowRightOutlined />
          </Link>
        </div>
        <SessionRows sessions={sessions} />
      </div>

      <div className="panel category-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">By Topic</span>
            <h2>Session Categories</h2>
          </div>
        </div>
        <CategoryChart categories={categories} total={data?.sessionCount || 0} />
      </div>
    </section>
  </>
);

const UserDashboard = ({ data, sessions }) => (
  <>
    <section className="stats-grid user-stats">
      <StatCard
        icon={<CalendarOutlined />}
        label="Upcoming Sessions"
        value={sessions.length}
        tone="coffee"
        detail="Scheduled conference talks"
        link="/sessions"
      />
      <StatCard
        icon={<TeamOutlined />}
        label="Conference Speakers"
        value={data?.speakerCount || 0}
        tone="caramel"
        detail="Industry experts & leaders"
        link="/speakers"
      />
    </section>

    <section className="dashboard-columns user-columns">
      <div className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">What's Next</span>
            <h2>Upcoming Sessions</h2>
          </div>
          <Link to="/sessions" className="panel-more-link">
            Browse All <ArrowRightOutlined />
          </Link>
        </div>
        <SessionRows sessions={sessions} />
      </div>

      <div className="panel quick-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Quick Access</span>
            <h2>Conference Shortcuts</h2>
          </div>
        </div>
        <div className="quick-links">
          <Link to="/sessions">
            <CalendarOutlined />
            <span>Browse Full Schedule</span>
            <ArrowRightOutlined />
          </Link>
          <Link to="/my-agenda">
            <CalendarOutlined />
            <span>My Personal Agenda</span>
            <ArrowRightOutlined />
          </Link>
          <Link to="/speakers">
            <TeamOutlined />
            <span>Explore Speaker Directory</span>
            <ArrowRightOutlined />
          </Link>
        </div>
      </div>
    </section>
  </>
);

const CategoryChart = ({ categories, total }) => (
  <div className="category-content">
    <div
      className="donut"
      style={{
        "--chart-size": `${Math.min(total, 12) * 30}deg`,
      }}
    >
      <div>
        <strong>{total}</strong>
        <span>Sessions</span>
      </div>
    </div>
    <div className="category-legend">
      {categories.length ? (
        categories.map(([name, count], index) => (
          <div key={name} className="legend-item">
            <i className={`legend-dot dot-${index}`} />
            <span className="legend-name">{name}</span>
            <b className="legend-count">{count}</b>
          </div>
        ))
      ) : (
        <span className="muted">Add sessions to view topic breakdown.</span>
      )}
    </div>
  </div>
);

export default Home;
