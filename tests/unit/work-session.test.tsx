import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { WorkSessionProvider, useWorkSession } from "@/context/work-session-context";

describe("Work Session Lifecycle & Odometer Logic", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to offline state", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WorkSessionProvider>{children}</WorkSessionProvider>
    );

    const { result } = renderHook(() => useWorkSession(), { wrapper });
    expect(result.current.status).toBe("offline");
    expect(result.current.activeSession).toBeNull();
  });

  it("starts online session when valid odometer is provided", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WorkSessionProvider>{children}</WorkSessionProvider>
    );

    const { result } = renderHook(() => useWorkSession(), { wrapper });

    await act(async () => {
      const res = await result.current.goOnline(12500);
      expect(res.success).toBe(true);
    });

    expect(result.current.status).toBe("online");
    expect(result.current.activeSession?.startingOdometer).toBe(12500);
  });

  it("rejects starting odometer less than previous reading", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WorkSessionProvider>{children}</WorkSessionProvider>
    );

    const { result } = renderHook(() => useWorkSession(), { wrapper });

    // Initial lastOdometer is 12450
    await act(async () => {
      const res = await result.current.goOnline(12000);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/cannot be less than previous/i);
    });

    expect(result.current.status).toBe("offline");
  });

  it("calculates distance travelled correctly on goOffline", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WorkSessionProvider>{children}</WorkSessionProvider>
    );

    const { result } = renderHook(() => useWorkSession(), { wrapper });

    await act(async () => {
      await result.current.goOnline(12500);
    });

    await act(async () => {
      const res = await result.current.goOffline(12534.5);
      expect(res.success).toBe(true);
      expect(res.distance).toBe(34.5);
    });

    expect(result.current.status).toBe("offline");
    expect(result.current.lastOdometer).toBe(12534.5);
  });
});
