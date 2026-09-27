"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { Client, GeoLocation } from "@/lib/types";
import { LocationCapture } from "./LocationCapture";

export function ClientForm({ onCreated }: { onCreated: (c: Client) => void }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !contact || !location) {
      setError("Fill in name, contact, and location.");
      return;
    }

    setSubmitting(true);
    try {
      const client = await apiPost<Client>("/clients", { name, contact, location });
      onCreated(client);
      setName("");
      setContact("");
      setLocation(null);
    } catch {
      setError("Couldn't add the client. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <h2>Add a client</h2>
      <div className="row">
        <div className="field" style={{ flex: 1, minWidth: 180 }}>
          <label>Client name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Green Valley Traders" />
        </div>
        <div className="field" style={{ flex: 1, minWidth: 180 }}>
          <label>Contact</label>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Phone or email"
          />
        </div>
      </div>

      <LocationCapture value={location} onChange={setLocation} />

      {error && <p className="error-text">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Adding…" : "Add client"}
      </button>
    </form>
  );
}
