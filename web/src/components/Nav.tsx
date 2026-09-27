"use client";

import Link from "next/link";
import { firebaseAuth } from "@/lib/firebase";

export function Nav() {
  return (
    <nav className="topbar">
      <strong>Mazaofiti</strong>
      <div className="links">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/clients">Clients</Link>
        <Link href="/products">Products</Link>
        <button className="secondary" onClick={() => firebaseAuth.signOut()}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
