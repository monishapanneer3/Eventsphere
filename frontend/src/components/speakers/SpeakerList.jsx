import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button, Modal, message, Tag, Avatar, Input, Segmented } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  MailOutlined,
  BookOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { fetchSpeakers, deleteSpeaker, setSpeakerPage, clearSpeakerStatus } from "../../store/slices/speakerSlice";
import SpeakerForm from "./SpeakerForm";
import { normalizeRole } from "../../store/slices/authSlice";

const SpeakerList = () => {
  const dispatch = useDispatch();
  const { content: speakers, loading, error, statusMessage, page, size, totalElements } = useSelector((state) => state.speakers);
  const role = useSelector((state) => state.auth.role);
  const isAdmin = normalizeRole(role) === "ROLE_ADMIN";

  const [formOpen, setFormOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [searchQuery, setSearchQuery] = useState("");
  const [profileModalSpeaker, setProfileModalSpeaker] = useState(null);

  useEffect(() => {
    dispatch(fetchSpeakers({ page, size }));
  }, [dispatch, page, size]);

  useEffect(() => {
    if (statusMessage) {
      message.success(statusMessage);
      dispatch(clearSpeakerStatus());
    }
    if (error) {
      message.error(error);
      dispatch(clearSpeakerStatus());
    }
  }, [statusMessage, error, dispatch]);

  const handleDelete = (id) =>
    Modal.confirm({
      title: "Delete Speaker",
      content: "Are you sure you want to remove this speaker? Any associated sessions may need re-assignment.",
      okText: "Delete",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      onOk: () => dispatch(deleteSpeaker(id)),
    });

  const handleAdd = () => {
    setEditingSpeaker(null);
    setFormOpen(true);
  };

  const handleEdit = (record) => {
    setEditingSpeaker(record);
    setFormOpen(true);
  };

  const filteredSpeakers = useMemo(() => {
    if (!searchQuery.trim()) return speakers;
    const q = searchQuery.toLowerCase();
    return speakers.filter(
      (sp) =>
        (sp.name && sp.name.toLowerCase().includes(q)) ||
        (sp.expertise && sp.expertise.toLowerCase().includes(q)) ||
        (sp.email && sp.email.toLowerCase().includes(q)) ||
        (sp.bio && sp.bio.toLowerCase().includes(q))
    );
  }, [speakers, searchQuery]);

  const getInitials = (name) => {
    if (!name) return "SP";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="list-name">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Expertise",
      dataIndex: "expertise",
      key: "expertise",
      render: (exp) => (exp ? <Tag className="topic-pill">{exp}</Tag> : "—"),
    },
    {
      title: "Bio",
      dataIndex: "bio",
      key: "bio",
      render: (bio) => bio || "—",
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
    <div className="speaker-container management-page">
      <div className="management-intro">
        <div>
          <p className="management-eyebrow">The Voices</p>
          <h1>Conference Speakers</h1>
          <p>
            {isAdmin
              ? "Manage keynote speakers, workshop leads, and domain experts presenting at EventSphere."
              : "Discover the thought leaders, researchers, and practitioners shaping the stage."}
          </p>
        </div>
        {isAdmin && (
          <div className="management-toolbar">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Speaker
            </Button>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="filter-toolbar">
        <Input
          prefix={<SearchOutlined style={{ color: "var(--caramel)" }} />}
          placeholder="Search by name, expertise, or bio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className="filter-search-input"
        />

        <div className="view-mode-toggle">
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: "cards", label: "Cards", icon: <AppstoreOutlined /> },
              { value: "table", label: "Table", icon: <UnorderedListOutlined /> },
            ]}
          />
        </div>
      </div>

      {loading && <div data-testid="loader">Loading speakers...</div>}
      {error && <div data-testid="status-msg" style={{ color: "#ff4d4f" }}>{error}</div>}

      {!loading && !error && (
        <>
          {viewMode === "cards" ? (
            <div className="speaker-cards-grid">
              {filteredSpeakers.length ? (
                filteredSpeakers.map((speaker) => (
                  <article className="speaker-card" key={speaker.id}>
                    <div className="speaker-card-header">
                      <Avatar
                        size={64}
                        className="speaker-avatar"
                      >
                        {getInitials(speaker.name)}
                      </Avatar>
                      <div className="speaker-header-meta">
                        <h2 className="speaker-name">{speaker.name}</h2>
                        {speaker.expertise && (
                          <span className="speaker-expertise-tag">
                            {speaker.expertise}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="speaker-bio-snippet">
                      {speaker.bio || "Conference presenter and topic leader at EventSphere."}
                    </p>

                    <div className="speaker-card-footer">
                      {speaker.email && (
                        <div className="speaker-email-row">
                          <MailOutlined style={{ color: "var(--caramel)" }} />
                          <span>{speaker.email}</span>
                        </div>
                      )}

                      <div className="speaker-actions-row">
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => setProfileModalSpeaker(speaker)}
                          className="speaker-view-btn"
                        >
                          View Profile
                        </Button>

                        {isAdmin && (
                          <div className="admin-speaker-btns">
                            <Button size="small" type="primary" onClick={() => handleEdit(speaker)}>
                              Edit
                            </Button>
                            <Button size="small" danger onClick={() => handleDelete(speaker.id)}>
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="speaker-empty-wrap">
                  <p>No speakers found matching your search.</p>
                </div>
              )}
            </div>
          ) : (
            <Table
              rowKey="id"
              dataSource={filteredSpeakers}
              columns={columns}
              pagination={{
                current: page + 1,
                pageSize: size,
                total: totalElements,
                onChange: (newPage) => dispatch(setSpeakerPage(newPage - 1)),
              }}
              locale={{ emptyText: "No speakers found" }}
            />
          )}
        </>
      )}

      {/* Speaker Profile Modal */}
      <Modal
        open={Boolean(profileModalSpeaker)}
        title="Speaker Profile"
        onCancel={() => setProfileModalSpeaker(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setProfileModalSpeaker(null)}>
            Close
          </Button>,
        ]}
      >
        {profileModalSpeaker && (
          <div className="speaker-profile-modal-body">
            <div className="profile-modal-top">
              <Avatar size={72} className="speaker-avatar modal-avatar">
                {getInitials(profileModalSpeaker.name)}
              </Avatar>
              <div>
                <h2>{profileModalSpeaker.name}</h2>
                <Tag className="topic-pill">{profileModalSpeaker.expertise || "Domain Expert"}</Tag>
                <div style={{ marginTop: 6, color: "var(--taupe)", fontSize: 13 }}>
                  <MailOutlined style={{ marginRight: 6, color: "var(--caramel)" }} />
                  {profileModalSpeaker.email || "Contact via EventSphere"}
                </div>
              </div>
            </div>

            <div className="profile-modal-section">
              <h4>Biography</h4>
              <p>{profileModalSpeaker.bio || "No detailed biography provided for this speaker."}</p>
            </div>
          </div>
        )}
      </Modal>

      {formOpen && (
        <SpeakerForm
          open={formOpen}
          initialValues={editingSpeaker}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  );
};

export default SpeakerList;
