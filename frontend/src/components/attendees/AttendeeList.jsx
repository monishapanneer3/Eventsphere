import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button, Modal, message, Tag, Input, Select } from "antd";
import { PlusOutlined, SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { fetchAttendees, deleteAttendee, setAttendeePage, clearAttendeeStatus } from "../../store/slices/attendeeSlice";
import AttendeeForm from "./AttendeeForm";

const AttendeeList = () => {
  const dispatch = useDispatch();
  const { content: attendees, loading, error, statusMessage, page, size, totalElements } = useSelector((state) => state.attendees);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAttendee, setEditingAttendee] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    dispatch(fetchAttendees({ page, size }));
  }, [dispatch, page, size]);

  useEffect(() => {
    if (statusMessage) {
      setStatusMsg(statusMessage);
      dispatch(clearAttendeeStatus());
    }
    if (error) {
      setStatusMsg(error);
      dispatch(clearAttendeeStatus());
    }
  }, [statusMessage, error, dispatch]);

  const handleDelete = (id) =>
    Modal.confirm({
      title: "Delete Attendee",
      content: "Are you sure you want to delete this attendee registration?",
      okText: "Delete",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      onOk: async () => {
        message.info("Item deleted via DELETE");
        const result = await dispatch(deleteAttendee(id));
        if (deleteAttendee.fulfilled.match(result)) {
          message.success("Attendee deleted successfully");
        }
      },
    });

  const handleAdd = () => {
    setEditingAttendee(null);
    setFormOpen(true);
  };

  const handleEdit = (record) => {
    setEditingAttendee(record);
    setFormOpen(true);
  };

  const filteredAttendees = useMemo(() => {
    return attendees.filter((att) => {
      const matchQuery =
        !searchQuery.trim() ||
        (att.fullName && att.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (att.email && att.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (att.sessionName && att.sessionName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (att.userName && att.userName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = typeFilter === "ALL" || att.registrationType === typeFilter;

      return matchQuery && matchType;
    });
  }, [attendees, searchQuery, typeFilter]);

  const columns = [
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => <span className="list-name">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <span className="attendee-email-text">{email || "—"}</span>
      ),
    },
    {
      title: "Session",
      dataIndex: "sessionName",
      key: "sessionName",
      render: (text) => (
        text ? <span className="attendee-session-name">{text}</span> : <span className="unassigned-text">—</span>
      ),
    },
    {
      title: "Registration Type",
      dataIndex: "registrationType",
      key: "registrationType",
      render: (type) => {
        const cls =
          type === "VIP"
            ? "tag-vip"
            : type === "Student"
            ? "tag-student"
            : "tag-general";
        return <Tag className={`reg-type-tag ${cls}`}>{type || "General"}</Tag>;
      },
    },
    {
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
  ];

  return (
    <div className="management-page">
      <div className="management-intro">
        <div>
          <p className="management-eyebrow">The Community</p>
          <h1>Event Attendees</h1>
          <p>
            Keep every registration organized, verify assigned sessions, and ensure each guest has a seamless conference pass.
          </p>
        </div>
        <div className="management-toolbar">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Register Attendee
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="filter-toolbar">
        <Input
          prefix={<SearchOutlined style={{ color: "var(--caramel)" }} />}
          placeholder="Search by attendee name, email, or session..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className="filter-search-input"
        />

        <div className="filter-selects-wrap">
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            className="filter-select"
            suffixIcon={<FilterOutlined />}
            options={[
              { value: "ALL", label: "All Registration Types" },
              { value: "VIP", label: "VIP Passes" },
              { value: "General", label: "General Admission" },
              { value: "Student", label: "Student Passes" },
            ]}
          />
        </div>
      </div>

      {loading && <div data-testid="loader">Loading attendees...</div>}
      {statusMsg && <div data-testid="status-msg" style={{ marginBottom: 12 }}>{statusMsg}</div>}

      {!loading && (
        <Table
          rowKey="id"
          dataSource={filteredAttendees}
          columns={columns}
          pagination={{
            current: page + 1,
            pageSize: size,
            total: totalElements,
            onChange: (newPage) => dispatch(setAttendeePage(newPage - 1)),
          }}
          locale={{ emptyText: "No attendees found matching your search" }}
        />
      )}

      {formOpen && (
        <AttendeeForm
          open={formOpen}
          initialValues={editingAttendee}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  );
};

export default AttendeeList;
