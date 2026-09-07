import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

import ProductCard from "./ProductCard";
import { getProducts } from "../../services/productService";

import "./FeaturedProducts.css";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  async function loadFeaturedProducts() {
    try {
      setLoading(true);

      const data = await getProducts();

      const featuredProducts = (data || [])
        .filter(
          (product) =>
            product.isAvailable === true &&
            product.actualPrice !== null &&
            product.actualPrice !== undefined &&
            Number(product.actualPrice) > 0 &&
            product.sellingPrice !== null &&
            product.sellingPrice !== undefined &&
            Number(product.sellingPrice) > 0
        )
        .slice(0, 4);

      console.log(
        "HOME FEATURED PRODUCTS:",
        featuredProducts
      );

      setProducts(featuredProducts);
    } catch (error) {
      console.error(
        "Featured products error:",
        error
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="featured-products-section">

      <div className="featured-heading">

        <span className="featured-kicker">
          <Sparkles size={15} />
          SRI PRIYA TRADERS
        </span>

        <h2>
          Popular <span>Products</span>
        </h2>

        <p>
          Browse some of our popular crackers
          and add them directly to your cart.
        </p>

      </div>

      {loading ? (
        <div className="featured-loading">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="featured-empty">
          Products will appear here soon.
        </div>
      ) : (
        <div className="featured-products-grid">

          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>
      )}

      <div className="featured-bottom">

        <Link
          to="/products"
          className="featured-view-all"
        >
          BROWSE ALL PRODUCTS
          <span>→</span>
        </Link>

      </div>

    </section>
  );
}

export default FeaturedProducts;