const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, '../apps/web/src/pages/public/PcBuilderPage.jsx');
let code = fs.readFileSync(pageFile, 'utf8');

// 1. Add state
const targetState = `  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);`;
const newState = `  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);
  const [userBuildsHistory, setUserBuildsHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);`;

code = code.replace(targetState, newState);

// 2. Add useEffect to fetch user build history
const targetEffect = `  /* Handlers */`;
const newEffect = `  /* Fetch User Saved Builds History for Authenticated Users */
  useEffect(() => {
    if (!isAuthenticated) {
      setUserBuildsHistory([]);
      return;
    }
    let isMounted = true;
    async function fetchHistory() {
      setIsHistoryLoading(true);
      try {
        const res = await httpClient.get("/pc-builder/my-builds");
        const data = res.data?.data || res.data;
        if (isMounted && Array.isArray(data)) {
          setUserBuildsHistory(data);
        }
      } catch (err) {
        console.warn("Failed to fetch user build history:", err);
      } finally {
        if (isMounted) setIsHistoryLoading(false);
      }
    }
    fetchHistory();
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  /* Handlers */`;

code = code.replace(targetEffect, newEffect);

// 3. Render User Build History in Sidebar
const targetSidebarEnd = `            {!isAuthenticated && guestBuildList.length > 0 && (
              <>
                <div className="sidebar-divider" />
                <div className="sidebar-section-header">
                  <span className="sidebar-section-title">Build đã lưu</span>
                </div>
                <div className="sidebar-guest-builds">
                  {guestBuildList.slice(0, 3).map((slot) => (
                    <button key={slot.id} type="button" className="sidebar-guest-slot" onClick={() => actions.loadGuestBuildById(slot.id)}>
                      📋 {slot.name}
                    </button>
                  ))}
                  <button type="button" className="btn-new-build" onClick={() => actions.createNewGuestBuild()}>
                    + Tạo build mới
                  </button>
                </div>
              </>
            )}`;

const newSidebarEnd = `            {!isAuthenticated && guestBuildList.length > 0 && (
              <>
                <div className="sidebar-divider" />
                <div className="sidebar-section-header">
                  <span className="sidebar-section-title">Build đã lưu</span>
                </div>
                <div className="sidebar-guest-builds">
                  {guestBuildList.slice(0, 3).map((slot) => (
                    <button key={slot.id} type="button" className="sidebar-guest-slot" onClick={() => actions.loadGuestBuildById(slot.id)}>
                      📋 {slot.name}
                    </button>
                  ))}
                  <button type="button" className="btn-new-build" onClick={() => actions.createNewGuestBuild()}>
                    + Tạo build mới
                  </button>
                </div>
              </>
            )}

            {/* Authenticated User Saved Builds History */}
            {isAuthenticated && (
              <>
                <div className="sidebar-divider" />
                <div className="sidebar-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="sidebar-section-title">📂 Lịch Sử Cấu Hình</span>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>({userBuildsHistory.length})</span>
                </div>

                {isHistoryLoading ? (
                  <div style={{ padding: "10px", fontSize: "12px", color: "#64748b" }}>Đang tải lịch sử...</div>
                ) : userBuildsHistory.length === 0 ? (
                  <div style={{ padding: "10px", fontSize: "11.5px", color: "#94a3b8", fontStyle: "italic" }}>
                    Chưa có cấu hình nào được lưu trong tài khoản.
                  </div>
                ) : (
                  <div className="sidebar-user-builds" style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                    {userBuildsHistory.slice(0, 4).map((b) => (
                      <div
                        key={b.id || b.build_id}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "10px",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          fontSize: "12px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: "12.5px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" }}>
                            {b.name || b.title || \`Build #\${b.id}\`}
                          </strong>
                          <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#e2e8f0", fontWeight: "700", color: "#475569" }}>
                            {b.status || "SAVED"}
                          </span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>
                            {b.createdAt ? new Date(b.createdAt).toLocaleDateString("vi-VN") : "Gần đây"}
                          </span>
                          <strong style={{ color: "#2563eb", fontSize: "12px" }}>
                            {formatCurrency(b.totalPrice || b.total_price || 0)}đ
                          </strong>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyCandidateBuild(b)}
                          style={{
                            marginTop: "8px",
                            width: "100%",
                            padding: "5px",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            backgroundColor: "#ffffff",
                            fontSize: "11.5px",
                            fontWeight: "700",
                            color: "#1e40af",
                            cursor: "pointer"
                          }}
                        >
                          ↺ Nạp Lại Cấu Hình Này
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}`;

code = code.replace(targetSidebarEnd, newSidebarEnd);

fs.writeFileSync(pageFile, code, 'utf8');
console.log('✅ Successfully integrated User Build History into PcBuilderPage.jsx!');
