import { useEffect, useState } from "react";
import {
  Sparkles,
  Rocket,
  CircleDot,
  Star,
  Gift,
  Zap,
  ArrowRight,
  Folder,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import "./Categories.css";

const icons = [
  Zap,
  Sparkles,
  CircleDot,
  Rocket,
  Star,
  Gift,
];

const accents = [
  "red",
  "pink",
  "gold",
];

function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadCategories() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error) {
      console.error(
        "CUSTOMER CATEGORIES ERROR:",
        error
      );

      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openCategory(categoryId) {
    navigate(`/products?category=${categoryId}`);
  }

  if (loading) {
    return (
      <section className="categories-section">
        <div className="section-heading">
          <span className="section-kicker">
            <Sparkles size={15} />
            EXPLORE OUR COLLECTION
          </span>

          <h2>
            Shop By <span>Category</span>
          </h2>

          <p>
            Discover quality crackers from Sri Priya
            Traders, Sivakasi.
          </p>
        </div>

        <div className="categories-loading">
          <RefreshCw size={28} className="loading-icon" />
          <p>Loading categories...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="categories-section">
      <div className="section-heading">
        <span className="section-kicker">
          <Sparkles size={15} />
          EXPLORE OUR COLLECTION
        </span>

        <h2>
          Shop By <span>Category</span>
        </h2>

        <p>
          Discover quality crackers from Sri Priya
          Traders, Sivakasi.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="categories-empty">
          <Folder size={40} />

          <h3>No Categories Available</h3>

          <p>
            Categories will appear here once they are
            added from the Admin Panel.
          </p>
        </div>
      ) : (
        <>
          <div className="categories-grid">
            {categories.map((category, index) => {
              const Icon =
                icons[index % icons.length];

              const accent =
                accents[index % accents.length];

              return (
                <button
                  type="button"
                  className={`category-card ${accent}`}
                  key={category.id}
                  onClick={() =>
                    openCategory(category.id)
                  }
                >
                  <div className="category-icon">
                    <Icon
                      size={30}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="category-content">
                    <h3>{category.name}</h3>

                    <p>
                      {category.description ||
                        "Explore products in this category"}
                    </p>

                    <span className="category-link">
                      View Products
                      <ArrowRight size={16} />
                    </span>
                  </div>

                  <div className="category-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="categories-bottom">
            <button
              type="button"
              className="view-all-button"
              onClick={() =>
                navigate("/products")
              }
            >
              VIEW ALL PRODUCTS
              <ArrowRight size={18} />
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default Categories;