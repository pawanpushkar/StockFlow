import { useEffect, useMemo, useState } from "react";
import "./App.css";
import StockMovementPage from "./StockMovement";


interface Product {
  id?: number;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  reorderLevel?: number;
}

const API = "http://localhost:8080/api/products";

function App() {
  const [activePage, setActivePage] = useState<
  "Dashboard" | "Stock Movement"
>("Dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("1");
  const [reorderLevel, setReorderLevel] = useState("10");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: Product[] = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from the backend.");
      }

      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  function resetForm() {
    setName("");
    setSku("");
    setQuantity("1");
    setPrice("1");
    setReorderLevel("10");
    setEditingId(null);
    setShowForm(false);
  }

  function startEditing(product: Product) {
    if (product.id == null) {
      alert("This product has no ID and cannot be edited.");
      return;
    }

    setEditingId(product.id);
    setName(product.name);
    setSku(product.sku ?? "");
    setQuantity(String(product.quantity));
    setPrice(String(product.price));
    setReorderLevel(String(product.reorderLevel ?? 10));
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedSku = sku.trim();
    const parsedQuantity = Number(quantity);
    const parsedPrice = Number(price);
    const parsedReorderLevel = Number(reorderLevel);

    if (!trimmedName) {
      alert("Please enter a product name.");
      return;
    }

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      alert("Quantity must be a whole number greater than or equal to zero.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      alert("Unit price must be greater than zero.");
      return;
    }

    if (
      !Number.isInteger(parsedReorderLevel) ||
      parsedReorderLevel < 0
    ) {
      alert("Reorder level must be a whole number greater than or equal to zero.");
      return;
    }

    const product = {
      name: trimmedName,
      sku: trimmedSku,
      quantity: parsedQuantity,
      price: parsedPrice,
      reorderLevel: parsedReorderLevel,
    };

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        editingId === null ? API : `${API}/${editingId}`,
        {
          method: editingId === null ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || `Unable to save product. Server returned ${response.status}.`
        );
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to save the product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    if (product.id == null) {
      alert("This product has no ID and cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`${API}/${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || `Unable to delete product. Server returned ${response.status}.`
        );
      }

      if (editingId === product.id) {
        resetForm();
      }

      await loadProducts();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to delete the product."
      );
    }
  }

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        (product.sku ?? "").toLowerCase().includes(term)
    );
  }, [products, search]);

  const totalUnits = products.reduce(
    (sum, product) => sum + Number(product.quantity || 0),
    0
  );

  const inventoryValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.quantity || 0) * Number(product.price || 0),
    0
  );

  const isLowStock = (product: Product) =>
    Number(product.quantity) <= Number(product.reorderLevel ?? 10);

  const lowStock = products.filter(isLowStock).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="brand">
          <span>◆</span> StockFlow
        </h1>

        <p className="menu-label">WORKSPACE</p>
<button
  type="button"
  className={`menu-item ${activePage === "Dashboard" ? "active" : ""}`}
  onClick={() => setActivePage("Dashboard")}
>
  ▦ &nbsp; Dashboard
</button>

<button
  type="button"
  className="menu-item"
  onClick={() => alert("Inventory is available on the Dashboard for now.")}
>
  □ &nbsp; Inventory
</button>

<button
  type="button"
  className={`menu-item ${
    activePage === "Stock Movement" ? "active" : ""
  }`}
  onClick={() => setActivePage("Stock Movement")}
>
  ⇄ &nbsp; Stock Movement
</button>

<button
  type="button"
  className="menu-item"
  onClick={() => alert("Reports will be added later.")}
>
  ▤ &nbsp; Reports
</button>

        <div className="sidebar-bottom">
          <div className="menu-item">⚙ &nbsp; Settings</div>
          <p>Inventory management made simple.</p>
        </div>
      </aside>

      {activePage === "Stock Movement" ? (
        <StockMovementPage />
      ) : (
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h2>Inventory Dashboard</h2>
            <p className="subtitle">
              Monitor your inventory and keep your business moving.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => {
              if (showForm && editingId === null) {
                resetForm();
              } else {
                if (editingId !== null) resetForm();
                setShowForm(true);
              }
            }}
          >
            + Add Product
          </button>
        </header>

        {showForm && (
          <form className="product-form" onSubmit={saveProduct}>
            <h3>{editingId === null ? "Add a new product" : "Edit product"}</h3>

            <div className="form-grid">
              <label>
                Product name *
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Wireless Mouse"
                  required
                />
              </label>

              <label>
                SKU
                <input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU-001"
                />
              </label>

              <label>
                Quantity
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </label>

              <label>
                Unit price (₹)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </label>

              <label>
                Reorder level
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(e.target.value)}
                  required
                />
              </label>
            </div>

            <button className="primary-button" type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId === null
                  ? "Save Product"
                  : "Update Product"}
            </button>

            <button
              className="secondary-button"
              type="button"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel
            </button>
          </form>
        )}

        {error && (
          <div className="error-box">
            <strong>Connection issue:</strong> {error}
            <button className="secondary-button" onClick={loadProducts}>
              Retry
            </button>
          </div>
        )}

        <section className="stats">
          <article className="stat-card">
            <span className="stat-icon purple">▦</span>
            <p>Total Products</p>
            <h3>{loading ? "..." : products.length}</h3>
            <span className="stat-note">Products in inventory</span>
          </article>

          <article className="stat-card">
            <span className="stat-icon green">↗</span>
            <p>Total Units</p>
            <h3>{loading ? "..." : totalUnits.toLocaleString()}</h3>
            <span className="stat-note">Units currently in stock</span>
          </article>

          <article className="stat-card">
            <span className="stat-icon orange">₹</span>
            <p>Inventory Value</p>
            <h3>
              {loading
                ? "..."
                : inventoryValue.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 2,
                  })}
            </h3>
            <span className="stat-note">Based on quantity × price</span>
          </article>

          <article className="stat-card">
            <span className="stat-icon red">!</span>
            <p>Low Stock Items</p>
            <h3>{loading ? "..." : lowStock}</h3>
            <span className="stat-note">At or below reorder level</span>
          </article>
        </section>

        <section className="table-card">
          <div className="table-heading">
            <div>
              <h3>Product Inventory</h3>
              <p>Your current inventory records</p>
            </div>

            <button
              className="secondary-button"
              onClick={() => void loadProducts()}
              disabled={loading}
            >
              ↻ {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="search-container">
            <input
              type="search"
              className="search-input"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products by name or SKU"
            />
          </div>

          {loading ? (
            <p className="empty-state">Loading inventory...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">▦</div>
              <h3>
                {products.length === 0
                  ? "Your inventory is empty"
                  : "No matching products"}
              </h3>
              <p>
                {products.length === 0
                  ? "Add your first product to get started."
                  : "Try another product name or SKU."}
              </p>

              {products.length === 0 && (
                <button
                  className="primary-button"
                  onClick={() => setShowForm(true)}
                >
                  + Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>SKU</th>
                    <th>QUANTITY</th>
                    <th>UNIT PRICE</th>
                    <th>STOCK STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr key={product.id ?? `${product.name}-${index}`}>
                      <td className="product-name">{product.name}</td>
                      <td>{product.sku || "—"}</td>
                      <td>{product.quantity}</td>
                      <td>
                        {Number(product.price || 0).toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            isLowStock(product) ? "badge-low" : "badge-good"
                          }`}
                        >
                          {isLowStock(product) ? "Low stock" : "In stock"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => startEditing(product)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => void deleteProduct(product)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer>StockFlow · Inventory management system</footer>
      </main>
      )}
    </div>
  );
}

export default App;

