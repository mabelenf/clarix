"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("clarix_cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("clarix_cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("clarix_cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#1a1a1a",
        color: "#fff",
        padding: "16px 24px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        zIndex: 9999,
        fontSize: "14px",
      }}
    >
      <span style={{ maxWidth: "600px" }}>
        We use cookies to improve your experience on CLARIX. By continuing,
        you agree to our use of cookies.
      </span>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={decline}
          style={{
            background: "transparent",
            border: "1px solid #fff",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Decline
        </button>
        <button
          onClick={accept}
          style={{
            background: "#4CAF50",
            border: "none",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
