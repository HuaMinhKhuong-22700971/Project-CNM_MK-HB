import { createBuild, addBuildItem, saveBuild } from "../services/pc-builder.service";
import { getGuestPcBuildStore, setGuestPcBuildStore } from "./guestStorage";

/**
 * Đồng bộ cấu hình PC khách (localStorage) lên tài khoản sau đăng nhập/đăng ký.
 */
export async function migrateGuestBuildsToAccount() {
  const store = getGuestPcBuildStore();
  const builds = Object.values(store.builds || {});
  let migrated = 0;

  for (const guestBuild of builds) {
    const components = guestBuild?.components || {};
    const entries = Object.entries(components);
    if (entries.length === 0) continue;

    try {
      const created = await createBuild({ name: guestBuild.name || "Cấu hình đã nhập" });
      const build = created?.data?.data || created?.data || created;
      if (!build?.id) continue;

      for (const [componentType, item] of entries) {
        const variantId =
          item?.variant?.variant_id ||
          item?.variant?.id ||
          item?.variant?.skuId;
        if (!variantId) continue;
        await addBuildItem(build.id, {
          componentType,
          productVariantId: Number(variantId)
        });
      }

      await saveBuild(build.id, { name: guestBuild.name || "Cấu hình đã nhập" });
      migrated += 1;
    } catch (error) {
      console.warn("[migrateGuestBuilds]", guestBuild?.name, error);
    }
  }

  if (migrated > 0) {
    const activeId = store.activeBuildId || "default";
    setGuestPcBuildStore({
      activeBuildId: activeId,
      builds: {
        [activeId]: {
          id: activeId,
          name: "Cấu hình của tôi",
          components: {},
          totalPrice: 0,
          updatedAt: new Date().toISOString()
        }
      }
    });
  }

  return { migrated };
}

export async function runCustomerOnboarding() {
  const buildResult = await migrateGuestBuildsToAccount();
  return {
    buildsMigrated: buildResult.migrated
  };
}
