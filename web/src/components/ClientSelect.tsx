"use client";

import { Client } from "@/lib/types";

interface Props {
  clients: Client[];
  clientId: string;
  onChange: (clientId: string) => void;
}

export function ClientSelect({ clients, clientId, onChange }: Props) {
  return (
    <div className="field">
      <label>Client</label>
      <select value={clientId} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select a client…</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} — {c.location.address || `${c.location.lat.toFixed(2)}, ${c.location.lng.toFixed(2)}`}
          </option>
        ))}
      </select>
      {!clients.length && (
        <p className="error-text">
          No clients yet — add one on the Clients page first.
        </p>
      )}
    </div>
  );
}
