import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Input, Button, message, Card, Typography, Select } from "antd";
import { registerUser, clearAuthError } from "./store/slices/authSlice";
import "./Auth.css";

const { Title } = Typography;

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(
    (state) => state.auth
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearAuthError());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!username.trim()) {
      message.error("Username is required");
      return;
    }
    if (!password.trim()) {
      message.error("Password is required");
      return;
    }
    if (password !== confirmPassword) {
      message.error("Passwords do not match");
      return;
    }
    if (!role) {
      message.error("Please select a role");
      return;
    }

    dispatch(registerUser({ username: username.trim(), password, role }))
      .unwrap()
      .then(() => {
        message.success("Registration successful. Please log in.");
        navigate("/login", { state: { registered: true } });
      })
      .catch(() => {
        // The auth slice exposes the server message through the error effect.
      });
  };

  return (
    <div className="auth-page">
      <Card className="auth-card" bordered={false}>
        <div className="auth-logo" aria-hidden="true">E</div>
        <Title level={1}>Join EventSphere</Title>
        <p className="auth-intro">Create your account for the next great session.</p>
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="register-username">Username</label>
            <Input
              id="register-username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="large"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="register-password">Password</label>
            <Input.Password
              id="register-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="large"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="register-confirm-password">Confirm password</label>
            <Input.Password
              id="register-confirm-password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              size="large"
            />
          </div>
          <div className="auth-field role-field">
            <label htmlFor="register-role">Account Role</label>
            <Select
              id="register-role"
              className="role-select"
              placeholder="Select Role"
              value={role || undefined}
              onChange={setRole}
              options={[
                { value: "USER", label: "User" },
                { value: "ADMIN", label: "Admin" },
              ]}
              aria-label="Account Role"
            />
          </div>
          <Button
            className="auth-primary"
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
          >
            Register
          </Button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
