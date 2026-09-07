import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Package,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Power,
} from "lucide-react";
import { supabase } from "../../services/supabase";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const emptyForm = {
    product_code: "",
    product_name: "",
    category: "",
    content: "",
    actual_price: "",
    is_available: true,
  };

  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    setLoading(true);
    setErrorMessage("");

    try {
      const [
        { data: productData, error: productError },
        { data: categoryData, error: categoryError },
        { data: settingsData, error: settingsError },
      ] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .order("product_code", {
            ascending: true,
          }),

        supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("display_order", {
            ascending: true,
          }),

        supabase
          .from("site_settings")
          .select("global_discount_percentage")
          .eq("id", 1)
          .single(),
      ]);

      if (productError) {
        throw new Error(productError.message);
      }

      if (categoryError) {
        throw new Error(categoryError.message);
      }

      if (settingsError) {
        throw new Error(settingsError.message);
      }

      setProducts(productData || []);
      setCategories(categoryData || []);
      setGlobalDiscount(
        Number(
          settingsData?.global_discount_percentage || 0
        )
      );
    } catch (error) {
      console.error("ADMIN PRODUCTS ERROR:", error);

      setProducts([]);
      setCategories([]);
      setErrorMessage(
        error.message || "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function getSellingPrice(actualPrice) {
    const price = Number(actualPrice || 0);

    const discountedPrice =
      price - (price * globalDiscount) / 100;

    return Math.round(discountedPrice * 100) / 100;
  }

  function getSavings(actualPrice) {
    const price = Number(actualPrice || 0);

    return Math.round(
      ((price * globalDiscount) / 100) * 100
    ) / 100;
  }

  function openAddModal() {
    setEditingProduct(null);
    setForm(emptyForm);
    setErrorMessage("");
    setSuccessMessage("");
    setShowModal(true);
  }

  function openEditModal(product) {
    setEditingProduct(product);

    setForm({
      product_code: product.product_code || "",
      product_name: product.product_name || "",
      category: product.category || "",
      content: product.content || "",
      actual_price:
        product.actual_price !== null &&
        product.actual_price !== undefined
          ? product.actual_price
          : "",
      is_available:
        product.is_available !== false,
    });

    setErrorMessage("");
    setSuccessMessage("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingProduct(null);
    setForm(emptyForm);
  }

  function handleFormChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function saveProduct(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!form.product_code.trim()) {
      setErrorMessage("Product code is required.");
      return;
    }

    if (!form.product_name.trim()) {
      setErrorMessage("Product name is required.");
      return;
    }

    if (!form.category.trim()) {
      setErrorMessage("Please select a category.");
      return;
    }

    if (
      form.actual_price === "" ||
      Number(form.actual_price) < 0
    ) {
      setErrorMessage("Please enter a valid actual price.");
      return;
    }

    setSaving(true);

    try {
      const productData = {
        product_code: form.product_code.trim(),
        product_name: form.product_name.trim(),
        category: form.category.trim(),
        content: form.content.trim(),
        actual_price: Number(form.actual_price),
        is_available: form.is_available,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) {
          throw new Error(error.message);
        }

        setSuccessMessage(
          "Product updated successfully."
        );
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData);

        if (error) {
          throw new Error(error.message);
        }

        setSuccessMessage(
          "Product added successfully."
        );
      }

      setShowModal(false);
      setEditingProduct(null);
      setForm(emptyForm);

      await loadData();
    } catch (error) {
      console.error("SAVE PRODUCT ERROR:", error);

      setErrorMessage(
        error.message || "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(product) {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("products")
        .update({
          is_available: !product.is_available,
        })
        .eq("id", product.id);

      if (error) {
        throw new Error(error.message);
      }

      setSuccessMessage(
        product.is_available
          ? `${product.product_name} disabled.`
          : `${product.product_name} enabled.`
      );

      await loadData();
    } catch (error) {
      console.error(
        "TOGGLE PRODUCT ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to change product availability."
      );
    }
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Delete "${product.product_name}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) {
        throw new Error(error.message);
      }

      setSuccessMessage(
        `${product.product_name} deleted successfully.`
      );

      await loadData();
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to delete product."
      );
    }
  }

  const filteredProducts = products.filter(
    (product) => {
      const searchText =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        String(
          product.product_code || ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(
          product.product_name || ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(
          product.category || ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(
          product.content || ""
        )
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        categoryFilter === "all" ||
        String(product.category || "")
          .toLowerCase() ===
          categoryFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  return (
    <div className="admin-products-page">

      <div className="admin-products-header">

        <div>
          <span className="admin-section-label">
            SRI PRIYA TRADERS
          </span>

          <h1>Products</h1>

          <p>
            Manage your products, prices,
            categories and availability.
          </p>
        </div>

        <div className="products-header-actions">

          <button
            className="refresh-products-button"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw
              size={18}
              className={
                loading
                  ? "loading-icon"
                  : ""
              }
            />

            {loading
              ? "Loading..."
              : "Refresh"}
          </button>

          <button
            className="add-product-button"
            onClick={openAddModal}
          >
            <Plus size={19} />
            Add Product
          </button>

        </div>

      </div>

      <div className="admin-discount-banner">

        <div>
          <span>
            GLOBAL CUSTOMER DISCOUNT
          </span>

          <strong>
            {globalDiscount}%
          </strong>
        </div>

        <p>
          Customer prices are automatically
          calculated from the actual price.
        </p>

      </div>

      {successMessage && (
        <div className="products-success-message">
          <Check size={19} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="products-error-message">
          <X size={19} />
          {errorMessage}
        </div>
      )}

      <div className="products-toolbar">

        <div className="products-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search code, product, category..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          className="category-filter"
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All Categories
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.name}
            >
              {category.name}
            </option>
          ))}
        </select>

        <div className="products-count">
          {filteredProducts.length} products
        </div>

      </div>

      <div className="admin-products-card">

        {loading ? (

          <div className="products-loading">
            <RefreshCw
              size={28}
              className="loading-icon"
            />

            <p>
              Loading your products...
            </p>
          </div>

        ) : filteredProducts.length === 0 ? (

          <div className="products-empty">

            <Package size={42} />

            <h3>
              {errorMessage
                ? "Unable to load products"
                : "No products found"}
            </h3>

            <p>
              {errorMessage
                ? "Check the error message above."
                : "Try another search or category."}
            </p>

          </div>

        ) : (

          <div className="products-table-wrapper">

            <table className="admin-products-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Actual Price</th>
                  <th>Discount</th>
                  <th>Customer Price</th>
                  <th>Savings</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredProducts.map(
                  (product) => {

                    const actualPrice =
                      Number(
                        product.actual_price || 0
                      );

                    const sellingPrice =
                      getSellingPrice(
                        actualPrice
                      );

                    const savings =
                      getSavings(
                        actualPrice
                      );

                    return (
                      <tr
                        key={product.id}
                      >

                        <td>
                          <div className="admin-product-info">

                            <div className="admin-product-image">

                              {product.image_url ? (
                                <img
                                  src={
                                    product.image_url
                                  }
                                  alt={
                                    product.product_name
                                  }
                                />
                              ) : (
                                <Package
                                  size={22}
                                />
                              )}

                            </div>

                            <div>

                              <strong>
                                {
                                  product.product_name
                                }
                              </strong>

                              <span>
                                {
                                  product.product_code
                                }
                              </span>

                              {product.content && (
                                <small>
                                  {
                                    product.content
                                  }
                                </small>
                              )}

                            </div>

                          </div>
                        </td>

                        <td>
                          <span className="category-name">
                            {product.category ||
                              "—"}
                          </span>
                        </td>

                        <td>
                          <strong>
                            ₹
                            {actualPrice.toFixed(
                              2
                            )}
                          </strong>
                        </td>

                        <td>
                          <span className="admin-discount-badge">
                            {globalDiscount}%
                          </span>
                        </td>

                        <td>
                          <strong className="customer-price">
                            ₹
                            {sellingPrice.toFixed(
                              2
                            )}
                          </strong>
                        </td>

                        <td>
                          <span className="admin-savings">
                            ₹
                            {savings.toFixed(
                              2
                            )}
                          </span>
                        </td>

                        <td>
                          {product.is_available ? (
                            <span className="status-active">
                              Active
                            </span>
                          ) : (
                            <span className="status-inactive">
                              Disabled
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="product-actions">

                            <button
                              className="action-edit"
                              title="Edit product"
                              onClick={() =>
                                openEditModal(
                                  product
                                )
                              }
                            >
                              <Edit3 size={17} />
                            </button>

                            <button
                              className="action-power"
                              title={
                                product.is_available
                                  ? "Disable product"
                                  : "Enable product"
                              }
                              onClick={() =>
                                toggleAvailability(
                                  product
                                )
                              }
                            >
                              <Power size={17} />
                            </button>

                            <button
                              className="action-delete"
                              title="Delete product"
                              onClick={() =>
                                deleteProduct(
                                  product
                                )
                              }
                            >
                              <Trash2 size={17} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {showModal && (
        <div
          className="product-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="product-modal">

            <div className="product-modal-header">

              <div>
                <span>
                  SRI PRIYA TRADERS
                </span>

                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>
              </div>

              <button
                className="modal-close-button"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={22} />
              </button>

            </div>

            <form
              onSubmit={saveProduct}
              className="product-form"
            >

              <div className="form-grid">

                <div className="form-field">

                  <label>
                    Product Code *
                  </label>

                  <input
                    type="text"
                    name="product_code"
                    value={
                      form.product_code
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Example: SPT084"
                  />

                </div>

                <div className="form-field">

                  <label>
                    Product Name *
                  </label>

                  <input
                    type="text"
                    name="product_name"
                    value={
                      form.product_name
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Product name"
                  />

                </div>

                <div className="form-field">

                  <label>
                    Category *
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={
                      handleFormChange
                    }
                  >
                    <option value="">
                      Select Category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.name}
                        >
                          {category.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="form-field">

                  <label>
                    Content / Pack
                  </label>

                  <input
                    type="text"
                    name="content"
                    value={form.content}
                    onChange={
                      handleFormChange
                    }
                    placeholder="Example: Box (10 Pcs)"
                  />

                </div>

                <div className="form-field">

                  <label>
                    Actual Price *
                  </label>

                  <input
                    type="number"
                    name="actual_price"
                    value={
                      form.actual_price
                    }
                    onChange={
                      handleFormChange
                    }
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />

                </div>

                <div className="form-field">

                  <label>
                    Customer Price
                  </label>

                  <div className="calculated-price-box">

                    ₹
                    {getSellingPrice(
                      form.actual_price
                    ).toFixed(2)}

                    <small>
                      {globalDiscount}% discount
                    </small>

                  </div>

                </div>

              </div>

              <div className="availability-row">

                <label>
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={
                      form.is_available
                    }
                    onChange={
                      handleFormChange
                    }
                  />

                  <span>
                    Product available for
                    customers
                  </span>
                </label>

              </div>

              <div className="product-modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-product-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={18}
                        className="loading-icon"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      {editingProduct
                        ? "Update Product"
                        : "Add Product"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Products;