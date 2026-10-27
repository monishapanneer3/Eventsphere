import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Empty, Spin, Tag, message } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { fetchAgenda, removeFromAgenda, clearAgendaError } from "../../store/slices/agendaSlice";
import { formatSessionDate, getSessionStatus } from "../../utils/sessionStatus";

const MyAgenda = () => {
  const dispatch = useDispatch();
  const { content: sessions, loading, error } = useSelector((state) => state.agenda);

  useEffect(() => {
    dispatch(fetchAgenda());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearAgendaError());
    }
  }, [error, dispatch]);

  const handleRemove = async (id) => {
    const result = await dispatch(removeFromAgenda(id));
    if (removeFromAgenda.fulfilled.match(result)) {
      message.success("Removed from your agenda");
    }
  };

  // Group sessions by Date (dayOfWeek or formatted session date)
  const groupedSessions = useMemo(() => {
    const groups = {};
    sessions.forEach((session) => {
      const dateKey = session.dayOfWeek
        ? formatSessionDate(session)
        : "Unscheduled Sessions";
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });
    return groups;
  }, [sessions]);

  return (
    <div className="management-page agenda-page">
      <div className="management-intro">
        <div>
          <p className="management-eyebrow">Personal Itinerary</p>
          <h1>My Agenda</h1>
          <p>
            Your personalized conference timeline. Keep track of registered keynotes,
            workshops, and breakout rooms.
          </p>
        </div>
        <div className="management-toolbar">
          <Link to="/sessions">
            <Button type="primary" icon={<CompassOutlined />}>
              Explore More Sessions
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div data-testid="loader" className="dashboard-loading">
          <Spin size="large" />
          <span>Loading your personalized schedule...</span>
        </div>
      ) : sessions.length ? (
        <div className="agenda-timeline-wrap">
          {Object.entries(groupedSessions).map(([dateLabel, dateSessions]) => (
            <div className="agenda-date-group" key={dateLabel}>
              <div className="agenda-date-header">
                <CalendarOutlined style={{ color: "var(--caramel)" }} />
                <span>{dateLabel}</span>
                <span className="agenda-date-badge">
                  {dateSessions.length} {dateSessions.length === 1 ? "Session" : "Sessions"}
                </span>
              </div>

              <div className="agenda-timeline-cards">
                {dateSessions.map((session) => {
                  const status = getSessionStatus(session);
                  return (
                    <article className="agenda-schedule-card" key={session.id}>
                      <div className="agenda-time-pill">
                        <ClockCircleOutlined style={{ marginRight: 6 }} />
                        <span>
                          {session.startTime || "TBA"}
                          {session.endTime ? ` – ${session.endTime}` : ""}
                        </span>
                      </div>

                      <div className="agenda-card-body">
                        <div className="agenda-title-row">
                          <h2 className="agenda-title">{session.sessionName}</h2>
                          <Tag className={`session-status status-${status.toLowerCase()}`}>
                            {status}
                          </Tag>
                        </div>

                        {session.topic && (
                          <div className="agenda-topic-tag">
                            <span>{session.topic}</span>
                          </div>
                        )}

                        <div className="agenda-meta-row">
                          <span className="agenda-meta-item">
                            <UserOutlined style={{ color: "var(--caramel)" }} />
                            <span>{session.speaker?.name || session.speakerName || "Speaker to be announced"}</span>
                          </span>

                          <span className="agenda-meta-item">
                            <EnvironmentOutlined style={{ color: "var(--caramel)" }} />
                            <span>{session.roomNote || "Room TBA"}</span>
                          </span>
                        </div>
                      </div>

                      <div className="agenda-card-action">
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemove(session.id)}
                          className="agenda-remove-btn"
                        >
                          Remove
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="agenda-empty">
          <Empty
            description={
              <div>
                <h3 style={{ margin: "0 0 6px", color: "var(--coffee-950)", fontFamily: "Playfair Display, serif" }}>
                  Your Agenda is Empty
                </h3>
                <p style={{ margin: 0, color: "var(--taupe)", fontSize: 13 }}>
                  You haven't bookmarked any sessions yet. Browse the schedule to create your custom itinerary.
                </p>
              </div>
            }
          >
            <Link to="/sessions">
              <Button type="primary" size="large" icon={<CompassOutlined />} style={{ marginTop: 16 }}>
                Browse Conference Sessions
              </Button>
            </Link>
          </Empty>
        </div>
      )}
    </div>
  );
};

export default MyAgenda;