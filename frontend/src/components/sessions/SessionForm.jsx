import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Input, Select, DatePicker, Button, message } from "antd";
import dayjs from "dayjs";
import { createSession, updateSession } from "../../store/slices/sessionSlice";
import { fetchSpeakers } from "../../store/slices/speakerSlice";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const emptyForm = {
  sessionName: "",
  topic: "",
  speakerId: undefined,
  dayOfWeek: "",
  startTime: "",
  endTime: "",
  roomNote: "",
};

const SessionForm = ({ open, initialValues, onClose }) => {
  const dispatch = useDispatch();
  const speakers = useSelector((state) => state.speakers.content);
  const isEditMode = Boolean(initialValues && initialValues.id);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchSpeakers({ page: 0, size: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (initialValues) {
      setForm({
        sessionName: initialValues.sessionName || "",
        topic: initialValues.topic || "",
        speakerId: initialValues.speaker?.id || initialValues.speakerId,
        dayOfWeek: initialValues.dayOfWeek || "",
        startTime: initialValues.startTime || "",
        endTime: initialValues.endTime || "",
        roomNote: initialValues.roomNote || "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [initialValues, open]);

  const handleChange = (field) => (e) => {
    const value = e && e.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateBlur = () => {
    if (form.dayOfWeek && !DATE_REGEX.test(form.dayOfWeek)) {
      setErrors((prev) => ({ ...prev, dayOfWeek: "Invalid Date Format" }));
    } else {
      setErrors((prev) => ({ ...prev, dayOfWeek: null }));
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.sessionName.trim()) {
      nextErrors.sessionName = "Session Title is required";
    }
    if (!form.speakerId) {
      nextErrors.speakerId = "Speaker is required";
    }
    if (form.dayOfWeek && !DATE_REGEX.test(form.dayOfWeek)) {
      nextErrors.dayOfWeek = "Invalid Date Format";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const sessionDto = {
      sessionName: form.sessionName,
      topic: form.topic,
      speakerId: form.speakerId,
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime,
      endTime: form.endTime,
      roomNote: form.roomNote,
    };

    if (isEditMode) {
      const result = await dispatch(
        updateSession({ id: initialValues.id, sessionDto })
      );
      if (updateSession.fulfilled.match(result)) {
        message.success("Item updated via PUT");
        onClose();
      }
    } else {
      const result = await dispatch(createSession(sessionDto));
      if (createSession.fulfilled.match(result)) {
        message.success("Session created successfully.");
        resetForm();
        onClose();
      }
    }
  };

  return (
    <Modal
      open={open}
      title={isEditMode ? "Edit Session" : "Create New Session"}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <label>
          <span style={{ color: "#ff4d4f" }}>*</span> Session Title
        </label>
        <Input
          placeholder="Session Title"
          value={form.sessionName}
          onChange={handleChange("sessionName")}
          required
        />
        {errors.sessionName && (
          <div style={{ color: "#ff4d4f" }}>{errors.sessionName}</div>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Topic</label>
        <Input
          placeholder="Topic"
          value={form.topic}
          onChange={handleChange("topic")}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>
          <span style={{ color: "#ff4d4f" }}>*</span> Speaker
        </label>
        <Select
          placeholder="Select a speaker"
          style={{ width: "100%" }}
          value={form.speakerId}
          onChange={(value) => setForm((prev) => ({ ...prev, speakerId: value }))}
          options={speakers.map((sp) => ({ value: sp.id, label: sp.name }))}
        />
        {errors.speakerId && (
          <div style={{ color: "#ff4d4f" }}>{errors.speakerId}</div>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Date</label>
        <DatePicker
          className="session-date-picker"
          style={{ width: "100%" }}
          format="DD/MM/YYYY"
          placeholder="Select session date"
          value={form.dayOfWeek && DATE_REGEX.test(form.dayOfWeek) ? dayjs(form.dayOfWeek, "YYYY-MM-DD") : null}
          onChange={(selectedDate) => {
            setForm((prev) => ({
              ...prev,
              dayOfWeek: selectedDate ? selectedDate.format("YYYY-MM-DD") : "",
            }));
            setErrors((prev) => ({ ...prev, dayOfWeek: null }));
          }}
          onBlur={handleDateBlur}
        />
        {errors.dayOfWeek && (
          <div style={{ color: "#ff4d4f" }}>{errors.dayOfWeek}</div>
        )}
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="startTime">Time</label>
          <Input
            id="startTime"
            type="time"
            placeholder="e.g 09:00 AM"
            value={form.startTime}
            onChange={handleChange("startTime")}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="endTime">End Time</label>
          <Input
            id="endTime"
            type="time"
            placeholder="e.g. 10:00 AM"
            value={form.endTime}
            onChange={handleChange("endTime")}
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Room Note</label>
        <Input
          placeholder="Room Note"
          value={form.roomNote}
          onChange={handleChange("roomNote")}
        />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <Button onClick={resetForm}>Reset</Button>
        <Button type="primary" block onClick={handleSubmit}>
          {isEditMode ? "Update" : "Create"}
        </Button>
      </div>
    </Modal>
  );
};

export default SessionForm;
