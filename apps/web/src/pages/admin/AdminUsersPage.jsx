import { useEffect, useMemo, useState } from "react";

import {
  AdminAlerts,
  AdminBadge,
  AdminBtn,
  AdminCard,
  AdminEmpty,
  AdminPage,
  AdminPageHead,
  AdminTableWrap,
  useAdminToast
} from "../../components/admin/AdminUi";
import { changeAdminUserStatus, getAdminUsers } from "../../services/admin-users.service";
import {
  formatAdminDateTime,
  getAdminErrorMessage,
  getRoleMeta,
  getStatusMeta,
  normalizeAdminList
} from "../../utils/adminUi";

const STATUS_OPTIONS = ["ACTIVE", "BLOCKED", "INACTIVE"];

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

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useAdminToast(successMessage, () => setSuccessMessage(""));

  const filteredUsers = useMemo(() => {
    const q = searchKeyword.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => [u.fullName, u.email, u.role].join(" ").toLowerCase().includes(q));
  }, [searchKeyword, users]);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getAdminUsers({ keyword: searchKeyword || undefined, page: 1, limit: 200 });
        setUsers(normalizeAdminList(response).map(normalizeUser));
      } catch (error) {
        setErrorMessage(getAdminErrorMessage(error, "Không thể tải danh sách người dùng."));
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [searchKeyword]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearchKeyword(keyword);
  }

  async function handleChangeStatus(user, nextStatus) {
    if (!nextStatus || nextStatus === user.status) return;
    try {
      setStatusLoadingId(user.id);
      setErrorMessage("");
      const response = await changeAdminUserStatus(user.id, nextStatus);
      const updated = normalizeUser(response?.data || response);
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSuccessMessage(`Đã đổi trạng thái sang ${getStatusMeta(nextStatus).label}.`);
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, "Không thể cập nhật trạng thái."));
    } finally {
      setStatusLoadingId(null);
    }
  }

  const roleStats = useMemo(() => {
    const counts = {};
    users.forEach((u) => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });
    return counts;
  }, [users]);

  return (
    <AdminPage>
      <AdminPageHead
        eyebrow="Quản trị người dùng"
        title="Tài khoản & phân quyền"
        description="Theo dõi vai trò CUSTOMER, SALES_STAFF, TECH_STAFF, ADMIN và khóa/mở tài khoản khi cần."
      />

      <AdminAlerts errorMessage={errorMessage} successMessage={successMessage} />

      <section className="admin-metrics">
        <div className="admin-metric">
          <span>Tổng tài khoản</span>
          <strong>{users.length}</strong>
        </div>
        {Object.entries(roleStats).map(([role, count]) => (
          <div key={role} className="admin-metric">
            <span>{getRoleMeta(role).label}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </section>

      <AdminCard>
        <div className="admin-panel-head">
          <div className="admin-section-title">
            <h3>Danh sách người dùng</h3>
            <p>Tìm theo họ tên hoặc email, đổi trạng thái trực tiếp trên bảng.</p>
          </div>
          <form onSubmit={handleSearchSubmit} className="admin-search-row">
            <input
              className="admin-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên hoặc email"
            />
            <AdminBtn type="submit" variant="dark">
              Tìm kiếm
            </AdminBtn>
          </form>
        </div>

        {loading ? (
          <AdminEmpty>Đang tải…</AdminEmpty>
        ) : filteredUsers.length === 0 ? (
          <AdminEmpty>Không tìm thấy người dùng phù hợp.</AdminEmpty>
        ) : (
          <AdminTableWrap>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const roleMeta = getRoleMeta(user.role);
                  const statusMeta = getStatusMeta(user.status);
                  return (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.fullName || "Chưa cập nhật"}</strong>
                      </td>
                      <td>{user.email || "—"}</td>
                      <td>
                        <AdminBadge tone={roleMeta.tone}>{roleMeta.label}</AdminBadge>
                      </td>
                      <td>
                        <AdminBadge tone={statusMeta.tone}>{statusMeta.label}</AdminBadge>
                      </td>
                      <td>{formatAdminDateTime(user.createdAt)}</td>
                      <td>
                        <select
                          className="admin-input"
                          value={user.status}
                          onChange={(e) => handleChangeStatus(user, e.target.value)}
                          disabled={statusLoadingId === user.id}
                          style={{ minWidth: 140 }}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {getStatusMeta(status).label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </AdminTableWrap>
        )}
      </AdminCard>
    </AdminPage>
  );
}
