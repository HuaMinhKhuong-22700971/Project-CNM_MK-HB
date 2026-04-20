import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../../hooks/useAuth";
import { changeAdminUserStatus, getAdminUsers } from "../../services/admin-users.service";

const STATUS_OPTIONS = ["ACTIVE", "BLOCKED", "INACTIVE"];

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return error.message || fallbackMessage;
}

function normalizeUsersResponse(response) {
  const payload = response?.data || response;

  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload?.items) ? payload.items : [];
}

function normalizeUser(user) {
  return {
    id: user?.id,
    fullName: user?.fullName || user?.full_name || user?.name || "",
    email: user?.email || "",
    role: String(user?.role || "CUSTOMER").toUpperCase(),
    status: String(user?.status || "ACTIVE").toUpperCase(),
    createdAt: user?.createdAt || user?.created_at || null
  };
}

function getStatusStyle(status) {
  if (status === "ACTIVE") {
    return { background: "rgba(15, 76, 63, 0.12)", color: "#0f4c3f" };
  }

  if (status === "BLOCKED") {
    return { background: "rgba(185, 28, 28, 0.12)", color: "#991b1b" };
  }

  return { background: "rgba(95, 108, 106, 0.12)", color: "#5f6c6a" };
}

const panelStyle = {
  padding: 24,
  borderRadius: 28,
  border: "1px solid var(--color-line)",
  background: "rgba(255, 255, 255, 0.88)",
  boxShadow: "var(--shadow-soft)",
  backdropFilter: "blur(14px)"
};

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: 16,
  border: "1px solid var(--color-line)",
  background: "#fffdf9",
  color: "var(--color-ink)",
  font: "inherit"
};

