import React from "react";
import { errorLogger } from "../utils/errorLogger";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    errorLogger.captureError(error, { componentStack: errorInfo?.componentStack });
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "40px",
          maxWidth: "800px",
          margin: "40px auto",
          fontFamily: "monospace",
          backgroundColor: "#fff1f2",
          border: "2px solid #f43f5e",
          borderRadius: "16px",
          color: "#9f1239"
        }}>
          <h2 style={{ fontSize: "22px", marginBottom: "12px", color: "#e11d48" }}>
            ⚠️ Lỗi Hiển Thị Trang Web (React Runtime Error)
          </h2>
          <p style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>
            {this.state.error && this.state.error.toString()}
          </p>
          <pre style={{
            backgroundColor: "#ffe4e6",
            padding: "16px",
            borderRadius: "8px",
            overflowX: "auto",
            fontSize: "12px",
            lineHeight: "1.5"
          }}>
            {this.state.errorInfo?.componentStack || "Không có thông tin stack trace"}
          </pre>
          <button
            onClick={() => {
              window.localStorage.clear();
              window.location.reload();
            }}
            style={{
              marginTop: "16px",
              padding: "10px 20px",
              backgroundColor: "#e11d48",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            🧹 Xóa Storage & Tải Lại Trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
