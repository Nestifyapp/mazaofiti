"use client";

import { DemandRequest } from "@/lib/types";

export function RequestList({ requests }: { requests: DemandRequest[] }) {
  if (!requests.length) {
    return (
      <div className="card">
        <h2>Your demand requests</h2>
        <p>Nothing posted yet. Use the form to post your first demand request.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Your demand requests</h2>
      <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Product</th>
            <th>Grade</th>
            <th>Quantity</th>
            <th>Total cost</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td>{r.clientName}</td>
              <td>{r.productName}</td>
              <td>{r.grade}</td>
              <td className="num">
                {r.fulfilledQuantity} / {r.quantityDemanded} {r.unit}
              </td>
              <td className="num">
                {r.currency} {r.totalCost.toLocaleString()}
              </td>
              <td>
                <span className={`badge ${r.status}`}>{r.status.replace("_", " ")}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
