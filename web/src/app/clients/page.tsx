"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { apiGet } from "@/lib/api";
import { Client } from "@/lib/types";
import { ClientForm } from "@/components/ClientForm";
import { ClientList } from "@/components/ClientList";

export default function ClientsPage() {
  const [ready, setReady] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) return;
      setReady(true);
      const res = await apiGet<{ clients: Client[] }>("/clients");
      setClients(res.clients);
    });
    return unsub;
  }, []);

  if (!ready) return <p>Loading…</p>;

  return (
    <div className="stack">
      <h1>Clients</h1>
      <div className="dashboard-grid">
        <ClientForm onCreated={(c) => setClients((prev) => [c, ...prev])} />
        <ClientList clients={clients} />
      </div>
    </div>
  );
}
