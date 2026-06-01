import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

import { useAuth } from "../hooks/useAuth";
import { httpClient } from "../services/http";
import {
  addBuildItem,
  checkRawCompatibility,
  createBuild,
  removeBuildItem,
  saveBuild,
  suggestBuild as apiSuggestBuild
} from "../services/pc-builder.service";
import {
  createGuestBuildSlot,
  deleteGuestBuild,
  exportGuestBuildsJson,
  getActiveGuestBuild,
  getGuestPcBuildStore,
  importGuestBuildsJson,
  listGuestBuilds,
  saveGuestBuild,
  setGuestPcBuildStore,
  switchGuestBuild
} from "../utils/guestStorage";

export function usePcBuilder(initialBuildName = "Cấu hình của tôi") {
  const { isAuthenticated } = useAuth();

  const [buildName, setBuildName] = useState(initialBuildName);
  const [build, setBuild] = useState(null);
  const [guestBuild, setGuestBuild] = useState(() => getActiveGuestBuild());
  const [guestBuildList, setGuestBuildList] = useState(() => listGuestBuilds());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [compatibility, setCompatibility] = useState(null);
  const [suggestion, setSuggestion] = useState(null);

  const activeBuild = useMemo(() => (isAuthenticated ? build : guestBuild), [isAuthenticated, build, guestBuild]);
  const totalPrice = useMemo(() => Number(activeBuild?.totalPrice || 0), [activeBuild]);
  const selectedItems = useMemo(() => activeBuild?.components || {}, [activeBuild]);
  const selectedCount = useMemo(() => Object.keys(selectedItems).length, [selectedItems]);

  const refreshGuestBuildState = useCallback(() => {
    setGuestBuild(getActiveGuestBuild());
    setGuestBuildList(listGuestBuilds());
  }, []);

  const showSuccess = useCallback((msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  }, []);

  const handleError = useCallback((err, fallback) => {
    const msg = axios.isAxiosError(err)
      ? (err.response?.data?.message || err.response?.data?.error || fallback)
      : (err?.message || fallback);
    setError(msg);
  }, []);

  const fetchCurrentBuild = useCallback(async () => {
    if (!isAuthenticated) {
      refreshGuestBuildState();
      return getActiveGuestBuild();
    }
    try {
      const res = await httpClient.get("/pc-builder/current");
      const data = res?.data?.data || res?.data || res;
      if (data?.id) setBuild(data);
      return data;
    } catch (_err) {
      // silent
      return null;
    }
  }, [isAuthenticated, refreshGuestBuildState]);

  const ensureBuild = useCallback(async () => {
    if (build?.id) return build;
    const resp = await createBuild({ name: buildName.trim() || "Cấu hình mới" });
    const nextBuild = resp?.data?.data || resp?.data || resp;
    setBuild(nextBuild);
    return nextBuild;
  }, [build, buildName]);

  const persistGuestBuild = useCallback((nextComponents, nextTotal) => {
    const saved = saveGuestBuild(
      { components: nextComponents, totalPrice: nextTotal },
      buildName
    );
    setGuestBuild(saved);
    setGuestBuildList(listGuestBuilds());
    return saved;
  }, [buildName]);

  const applyComponent = async (componentType, variantId, product, variants) => {
    setLoading(true);
    setError("");
    try {
      if (isAuthenticated) {
        const currentBuild = await ensureBuild();
        const resp = await addBuildItem(currentBuild.id, {
          productVariantId: Number(variantId),
          componentType
        });
        setBuild(resp?.data?.data || resp?.data || resp);
      } else {
        const variant = variants.find((v) => String(v.variant_id) === String(variantId));
        setGuestBuild((current) => {
          const currentComponents = current?.components || {};
          const newComponents = { ...currentComponents, [componentType]: { product, variant } };
          const newTotal = Object.values(newComponents).reduce((sum, item) => sum + Number(item.variant?.price || 0), 0);
          const saved = saveGuestBuild(
            { components: newComponents, totalPrice: newTotal },
            buildName
          );
          setGuestBuildList(listGuestBuilds());
          return saved;
        });
      }
      setCompatibility(null);
      showSuccess(`Đã thêm ${componentType.toUpperCase()} thành công.`);
    } catch (err) {
      handleError(err, "Không thể thêm linh kiện.");
    } finally {
      setLoading(false);
    }
  };

  const removeComponent = async (componentType) => {
    setLoading(true);
    setError("");
    try {
      if (isAuthenticated && build?.id) {
        const resp = await removeBuildItem(build.id, componentType);
        setBuild(resp?.data?.data || resp?.data || resp);
      } else {
        setGuestBuild((current) => {
          const currentComponents = { ...(current?.components || {}) };
          delete currentComponents[componentType];
          const newTotal = Object.values(currentComponents).reduce((sum, item) => sum + Number(item.variant?.price || 0), 0);
          const saved = saveGuestBuild(
            { components: currentComponents, totalPrice: newTotal },
            buildName
          );
          setGuestBuildList(listGuestBuilds());
          return saved;
        });
      }
      setCompatibility(null);
      showSuccess(`Đã xóa ${componentType.toUpperCase()}.`);
    } catch (err) {
      handleError(err, "Không thể xóa linh kiện.");
    } finally {
      setLoading(false);
    }
  };

  const checkCompatibility = async () => {
    if (selectedCount < 2) {
      setError("Cần ít nhất 2 linh kiện để kiểm tra.");
      return;
    }
    setLoading(true);
    try {
      const components = Object.entries(selectedItems).map(([type, item]) => ({
        component_type: type,
        variant_id: item.variant?.id || item.variant?.variant_id || item.variant?.skuId
      })).filter((c) => c.variant_id);

      const resp = await checkRawCompatibility({ components });
      const result = resp?.data?.data || resp?.data || resp;
      setCompatibility(result);
      if (result?.compatible) showSuccess("Cấu hình tương thích hoàn toàn.");
    } catch (err) {
      handleError(err, "Lỗi kiểm tra tương thích.");
    } finally {
      setLoading(false);
    }
  };

  const getAiSuggestion = async (purpose, budget) => {
    setLoading(true);
    setError("");
    setSuggestion(null);
    try {
      const resp = await apiSuggestBuild({ requirements: purpose, budget });
      setSuggestion(resp?.data?.data || resp?.data || resp);
      showSuccess("AI Advisor đã tạo gợi ý.");
    } catch (err) {
      handleError(err, "Không thể tạo gợi ý AI.");
    } finally {
      setLoading(false);
    }
  };

  const commitSave = async () => {
    if (isAuthenticated) {
      if (!build?.id) {
        setError("Chưa có cấu hình để lưu.");
        return;
      }
      setLoading(true);
      try {
        await saveBuild(build.id, { name: buildName });
        showSuccess("Đã lưu lên tài khoản.");
      } catch (err) {
        handleError(err, "Lỗi khi lưu.");
      } finally {
        setLoading(false);
      }
      return;
    }

    persistGuestBuild(guestBuild.components, guestBuild.totalPrice);
    showSuccess("Đã lưu cấu hình trên trình duyệt. Đăng ký để đồng bộ lên tài khoản.");
  };

  const saveGuestBuildAs = useCallback((name) => {
    const saved = saveGuestBuild(
      { components: guestBuild.components, totalPrice: guestBuild.totalPrice },
      name || buildName
    );
    setBuildName(saved.name);
    refreshGuestBuildState();
    showSuccess("Đã lưu cấu hình khách trên trình duyệt.");
  }, [guestBuild, buildName, refreshGuestBuildState, showSuccess]);

  const createNewGuestBuild = useCallback((name) => {
    const slot = createGuestBuildSlot(name || "Cấu hình mới");
    setBuildName(slot.name);
    refreshGuestBuildState();
    showSuccess("Đã tạo cấu hình mới.");
  }, [refreshGuestBuildState, showSuccess]);

  const loadGuestBuildById = useCallback((buildId) => {
    const loaded = switchGuestBuild(buildId);
    if (!loaded) return;
    setBuildName(loaded.name);
    refreshGuestBuildState();
    showSuccess(`Đã mở: ${loaded.name}`);
  }, [refreshGuestBuildState, showSuccess]);

  const removeGuestBuildSlot = useCallback((buildId) => {
    const loaded = deleteGuestBuild(buildId);
    if (!loaded) {
      setError("Cần giữ ít nhất một cấu hình.");
      return;
    }
    setBuildName(loaded.name);
    refreshGuestBuildState();
    showSuccess("Đã xóa cấu hình đã lưu.");
  }, [refreshGuestBuildState, showSuccess]);

  const exportGuestBuilds = useCallback(() => {
    const blob = new Blob([exportGuestBuildsJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `pc-build-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showSuccess("Đã tải file cấu hình.");
  }, [showSuccess]);

  const importGuestBuilds = useCallback(async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const loaded = importGuestBuildsJson(text);
      setBuildName(loaded.name);
      refreshGuestBuildState();
      showSuccess("Đã nhập cấu hình từ file.");
    } catch (err) {
      handleError(err, "Không thể nhập file cấu hình.");
    }
  }, [refreshGuestBuildState, showSuccess, handleError]);

  const clearAll = () => {
    if (!confirm("Xóa toàn bộ cấu hình?")) return;
    if (isAuthenticated) {
      setBuild((prev) => (prev ? { ...prev, components: {}, totalPrice: 0 } : null));
    } else {
      const store = getGuestPcBuildStore();
      store.builds[store.activeBuildId] = {
        ...store.builds[store.activeBuildId],
        components: {},
        totalPrice: 0,
        updatedAt: new Date().toISOString()
      };
      setGuestPcBuildStore(store);
      refreshGuestBuildState();
    }
    setCompatibility(null);
    setSuggestion(null);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      refreshGuestBuildState();
    }
  }, [isAuthenticated, refreshGuestBuildState]);

  useEffect(() => {
    fetchCurrentBuild();
  }, [fetchCurrentBuild]);

  return {
    buildName,
    setBuildName,
    activeBuild,
    totalPrice,
    selectedItems,
    selectedCount,
    guestBuildList,
    loading,
    error,
    success,
    compatibility,
    suggestion,
    actions: {
      applyComponent,
      removeComponent,
      checkCompatibility,
      getAiSuggestion,
      commitSave,
      clearAll,
      saveGuestBuildAs,
      createNewGuestBuild,
      loadGuestBuildById,
      removeGuestBuildSlot,
      exportGuestBuilds,
      importGuestBuilds,
      refreshCurrentBuild: fetchCurrentBuild,
      setSuggestion,
      setError
    }
  };
}
