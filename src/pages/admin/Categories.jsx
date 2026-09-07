import { useEffect, useState } from "react";
import {
  Folder,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { supabase } from "../../services/supabase";

import "./Categories.css";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [categoryName, setCategoryName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [displayOrder, setDisplayOrder] =
    useState(0);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCategories() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", {
        ascending: true,
      });

    if (error) {
      console.error(
        "CATEGORY LOAD ERROR:",
        error
      );

      setError(error.message);
      setCategories([]);
    } else {
      setCategories(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openAddForm() {
    setEditingCategory(null);
    setCategoryName("");
    setDescription("");
    setDisplayOrder(categories.length + 1);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function openEditForm(category) {
    setEditingCategory(category);

    setCategoryName(category.name || "");
    setDescription(
      category.description || ""
    );

    setDisplayOrder(
      category.display_order || 0
    );

    setMessage("");
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingCategory(null);
    setCategoryName("");
    setDescription("");
    setDisplayOrder(0);
  }

  async function saveCategory(e) {
    e.preventDefault();

    if (!categoryName.trim()) {
      setError("Please enter a category name.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const categoryData = {
      name: categoryName.trim(),
      description:
        description.trim() || null,
      display_order:
        Number(displayOrder) || 0,
      is_active: true,
    };

    let result;

    if (editingCategory) {
      result = await supabase
        .from("categories")
        .update(categoryData)
        .eq("id", editingCategory.id);
    } else {
      result = await supabase
        .from("categories")
        .insert(categoryData);
    }

    if (result.error) {
      console.error(
        "CATEGORY SAVE ERROR:",
        result.error
      );

      setError(result.error.message);
      setSaving(false);
      return;
    }

    setMessage(
      editingCategory
        ? "Category updated successfully!"
        : "Category added successfully!"
    );

    closeForm();

    await loadCategories();

    setSaving(false);
  }

  async function toggleCategory(category) {
    setError("");
    setMessage("");

    const { error } = await supabase
      .from("categories")
      .update({
        is_active: !category.is_active,
      })
      .eq("id", category.id);

    if (error) {
      console.error(
        "CATEGORY STATUS ERROR:",
        error
      );

      setError(error.message);
      return;
    }

    setMessage(
      category.is_active
        ? "Category disabled."
        : "Category enabled."
    );

    await loadCategories();
  }

  async function deleteCategory(category) {
    const confirmed = window.confirm(
      `Delete "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      console.error(
        "CATEGORY DELETE ERROR:",
        error
      );

      setError(
        "Cannot delete this category if products are still using it."
      );

      return;
    }

    setMessage("Category deleted successfully!");

    await loadCategories();
  }

  return (
    <section className="admin-category-page">

      <div className="admin-category-header">

        <div>
          <span className="admin-eyebrow">
            SRI PRIYA TRADERS
          </span>

          <h1>Categories</h1>

          <p>
            Manage your product categories.
          </p>
        </div>

        <div className="category-header-actions">

          <button
            className="category-refresh-button"
            onClick={loadCategories}
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <button
            className="category-add-button"
            onClick={openAddForm}
          >
            <Plus size={18} />
            Add Category
          </button>

        </div>

      </div>

      {message && (
        <div className="category-success">
          <CheckCircle size={20} />
          {message}
        </div>
      )}

      {error && (
        <div className="category-error">
          <XCircle size={20} />
          {error}
        </div>
      )}

      {showForm && (
        <div className="category-form-card">

          <div className="category-form-title">
            <Folder size={22} />

            <h2>
              {editingCategory
                ? "Edit Category"
                : "Add Category"}
            </h2>
          </div>

          <form onSubmit={saveCategory}>

            <div className="category-form-grid">

              <div className="category-field">
                <label>
                  Category Name
                </label>

                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) =>
                    setCategoryName(
                      e.target.value
                    )
                  }
                  placeholder="Example: SPARKLERS"
                />
              </div>

              <div className="category-field">
                <label>
                  Display Order
                </label>

                <input
                  type="number"
                  min="0"
                  value={displayOrder}
                  onChange={(e) =>
                    setDisplayOrder(
                      e.target.value
                    )
                  }
                />
              </div>

            </div>

            <div className="category-field">

              <label>
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Short category description"
              />

            </div>

            <div className="category-form-actions">

              <button
                type="button"
                className="category-cancel-button"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="category-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingCategory
                  ? "Update Category"
                  : "Save Category"}
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="category-count-card">
        <div>
          <strong>
            {categories.length}
          </strong>

          <span>
            Categories
          </span>
        </div>

        <div>
          <strong>
            {
              categories.filter(
                (category) =>
                  category.is_active
              ).length
            }
          </strong>

          <span>
            Active
          </span>
        </div>
      </div>

      {loading ? (
        <div className="category-loading">
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="category-empty">

          <Folder size={48} />

          <h2>
            No Categories Found
          </h2>

          <p>
            Add your first category to get started.
          </p>

          <button
            onClick={openAddForm}
            className="category-add-button"
          >
            <Plus size={18} />
            Add Category
          </button>

        </div>
      ) : (
        <div className="category-grid">

          {categories.map((category) => (

            <div
              className={`category-card ${
                !category.is_active
                  ? "category-disabled"
                  : ""
              }`}
              key={category.id}
            >

              <div className="category-icon">
                <Folder size={25} />
              </div>

              <div className="category-card-content">

                <span className="category-number">
                  #{category.display_order}
                </span>

                <h3>
                  {category.name}
                </h3>

                <p>
                  {category.description ||
                    "No description"}
                </p>

                <span
                  className={`category-status ${
                    category.is_active
                      ? "active"
                      : "inactive"
                  }`}
                >
                  {category.is_active
                    ? "Active"
                    : "Disabled"}
                </span>

              </div>

              <div className="category-actions">

                <button
                  onClick={() =>
                    openEditForm(category)
                  }
                  title="Edit category"
                >
                  <Edit3 size={17} />
                </button>

                <button
                  onClick={() =>
                    toggleCategory(category)
                  }
                  title={
                    category.is_active
                      ? "Disable category"
                      : "Enable category"
                  }
                >
                  {category.is_active ? (
                    <XCircle size={17} />
                  ) : (
                    <CheckCircle size={17} />
                  )}
                </button>

                <button
                  onClick={() =>
                    deleteCategory(category)
                  }
                  title="Delete category"
                >
                  <Trash2 size={17} />
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

    </section>
  );
}

export default Categories;