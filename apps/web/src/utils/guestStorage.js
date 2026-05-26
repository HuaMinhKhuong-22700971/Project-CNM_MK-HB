const GUEST_PC_BUILDS_KEY = "cnm_guest_pc_builds";
const GUEST_AI_CHAT_KEY = "cnm_guest_ai_chat";
const LEGACY_GUEST_BUILD_KEY = "guest_pc_build";

const DEFAULT_BUILD = {
  id: "default",
  name: "Cấu hình của tôi",
  components: {},
  totalPrice: 0,
  updatedAt: new Date().toISOString()
};

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function createBuildId() {
  return `build_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** @returns {{ activeBuildId: string, builds: Record<string, object> }} */
export function getGuestPcBuildStore() {
  const stored = safeParse(window.localStorage.getItem(GUEST_PC_BUILDS_KEY), null);
  if (stored?.builds && stored?.activeBuildId) {
    return stored;
  }

  const legacy = safeParse(window.localStorage.getItem(LEGACY_GUEST_BUILD_KEY), null);
  if (legacy?.components) {
    const migrated = {
      activeBuildId: "default",
      builds: {
        default: {
          ...DEFAULT_BUILD,
          components: legacy.components || {},
          totalPrice: Number(legacy.totalPrice || 0),
          updatedAt: new Date().toISOString()
        }
      }
    };
    setGuestPcBuildStore(migrated);
    window.localStorage.removeItem(LEGACY_GUEST_BUILD_KEY);
    return migrated;
  }

  return {
    activeBuildId: "default",
    builds: { default: { ...DEFAULT_BUILD } }
  };
}

export function setGuestPcBuildStore(store) {
  window.localStorage.setItem(GUEST_PC_BUILDS_KEY, JSON.stringify(store));
}

export function getActiveGuestBuild() {
  const store = getGuestPcBuildStore();
  return store.builds[store.activeBuildId] || store.builds.default || { ...DEFAULT_BUILD };
}

export function listGuestBuilds() {
  const store = getGuestPcBuildStore();
  return Object.values(store.builds).sort(
    (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  );
}

export function saveGuestBuild(buildPayload, name) {
  const store = getGuestPcBuildStore();
  const activeId = store.activeBuildId || "default";
  const current = store.builds[activeId] || { ...DEFAULT_BUILD, id: activeId };

  store.builds[activeId] = {
    ...current,
    name: String(name || current.name || DEFAULT_BUILD.name).trim() || DEFAULT_BUILD.name,
    components: buildPayload?.components || {},
    totalPrice: Number(buildPayload?.totalPrice || 0),
    updatedAt: new Date().toISOString()
  };

  setGuestPcBuildStore(store);
  return store.builds[activeId];
}

export function createGuestBuildSlot(name) {
  const store = getGuestPcBuildStore();
  const id = createBuildId();
  store.builds[id] = {
    id,
    name: String(name || "Cấu hình mới").trim() || "Cấu hình mới",
    components: {},
    totalPrice: 0,
    updatedAt: new Date().toISOString()
  };
  store.activeBuildId = id;
  setGuestPcBuildStore(store);
  return store.builds[id];
}

export function switchGuestBuild(buildId) {
  const store = getGuestPcBuildStore();
  if (!store.builds[buildId]) return null;
  store.activeBuildId = buildId;
  setGuestPcBuildStore(store);
  return store.builds[buildId];
}

export function deleteGuestBuild(buildId) {
  const store = getGuestPcBuildStore();
  if (Object.keys(store.builds).length <= 1) return null;
  delete store.builds[buildId];
  if (store.activeBuildId === buildId) {
    store.activeBuildId = Object.keys(store.builds)[0];
  }
  setGuestPcBuildStore(store);
  return getActiveGuestBuild();
}

export function exportGuestBuildsJson() {
  return JSON.stringify(getGuestPcBuildStore(), null, 2);
}

export function importGuestBuildsJson(rawJson) {
  const parsed = safeParse(rawJson, null);
  if (!parsed?.builds || typeof parsed.builds !== "object") {
    throw new Error("File cấu hình không hợp lệ.");
  }
  const activeBuildId = parsed.activeBuildId && parsed.builds[parsed.activeBuildId]
    ? parsed.activeBuildId
    : Object.keys(parsed.builds)[0];
  setGuestPcBuildStore({ activeBuildId, builds: parsed.builds });
  return getActiveGuestBuild();
}

const DEFAULT_AI_WELCOME = {
  id: "welcome",
  role: "assistant",
  content:
    "Xin chào! Tôi là **AI Tư Vấn PC** của PC Mall. 🤖\n\nTôi có thể tư vấn cấu hình, so sánh linh kiện, hoặc nếu cần, bạn có thể chọn **📞 Gặp nhân viên tư vấn** để được hỗ trợ trực tiếp.\n\nBạn muốn hỏi về điều gì?",
  buildData: null,
  createdAt: new Date().toISOString()
};

export function getGuestAiChatMessages() {
  const stored = safeParse(window.localStorage.getItem(GUEST_AI_CHAT_KEY), null);
  if (Array.isArray(stored) && stored.length > 0) return stored;
  return [DEFAULT_AI_WELCOME];
}

export function setGuestAiChatMessages(messages) {
  const trimmed = Array.isArray(messages) ? messages.slice(-80) : [DEFAULT_AI_WELCOME];
  window.localStorage.setItem(GUEST_AI_CHAT_KEY, JSON.stringify(trimmed));
}

export function clearGuestAiChatMessages() {
  window.localStorage.removeItem(GUEST_AI_CHAT_KEY);
  return [DEFAULT_AI_WELCOME];
}
