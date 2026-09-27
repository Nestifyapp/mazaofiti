"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { apiGet } from "@/lib/api";
import { DemandRequest } from "@/lib/types";
import { DemandRequestForm } from "@/components/DemandRequestForm";
import { RequestList } from "@/components/RequestList";

export default function DashboardPage() {
  const [ready, setReady] = useState(false);
  const [requests, setRequests] = useState<DemandRequest[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) return;
      setReady(true);
      const res = await apiGet<{ requests: DemandRequest[] }>("/demand-requests?mine=true");
      setRequests(res.requests);
    });
    return unsub;
  }, []);

  if (!ready) return <p>Loading…</p>;

  return (
    <div className="stack">
      <h1>Demand dashboard</h1>
      <DemandRequestForm onCreated={(r) => setRequests((prev) => [r, ...prev])} />
      <RequestList requests={requests} />
    </div>
  );
}
