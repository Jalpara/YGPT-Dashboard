"use client";

import { useEffect, useState } from "react";
import { events as sampleEvents } from "@/lib/sample-data";

export type EventData = typeof sampleEvents;

export function useEventsData() {
  const [data, setData] = useState<EventData>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheKey = "ygpt-events-cache";
  const cacheTtlMs = 5 * 60 * 1000;

  useEffect(() => {
    let alive = true;
    const load = async (force = false) => {
      if (!force) {
        try {
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached) as {
              timestamp: number;
              data: EventData;
            };
            if (Date.now() - parsed.timestamp < cacheTtlMs) {
              setData(parsed.data);
              setLoading(false);
              setHasLoaded(true);
              return;
            }
          }
        } catch {
          // Ignore cache errors.
        }
      }
      try {
        const response = await fetch("/api/events");
        const payload = await response.json();
        if (!response.ok) {
          const message =
            typeof payload?.error === "string"
              ? payload.error
              : "Failed to load events.";
          if (alive) setError(message);
        } else if (alive && Array.isArray(payload.data)) {
          setData(payload.data);
          try {
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({ timestamp: Date.now(), data: payload.data })
            );
          } catch {
            // Ignore cache errors.
          }
          setError(null);
        }
      } catch {
        if (alive) setError("Failed to load events.");
      } finally {
        if (alive) {
          setHasLoaded(true);
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [cacheTtlMs]);

  const refresh = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await (async () => {
      const alive = true;
      try {
        const response = await fetch("/api/events");
        const payload = await response.json();
        if (!response.ok) {
          const message =
            typeof payload?.error === "string"
              ? payload.error
              : "Failed to load events.";
          if (alive) setError(message);
        } else if (alive && Array.isArray(payload.data)) {
          setData(payload.data);
          try {
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({ timestamp: Date.now(), data: payload.data })
            );
          } catch {
            // Ignore cache errors.
          }
          setError(null);
        }
      } catch {
        if (alive) setError("Failed to load events.");
      } finally {
        if (alive) {
          setHasLoaded(true);
          setLoading(false);
        }
      }
    })();
  };

  return { data, loading, hasLoaded, error, refresh };
}
