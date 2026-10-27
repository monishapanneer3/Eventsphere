import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button, Modal, message, Tag, Input, Select } from "antd";
import { PlusOutlined, SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { fetchSessions, deleteSession, setSessionPage, clearSessionStatus } from "../../store/slices/sessionSlice";
import { addToAgenda, fetchAgenda, removeFromAgenda } from "../../store/slices/agendaSlice";
import SessionForm from "./SessionForm";
import { getSessionStatus } from "../../utils/sessionStatus";
import { normalizeRole } from "../../store/slices/authSlice";

const SessionList = () => {
  const dispatch = useDispatch();
  const { content: sessions, loading, error, statusMessage, page, size, totalElements } = useSelector((state) => state.sessions);
  const role = useSelector((state) => state.auth.role);
  const isAdmin = normalizeRole(role) === "ROLE_ADMIN";
  const agenda = useSelector((state) => state.agenda.content);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    dispatch(fetchSessions({ page, size }));
  }, [dispatch, page, size]);

  useEffect(() => {
    if (!isAdmin) dispatch(fetchAgenda());
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (statusMessage) {
      message.success(statusMessage);
      dispatch(clearSessionStatus());
    }
    if (error) dispatch(clearSessionStatus());
  }, [statusMessage, error, dispatch]);

  const handleDelete = (id) =>
    Modal.confirm({
      title: "Delete Session",
      content: "Are you sure you want to remove this session from the schedule?",
      okText: "Delete",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      onOk: () => dispatch(deleteSession(id)),
    });

  const handleAdd = () => {
    setEditingSession(null);
    setFormOpen(true);
  };

  const handleEdit = (record) => {
    setEditingSession(record);
    setFormOpen(true);
  };

  const handleAgendaToggle = async (session) => {
    const isSaved = agenda.some((item) => item.id === session.id);
    const result = isSaved
      ? await dispatch(removeFromAgenda(session.id))
      : await dispatch(addToAgenda(session.id));
    if (addToAgenda.fulfilled.match(result)) message.success("Added to your agenda");
    if (removeFromAgenda.fulfilled.match(result)) message.success("Removed from your agenda");
    if (result.meta.requestStatus === "rejected") message.error(result.payload || "Agenda update failed");
  };

  const topicsList = useMemo(() => {
    const topics = new Set(sessions.map((s) => s.topic).filter(Boolean));
    return Array.from(topics);
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchQuery =
        !searchQuery.trim() ||
        (session.sessionName && session.sessionName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (session.topic && session.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (session.speaker?.name && session.speaker.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (session.speakerName && session.speakerName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTopic = selectedTopic === "ALL" || session.topic === selectedTopic;

      const status = getSessionStatus(session);
      const matchStatus = selectedStatus === "ALL" || status === selectedStatus;

      return matchQuery && matchTopic && matchStatus;
    });
  }, [sessions, searchQuery, selectedTopic, selectedStatus]);

  const columns = [
    {
      title: "Title",
      dataIndex: "sessionName",
      key: "sessionName",
      render: (text) => <span className="list-name">{text}</span>,
    },
    {
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
      render: (topic) => (topic ? <Tag className="topic-pill">{topic}</Tag> : "—"),
    },
    {
      title: "Day",
      dataIndex: "dayOfWeek",
      key: "dayOfWeek",
      render: (day) => day || "TBA",
    },
    {
      title: "Time",
      key: "time",
      render: (_, record) => `${record.startTime || "TBA"} ${record.endTime ? `– ${record.endTime}` : ""}`,
    },
    {
      title: "Speakers",
      key: "speaker",
      render: (_, record) => record.speaker?.name || record.speakerName || "TBA",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const status = getSessionStatus(record);
        return (
          <Tag className={`session-status status-${status.toLowerCase()}`}>
            {status}
          </Tag>
        );
      },
    },
    !isAdmin && {
      title: "My Agenda",
      key: "agenda",
      render: (_, record) => {
        const isSaved = agenda.some((item) => item.id === record.id);
        return (
          <Button
            className={isSaved ? "agenda-remove-btn" : "agenda-add-btn"}
            onClick={() => handleAgendaToggle(record)}
          >
            {isSaved ? "Remove" : "Add to My Agenda"}
          </Button>
        );
      },
    },
    isAdmin && {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons-wrap">
          <Button type="primary" onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
            Edit
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ].filter(Boolean);

  return (
    <div id="session-container-t28" className="management-page">
      <div className="management-intro">
        <div>
          <p className="management-eyebrow">The Programme</p>
          <h1>Session Schedule</h1>
          <p>
            {isAdmin
              ? "Curate topics, assign expert speakers, and schedule keynotes across the conference."
              : "Explore workshops, keynotes, and panel discussions to build your conference agenda."}
          </p>
        </div>
        {isAdmin && (
          <div className="management-toolbar">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Session
            </Button>
          </div>
        )}
      </div>

      {/* Polished Filter & Search Toolbar */}
      <div className="filter-toolbar">
        <Input
          prefix={<SearchOutlined style={{ color: "var(--caramel)" }} />}
          placeholder="Search by title, topic, or speaker..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className="filter-search-input"
        />

        <div className="filter-selects-wrap">
          <Select
            value={selectedTopic}
            onChange={setSelectedTopic}
            className="filter-select"
            suffixIcon={<FilterOutlined />}
            options={[
              { value: "ALL", label: "All Topics" },
              ...topicsList.map((topic) => ({ value: topic, label: topic })),
            ]}
          />

          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            className="filter-select"
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "UPCOMING", label: "Upcoming" },
              { value: "ONGOING", label: "Ongoing" },
              { value: "COMPLETED", label: "Completed" },
            ]}
          />
        </div>
      </div>

      {loading && <div data-testid="loader">Loading sessions...</div>}
      {error && <div data-testid="status-msg" style={{ color: "#ff4d4f" }}>{error}</div>}

      {!loading && !error && (
        <Table
          rowKey="id"
          dataSource={filteredSessions}
          columns={columns}
          pagination={{
            current: page + 1,
            pageSize: size,
            total: totalElements,
            onChange: (newPage) => dispatch(setSessionPage(newPage - 1)),
          }}
          locale={{ emptyText: "No sessions found matching your criteria" }}
        />
      )}

      {formOpen && (
        <SessionForm
          open={formOpen}
          initialValues={editingSession}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  );
};

export default SessionList;
