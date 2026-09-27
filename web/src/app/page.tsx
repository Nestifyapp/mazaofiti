"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      router.replace(user ? "/dashboard" : "/login");
    });
    return unsub;
  }, [router]);

  return (
    <div className="container">
      <p>Loading…</p>
    </div>
  );
}
