import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mazaofiti",
  description: "Aggregate client demand for agricultural products by grade, cost, and location.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
