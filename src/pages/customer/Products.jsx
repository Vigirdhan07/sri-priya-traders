import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getProducts } from "../../services/productService";
import ProductCard from "../../components/products/ProductCard";

import "./Products.css";

function Products() {
  const [searchParams] = useSearchParams();

  const categoryId = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();

        setProducts(data);
      } catch (err) {
        console.error("Error loading products:", err);

        setError(
          "Unable to load products. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  let filteredProducts = products;

  if (categoryId) {
    filteredProducts = products.filter(
      (product) =>
        product.categoryId === Number(categoryId)
    );
  }

  return (
    <section className="products-page">

      <div className="products-container">

        <div className="products-header">

          <span className="section-label">
            SRI PRIYA TRADERS
          </span>

          <h1>
            Our Products
          </h1>

          <p>
            Premium Sivakasi crackers at special prices.
          </p>

        </div>

        {loading && (
          <div className="products-loading">
            <p>Loading products...</p>
          </div>
        )}

        {!loading && error && (
          <div className="products-error">
            <p>{error}</p>
          </div>
        )}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div className="products-empty">
              <p>
                No products found in this category.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (
            <div className="products-grid">

              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}

            </div>
          )}

      </div>

    </section>
  );
}

export default Products;