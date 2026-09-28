"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { apiGet } from "@/lib/api";
import { Product } from "@/lib/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) return;
      setReady(true);
      const res = await apiGet<{ products: Product[] }>("/products");
      setProducts(res.products);
    });
    return unsub;
  }, []);

  if (!ready) return <p>Loading…</p>;

  return (
    <div className="stack">
      <h1>Product catalogue</h1>
      {products.map((p) => (
        <div className="card" key={p.id}>
          <h2>{p.name}</h2>
          <h3>{p.category}</h3>
          <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Grade</th>
                <th>Unit</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {p.grades.map((g) => (
                <tr key={g.grade}>
                  <td>{g.grade}</td>
                  <td>{g.unit}</td>
                  <td className="num">
                    {g.currency} {g.costPerUnit.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      ))}
    </div>
  );
}
