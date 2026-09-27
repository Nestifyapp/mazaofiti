"use client";

import { Product } from "@/lib/types";

interface Props {
  products: Product[];
  productId: string;
  grade: string;
  onProductChange: (productId: string) => void;
  onGradeChange: (grade: string) => void;
}

export function ProductGradeSelect({
  products,
  productId,
  grade,
  onProductChange,
  onGradeChange,
}: Props) {
  const selected = products.find((p) => p.id === productId);

  return (
    <div className="row">
      <div className="field" style={{ flex: 1, minWidth: 200 }}>
        <label>Product</label>
        <select value={productId} onChange={(e) => onProductChange(e.target.value)}>
          <option value="">Select a product…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field" style={{ flex: 1, minWidth: 200 }}>
        <label>Grade</label>
        <select
          value={grade}
          onChange={(e) => onGradeChange(e.target.value)}
          disabled={!selected}
        >
          <option value="">Select a grade…</option>
          {selected?.grades.map((g) => (
            <option key={g.grade} value={g.grade}>
              {g.grade} — {g.currency} {g.costPerUnit.toLocaleString()} / {g.unit}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
