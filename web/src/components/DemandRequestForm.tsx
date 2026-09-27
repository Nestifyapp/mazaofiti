"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Client, DemandRequest, Product } from "@/lib/types";
import { ClientSelect } from "./ClientSelect";
import { ProductGradeSelect } from "./ProductGradeSelect";

export function DemandRequestForm({ onCreated }: { onCreated: (r: DemandRequest) => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clientId, setClientId] = useState("");
  const [productId, setProductId] = useState("");
  const [grade, setGrade] = useState("");
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ clients: Client[] }>("/clients").then((res) => setClients(res.clients));
    apiGet<{ products: Product[] }>("/products").then((res) => setProducts(res.products));
  }, []);

  const selectedProduct = products.find((p) => p.id === productId);
  const selectedGrade = selectedProduct?.grades.find((g) => g.grade === grade);
  const quantityNum = Number(quantity) || 0;
  const totalCost = selectedGrade ? quantityNum * selectedGrade.costPerUnit : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!clientId || !productId || !grade || !quantity) {
      setError("Fill in client, product, grade, and quantity.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiPost<DemandRequest>("/demand-requests", {
        clientId,
        productId,
        grade,
        quantityDemanded: quantityNum,
      });
      onCreated(result);
      setClientId("");
      setProductId("");
      setGrade("");
      setQuantity("");
    } catch {
      setError("Couldn't submit the request. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <h2>Post demand</h2>

      <ClientSelect clients={clients} clientId={clientId} onChange={setClientId} />

      <ProductGradeSelect
        products={products}
        productId={productId}
        grade={grade}
        onProductChange={(id) => {
          setProductId(id);
          setGrade("");
        }}
        onGradeChange={setGrade}
      />

      <div className="row">
        <div className="field" style={{ flex: 1, minWidth: 160 }}>
          <label>Quantity demanded {selectedGrade ? `(${selectedGrade.unit})` : ""}</label>
          <input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 200"
          />
        </div>
        {selectedGrade && (
          <div className="field" style={{ flex: 1, minWidth: 160 }}>
            <label>Estimated total cost</label>
            <p className="num" style={{ color: "var(--color-text)", margin: 0, paddingTop: 10 }}>
              {selectedGrade.currency} {totalCost.toLocaleString()}
              <span style={{ color: "var(--color-text-dim)" }}>
                {" "}
                ({selectedGrade.currency} {selectedGrade.costPerUnit.toLocaleString()} / {selectedGrade.unit})
              </span>
            </p>
          </div>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Posting…" : "Post demand request"}
      </button>
    </form>
  );
}
