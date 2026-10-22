
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:8080/api";

interface Product {
  id: number;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
}

interface StockMovement {
  id: number;
  product: Product;
  type: "IN" | "OUT";
  quantity: number;
  note?: string;
  createdAt: string;
}

export default function StockMovementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, movementsResponse] = await Promise.all([
        fetch(`${API}/products`),
        fetch(`${API}/stock-movements`),
      ]);

      if (!productsResponse.ok || !movementsResponse.ok) {
        throw new Error("Unable to load inventory or stock movement history.");
      }

      const productsData: Product[] = await productsResponse.json();
      const movementsData: StockMovement[] =
        await movementsResponse.json();

      setProducts(productsData);
      setMovements(movementsData);

      setProductId((current) => {
        if (current && productsData.some((p) => p.id === Number(current))) {
          return current;
        }
        return productsData.length > 0 ? String(productsData[0].id) : "";
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const selectedProduct = products.find(
    (product) => product.id === Number(productId)
  );

  async function submitMovement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const amount = Number(quantity);

    if (!productId) {
      setError("Please select a product.");
      return;
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      setError("Quantity must be a whole number greater than zero.");
      return;
    }

    if (type === "OUT" && selectedProduct && amount > selectedProduct.quantity) {
      setError(
        `Insufficient stock. Only ${selectedProduct.quantity} units are available.`
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API}/stock-movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(productId),
          type,
          quantity: amount,
          note: note.trim(),
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed (${response.status}).`);
      }

      setSuccess(
        `Stock ${type === "IN" ? "received" : "dispatched"} successfully.`
      );
      setQuantity("1");
      setNote("");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to record stock movement."
      );
    } finally {
      setSaving(false);
    }
  }

  const totalReceived = movements
    .filter((movement) => movement.type === "IN")
    .reduce((sum, movement) => sum + movement.quantity, 0);

  const totalDispatched = movements
    .filter((movement) => movement.type === "OUT")
    .reduce((sum, movement) => sum + movement.quantity, 0);

  return (
    <main className="main movement-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">INVENTORY OPERATIONS</p>
          <h2>Stock Movement</h2>
          <p className="subtitle">
            Track incoming stock and outgoing inventory.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() => void loadData()}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </header>

      {error && (
        <div className="error-box" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="success-box" role="status">
          {success}
        </div>
      )}

      <section className="stats movement-stats">
        <article className="stat-card">
          <span className="stat-icon purple">▦</span>
          <p>Total Movements</p>
          <h3>{loading ? "..." : movements.length}</h3>
          <span className="stat-note">Recorded transactions</span>
        </article>

        <article className="stat-card">
          <span className="stat-icon green">↓</span>
          <p>Units Received</p>
          <h3>{loading ? "..." : totalReceived.toLocaleString()}</h3>
          <span className="stat-note">Total stock in</span>
        </article>

        <article className="stat-card">
          <span className="stat-icon orange">↑</span>
          <p>Units Dispatched</p>
          <h3>{loading ? "..." : totalDispatched.toLocaleString()}</h3>
          <span className="stat-note">Total stock out</span>
        </article>
      </section>

      <section className="table-card movement-form-card">
        <div className="table-heading">
          <div>
            <h3>Record Stock Movement</h3>
            <p>Record stock received or dispatched.</p>
          </div>
        </div>

        <form className="product-form movement-form" onSubmit={submitMovement}>
          <div className="form-grid">
            <label>
              Movement type *
              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value as "IN" | "OUT")
                }
              >
                <option value="IN">Stock In — Receive stock</option>
                <option value="OUT">Stock Out — Dispatch stock</option>
              </select>
            </label>

            <label>
              Product *
              <select
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                required
                disabled={products.length === 0}
              >
                {products.length === 0 && (
                  <option value="">No products available</option>
                )}
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku || "No SKU"})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Quantity *
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                required
              />
            </label>

            <label>
              Note
              <input
                type="text"
                maxLength={500}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Supplier delivery or customer order"
              />
            </label>
          </div>

          {selectedProduct && (
            <p className="stock-available">
              Available stock: <strong>{selectedProduct.quantity} units</strong>
            </p>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={saving || loading || products.length === 0}
          >
            {saving
              ? "Processing..."
              : type === "IN"
                ? "↓ Record Stock In"
                : "↑ Record Stock Out"}
          </button>
        </form>
      </section>

      <section className="table-card">
        <div className="table-heading">
          <div>
            <h3>Movement History</h3>
            <p>A record of stock transactions.</p>
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading movement history...</p>
        ) : movements.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⇄</div>
            <h3>No movements recorded yet</h3>
            <p>Record your first stock transaction using the form above.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>PRODUCT</th>
                  <th>TYPE</th>
                  <th>QUANTITY</th>
                  <th>NOTE</th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>
                      {new Date(movement.createdAt).toLocaleString()}
                    </td>
                    <td className="product-name">
                      {movement.product?.name ?? "Unknown product"}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          movement.type === "IN" ? "badge-good" : "badge-low"
                        }`}
                      >
                        {movement.type === "IN" ? "Stock In" : "Stock Out"}
                      </span>
                    </td>
                    <td>
                      {movement.type === "IN" ? "+" : "−"}
                      {movement.quantity}
                    </td>
                    <td>{movement.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer>StockFlow · Inventory management system</footer>
    </main>
  );
}

