import React from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import { LockOutlined } from "@ant-design/icons";

const AccessDenied = () => (
  <section className="access-denied">
    <div className="access-denied-card">
      <div className="access-denied-icon"><LockOutlined /></div>
      <p className="management-eyebrow">EventSphere security</p>
      <strong className="access-code">403</strong>
      <h1>Access restricted</h1>
      <p>You don't have permission to access this section. Return to your dashboard to continue exploring the conference.</p>
      <Link to="/"><Button type="primary">Back to Dashboard</Button></Link>
    </div>
  </section>
);

export default AccessDenied;