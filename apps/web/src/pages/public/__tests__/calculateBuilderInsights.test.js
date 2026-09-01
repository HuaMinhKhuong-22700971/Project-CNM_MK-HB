import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateBuilderInsights, estimateProductPerformance } from "../../../utils/calculateBuilderInsights.js";

describe("Frontend Scoring Engine (calculateBuilderInsights & estimateProductPerformance)", () => {
  // Mock product helpers
  const mockCpuHigh = { id: 1, name: "Intel Core i9 14900K", price: 15000000, attributes: [{ name: "tdp", value: "125" }, { name: "socket", value: "LGA1700" }] };
  const mockCpuMid = { id: 2, name: "AMD Ryzen 5 7600X", price: 5500000, attributes: [{ name: "tdp", value: "65" }, { name: "socket", value: "AM5" }] };

  const mockGpu4K = { id: 10, name: "NVIDIA GeForce RTX 4090 24GB", price: 48000000, attributes: [{ name: "tdp", value: "450" }, { name: "length", value: "304" }] };
  const mockGpu2K = { id: 11, name: "NVIDIA GeForce RTX 4070 Super 12GB", price: 17500000, attributes: [{ name: "tdp", value: "220" }, { name: "length", value: "242" }] };
  const mockGpu1080p = { id: 12, name: "NVIDIA GeForce RTX 3060 12GB", price: 7200000, attributes: [{ name: "tdp", value: "170" }, { name: "length", value: "200" }] };

  const mockMainboardHigh = { id: 20, name: "MSI Z790 TOMAHAWK WIFI", price: 6800000, attributes: [{ name: "socket", value: "LGA1700" }, { name: "ram_slots", value: "4" }, { name: "form_factor", value: "ATX" }] };
  const mockMainboardMid = { id: 21, name: "MSI MAG B650 TOMAHAWK WIFI", price: 5400000, attributes: [{ name: "socket", value: "AM5" }, { name: "ram_slots", value: "4" }, { name: "form_factor", value: "ATX" }] };

  const mockRam32GB = { id: 30, name: "Corsair Vengeance 32GB (2x16GB) DDR5", price: 3200000, attributes: [{ name: "memory type", value: "DDR5" }] };
  const mockPsu1000W = { id: 40, name: "Corsair RM1000x 1000W 80 Plus Gold", price: 4500000, attributes: [{ name: "watt", value: "1000" }] };
  const mockCooling360 = { id: 50, name: "NZXT Kraken Elite 360 RGB AIO", price: 6500000, attributes: [{ name: "cooling capacity", value: "300" }] };

  // Test 1: estimateProductPerformance GPU and CPU tier rating
  it("estimates product performance score accurately for different GPU and CPU tiers", () => {
    assert.equal(estimateProductPerformance(mockGpu4K, "gpu"), 98, "RTX 4090 should score 98 in GPU performance");
    assert.equal(estimateProductPerformance(mockGpu2K, "gpu"), 80, "RTX 4070 should score 80 in GPU performance");
    assert.equal(estimateProductPerformance(mockGpu1080p, "gpu"), 64, "RTX 3060 should score 64 in GPU performance");
    assert.equal(estimateProductPerformance(mockCpuHigh, "cpu"), 96, "Core i9 14900K should score 96 in CPU performance");
    assert.equal(estimateProductPerformance(mockCpuMid, "cpu"), 76, "Ryzen 5 7600X should score 76 in CPU performance");
  });

  // Test 2: FPS Estimates for Different Resolutions (1080p, 2K, 4K)
  it("computes accurate FPS estimates scaling across 1080p, 2K, and 4K resolutions", () => {
    const selectedItems4K = {
      cpu: mockCpuHigh,
      gpu: mockGpu4K
    };

    const insights1080p = calculateBuilderInsights(selectedItems4K, 2, { resolution: "1080p" });
    const insights2K    = calculateBuilderInsights(selectedItems4K, 2, { resolution: "2k" });
    const insights4K    = calculateBuilderInsights(selectedItems4K, 2, { resolution: "4k" });

    assert.ok(insights1080p.fps > insights2K.fps, "1080p FPS should be strictly higher than 2K FPS");
    assert.ok(insights2K.fps > insights4K.fps, "2K FPS should be strictly higher than 4K FPS");
    assert.equal(Math.round(insights1080p.fps * 0.7), insights2K.fps);
    assert.equal(Math.round(insights1080p.fps * 0.45), insights4K.fps);
  });

  // Test 3: FPS Scale for Different GPU Tiers (RTX 4090 vs RTX 4070 vs RTX 3060)
  it("scales FPS estimates correctly between High Tier (4090), Mid Tier (4070), and Entry (3060)", () => {
    const items4090 = { cpu: mockCpuMid, gpu: mockGpu4K };
    const items4070 = { cpu: mockCpuMid, gpu: mockGpu2K };
    const items3060 = { cpu: mockCpuMid, gpu: mockGpu1080p };

    const fps4090 = calculateBuilderInsights(items4090, 2, { resolution: "1080p" }).fps;
    const fps4070 = calculateBuilderInsights(items4070, 2, { resolution: "1080p" }).fps;
    const fps3060 = calculateBuilderInsights(items3060, 2, { resolution: "1080p" }).fps;

    assert.ok(fps4090 > fps4070, "RTX 4090 FPS must exceed RTX 4070 FPS");
    assert.ok(fps4070 > fps3060, "RTX 4070 FPS must exceed RTX 3060 FPS");
  });

  // Test 4: requirementMatchScore for Gaming 4K vs Gaming 1080p
  it("calculates requirementMatchScore based on GPU capability for 4K Gaming profile", () => {
    const itemsHigh = { cpu: mockCpuHigh, gpu: mockGpu4K, mainboard: mockMainboardHigh };
    const itemsEntry = { cpu: mockCpuMid, gpu: mockGpu1080p, mainboard: mockMainboardMid };

    const score4KHigh = calculateBuilderInsights(itemsHigh, 3, { purpose: "gaming", resolution: "4k" }).requirementMatchScore;
    const score4KEntry = calculateBuilderInsights(itemsEntry, 3, { purpose: "gaming", resolution: "4k" }).requirementMatchScore;

    assert.equal(score4KHigh, 95, "RTX 4090 should achieve 95% match for 4K Gaming");
    assert.ok(score4KEntry < 80, "RTX 3060 should have a lower match score for 4K Gaming");
  });

  // Test 5: requirementMatchScore for Content Creation / Editing (CPU & 32GB RAM)
  it("calculates requirementMatchScore for Editing profile requiring high CPU & >= 32GB RAM", () => {
    const editingBuild = {
      cpu: mockCpuHigh,
      ram: mockRam32GB,
      mainboard: mockMainboardHigh
    };

    const insights = calculateBuilderInsights(editingBuild, 3, { purpose: "editing" });
    assert.equal(insights.requirementMatchScore, 96, "High CPU + 32GB RAM kit yields 96% match score for Editing");
  });

  // Test 6: Future Need Upgrade RAM Bonus
  it("adds +5 upgradeability bonus when futureNeed is 'upgrade_ram' and Mainboard has 4 slots", () => {
    const build = { mainboard: mockMainboardMid };
    const baseScore = calculateBuilderInsights(build, 1, { purpose: "office" }).requirementMatchScore;
    const bonusScore = calculateBuilderInsights(build, 1, { purpose: "office", futureNeed: "upgrade_ram" }).requirementMatchScore;

    assert.equal(bonusScore, Math.min(99, baseScore + 5));
  });

  // Test 7: System Wattage & PSU Margin Calculation
  it("computes system power draw and warns when PSU wattage margin is under 20%", () => {
    const buildFull = {
      cpu: mockCpuHigh,            // 125W (socket LGA1700)
      mainboard: mockMainboardHigh,      // LGA1700
      gpu: mockGpu4K,              // 450W
      psu: mockPsu1000W,            // 1000W
      cooling: mockCooling360       // AIO Cooler
    };

    const insights = calculateBuilderInsights(buildFull, 5, {});
    // Power = 125 + 450 + 85 = 660W
    assert.equal(insights.power, 660);
    // PSU margin = (1000 - 660) / 1000 = 34%
    assert.equal(insights.psuMarginPercent, 34);
    assert.equal(insights.buildReadiness, "WARNINGS_ACKNOWLEDGED"); // incomplete count 5 < requiredCount 8
  });
});
