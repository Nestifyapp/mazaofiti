"use client";

import { useState } from "react";
import { GeoLocation } from "@/lib/types";

interface Props {
  value: GeoLocation | null;
  onChange: (loc: GeoLocation) => void;
}

export function LocationCapture({ value, onChange }: Props) {
  const [status, setStatus] = useState<"idle" | "locating" | "error">("idle");

  function useCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: value?.address ?? "",
        });
        setStatus("idle");
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="field">
      <label>Delivery location</label>
      <div className="row">
        <button type="button" className="secondary" onClick={useCurrentLocation}>
          {status === "locating" ? "Locating…" : "Use my current location"}
        </button>
        {value && (
          <span className="num" style={{ alignSelf: "center", color: "var(--color-text-dim)" }}>
            {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
          </span>
        )}
      </div>
      {status === "error" && (
        <p className="error-text">
          Couldn&apos;t get your location. Check location permissions, or enter an address below.
        </p>
      )}
      <input
        style={{ marginTop: "var(--space-2)" }}
        placeholder="Address or landmark (optional)"
        value={value?.address ?? ""}
        onChange={(e) =>
          onChange({
            lat: value?.lat ?? 0,
            lng: value?.lng ?? 0,
            address: e.target.value,
          })
        }
      />
    </div>
  );
}
