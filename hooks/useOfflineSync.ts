"use client";

import { get, set, del } from "idb-keyval";
import { useCallback, useEffect, useState } from "react";

const QUEUE_KEY = "geoattend-pending-checkins";

export type PendingCheckIn = {
  id: string;
  payload: Record<string, unknown>;
  createdAt: number;
  attempts: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function useOfflineSync() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const enqueue = useCallback(async (payload: Record<string, unknown>) => {
    const list = ((await get(QUEUE_KEY)) as PendingCheckIn[] | undefined) ?? [];
    const item: PendingCheckIn = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      payload,
      createdAt: Date.now(),
      attempts: 0,
    };
    list.push(item);
    await set(QUEUE_KEY, list);
    return item.id;
  }, []);

  const flushQueue = useCallback(async () => {
    const list = ((await get(QUEUE_KEY)) as PendingCheckIn[] | undefined) ?? [];
    if (!list.length) return;
    const remaining: PendingCheckIn[] = [];
    for (const item of list) {
      try {
        const res = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.payload),
        });
        if (!res.ok) throw new Error("bad status");
      } catch {
        const nextAttempt = item.attempts + 1;
        const backoff = Math.min(60_000, 1000 * 2 ** Math.min(nextAttempt, 6));
        await sleep(backoff);
        remaining.push({ ...item, attempts: nextAttempt });
      }
    }
    if (remaining.length) await set(QUEUE_KEY, remaining);
    else await del(QUEUE_KEY);
  }, []);

  useEffect(() => {
    if (online) {
      void flushQueue();
    }
  }, [online, flushQueue]);

  return { online, enqueue, flushQueue };
}
