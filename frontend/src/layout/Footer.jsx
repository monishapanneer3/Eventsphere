import React from "react";

const Footer = () => {
  return (
    <footer className="eventsphere-footer">
      <strong>EventSphere</strong>
      <span>&copy; {new Date().getFullYear()} &mdash; conference management made simple.</span>
    </footer>
  );
};

export default Footer;
