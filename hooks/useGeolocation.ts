"use client";

import { useCallback, useState } from "react";

export type GeoResult =
  | { lat: number; lng: number; accuracy: number; error?: undefined }
  | { lat?: undefined; lng?: undefined; accuracy?: undefined; error: string };

export function useGeolocation() {
  const [loading, setLoading] = useState(false);

  const getPosition = useCallback(async (): Promise<GeoResult> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return {
        error:
          "This device does not support GPS. Open GeoAttend on your phone browser for location-based check-in.",
      };
    }
    setLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        });
      });
      setLoading(false);
      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
    } catch (e) {
      setLoading(false);
      const code = (e as GeolocationPositionError).code;
      if (code === 1) {
        return {
          error: "GPS blocked — tap here to enable location in browser settings, then try again.",
        };
      }
      if (code === 2) {
        return { error: "Location unavailable — move near a window or outdoors and retry." };
      }
      if (code === 3) {
        return { error: "Location timed out — steady your phone and try once more." };
      }
      return { error: "Could not read your location. Please try again." };
    }
  }, []);

  return { getPosition, loading };
}
