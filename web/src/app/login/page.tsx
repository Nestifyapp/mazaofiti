"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { firebaseAuth, googleProvider } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(
        mode === "signin"
          ? "Couldn't sign in. Check your email and password."
          : "Couldn't create an account. The email may already be in use."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleAuth() {
    setError(null);
    setBusy(true);
    try {
      await signInWithPopup(firebaseAuth, googleProvider);
      router.replace("/dashboard");
    } catch (err) {
      setError("Couldn't sign in with Google. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h1>Mazaofiti</h1>
      <p>Sign in to aggregate demand for your clients.</p>

      <div className="card stack">
        <button type="button" className="secondary" onClick={handleGoogleAuth} disabled={busy}>
          Continue with Google
        </button>

        <div style={{ textAlign: "center", color: "var(--color-text-dim)", fontSize: "0.85rem" }}>
          or
        </div>

        <form className="stack" onSubmit={handleEmailAuth}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <button type="submit" disabled={busy}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          className="secondary"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>

        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
