"use client";

import { Client } from "@/lib/types";

export function ClientList({ clients }: { clients: Client[] }) {
  if (!clients.length) {
    return (
      <div className="card">
        <h2>Your clients</h2>
        <p>No clients yet. Add one above before you can post demand for them.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Your clients</h2>
      <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.contact}</td>
              <td>{c.location.address || `${c.location.lat.toFixed(3)}, ${c.location.lng.toFixed(3)}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
