import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/firebaseAdmin";

export interface AuthedRequest extends Request {
  uid?: string;
  userRole?: string;
}

/**
 * Verifies the Firebase ID token sent as "Authorization: Bearer <token>".
 * Used by both the Next.js web app and any future native mobile client —
 * they authenticate the same way against Firebase Auth and send the same
 * token here.
 */
export async function verifyFirebaseToken(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing Authorization bearer token" });
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    req.uid = decoded.uid;
    req.userRole = (decoded as any).role; // set via custom claims if you use them
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
