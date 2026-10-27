import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Input, Button, message, Card, Typography } from "antd";
import { loginUser, clearAuthError } from "./store/slices/authSlice";
import "./Auth.css";

const { Title } = Typography;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const usernameInputRef = useRef(null);

  // Focus the username field as soon as the login screen mounts.
  useEffect(() => {
    if (location.state?.registered) {
      message.success("Account created. You can now log in.");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  // Redirect to the home page once authenticated, and surface a success
  // toast per the Login spec.
  useEffect(() => {
    if (isAuthenticated) {
      message.success("Login successful");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearAuthError());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ username, password }));
  };

  return (
    <div className="auth-page">
      <Card className="auth-card" bordered={false}>
        <div className="auth-logo" aria-hidden="true">E</div>
        <Title level={1}>Welcome back</Title>
        <p className="auth-intro">Sign in to manage your conference experience.</p>
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="login-username">Username</label>
            <Input
              id="login-username"
              ref={usernameInputRef}
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="large"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <Input.Password
              id="login-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="large"
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
            Login
          </Button>
        </form>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
