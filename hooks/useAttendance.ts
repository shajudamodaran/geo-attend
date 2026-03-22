"use client";

import { useCallback, useEffect, useState } from "react";

export function useOwnerAttendanceQuery(search: string) {
  const [data, setData] = useState<{
    rows: unknown[];
    total: number;
    page: number;
    limit: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/attendance?${search}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load attendance");
      const json = (await res.json()) as {
        rows: unknown[];
        total: number;
        page: number;
        limit: number;
      };
      setData(json);
    } catch {
      setError("Could not load attendance. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