export function AdminUsersPage() {
  const { authState, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isAdmin = String(authState?.user?.role || "").toUpperCase() === "ADMIN";

  const filteredUsers = useMemo(() => {
    const normalizedKeyword = String(searchKeyword || "").trim().toLowerCase();

    if (!normalizedKeyword) {
      return users;
    }

    return users.filter((user) => {
      const haystack = [user.fullName, user.email].join(" ").toLowerCase();
      return haystack.includes(normalizedKeyword);
    });
  }, [searchKeyword, users]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setLoading(false);
      return;
    }

    async function loadUsers() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getAdminUsers({ keyword: searchKeyword || undefined, page: 1, limit: 100 });
        setUsers(normalizeUsersResponse(response).map(normalizeUser));
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Không thể tải danh sách người dùng."));
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [isAdmin, isAuthenticated, searchKeyword]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearchKeyword(keyword);
  }

  async function handleChangeStatus(user, nextStatus) {
    if (!nextStatus || nextStatus === user.status) {
      return;
    }

    try {
      setStatusLoadingId(user.id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await changeAdminUserStatus(user.id, nextStatus);
      const updatedUser = normalizeUser(response?.data || response);

      setUsers((prevState) => prevState.map((item) => (item.id === updatedUser.id ? updatedUser : item)));
      setSuccessMessage(`Đã đổi trạng thái tài khoản sang ${nextStatus}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể cập nhật trạng thái tài khoản."));
    } finally {
      setStatusLoadingId(null);
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ ...panelStyle, display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 34 }}>Quản lý người dùng</h1>
        <p style={{ margin: 0, color: "var(--color-muted)", lineHeight: 1.7 }}>
          Bạn cần đăng nhập bằng tài khoản ADMIN để truy cập khu vực này.
        </p>
        <div>
          <Link to="/login" style={{ color: "var(--color-accent)", fontWeight: 700 }}>Đi đến trang đăng nhập</Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ ...panelStyle, display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 34 }}>Quản lý người dùng</h1>
        <p style={{ margin: 0, color: "#991b1b", lineHeight: 1.7 }}>
          Chỉ tài khoản ADMIN mới được phép vào trang quản trị người dùng.
        </p>
        <div>
          <Link to="/" style={{ color: "var(--color-accent)", fontWeight: 700 }}>Quay về cửa hàng</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section
        style={{
          ...panelStyle,
          display: "grid",
          gap: 10,
          background: "linear-gradient(135deg, rgba(15, 76, 63, 0.08), rgba(255, 248, 237, 0.95))"
        }}
      >
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--color-muted)" }}>
          Quản trị người dùng
        </div>
        <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.02 }}>Tài khoản và quyền truy cập</h1>
        <p style={{ margin: 0, maxWidth: 760, color: "var(--color-muted)", lineHeight: 1.8 }}>
          Theo dõi nhanh danh sách tài khoản, vai trò, trạng thái và thời điểm tạo để giải thích luồng phân quyền một cách rõ ràng khi demo.
        </p>
      </section>

      {errorMessage ? (
        <div style={{ padding: 16, borderRadius: 18, background: "rgba(185, 28, 28, 0.08)", border: "1px solid rgba(185, 28, 28, 0.16)", color: "#991b1b" }}>
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div style={{ padding: 16, borderRadius: 18, background: "rgba(15, 76, 63, 0.08)", border: "1px solid rgba(15, 76, 63, 0.16)", color: "#0f4c3f" }}>
          {successMessage}
        </div>
      ) : null}

      <section style={{ ...panelStyle, display: "grid", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 30 }}>Danh sách người dùng</h2>
            <div style={{ color: "var(--color-muted)", lineHeight: 1.7 }}>
              Tìm theo họ tên hoặc email, sau đó đổi trạng thái ngay trên bảng danh sách.
            </div>
          </div>
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên hoặc email"
              style={{ ...inputStyle, minWidth: 320 }}
            />
            <button
              type="submit"
              style={{
                padding: "13px 18px",
                borderRadius: 16,
                border: "none",
                background: "var(--color-ink)",
                color: "#ffffff",
                fontWeight: 700
              }}
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {loading ? (
          <div style={{ padding: 20, borderRadius: 18, background: "rgba(255, 248, 237, 0.8)", color: "var(--color-muted)" }}>
            Đang tải danh sách người dùng...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: 20, borderRadius: 18, background: "rgba(255, 248, 237, 0.8)", color: "var(--color-muted)" }}>
            Không tìm thấy người dùng phù hợp.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-line)", color: "var(--color-muted)", textTransform: "uppercase", fontSize: 12, letterSpacing: "0.08em" }}>
                  <th style={{ padding: "12px 10px" }}>Người dùng</th>
                  <th style={{ padding: "12px 10px" }}>Email</th>
                  <th style={{ padding: "12px 10px" }}>Vai trò</th>
                  <th style={{ padding: "12px 10px" }}>Trạng thái</th>
                  <th style={{ padding: "12px 10px" }}>Ngày tạo</th>
                  <th style={{ padding: "12px 10px" }}>Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const statusStyle = getStatusStyle(user.status);

                  return (
                    <tr key={user.id} style={{ borderBottom: "1px solid rgba(214, 208, 196, 0.7)" }}>
                      <td style={{ padding: "16px 10px", fontWeight: 800 }}>{user.fullName || "Chưa cập nhật"}</td>
                      <td style={{ padding: "16px 10px", color: "var(--color-muted)" }}>{user.email || "-"}</td>
                      <td style={{ padding: "16px 10px" }}>
                        <span style={{ display: "inline-flex", padding: "7px 12px", borderRadius: 999, background: "rgba(201, 169, 97, 0.16)", color: "#855d14", fontSize: 12, fontWeight: 800 }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: "16px 10px" }}>
                        <span style={{ display: "inline-flex", padding: "7px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800, ...statusStyle }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ padding: "16px 10px", color: "var(--color-muted)" }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleString("vi-VN") : "-"}
                      </td>
                      <td style={{ padding: "16px 10px" }}>
                        <select
                          value={user.status}
                          onChange={(event) => handleChangeStatus(user, event.target.value)}
                          disabled={statusLoadingId === user.id}
                          style={{ ...inputStyle, minWidth: 170, opacity: statusLoadingId === user.id ? 0.72 : 1 }}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
