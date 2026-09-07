import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Tag,
  Package,
  RefreshCw,
  Plus,
  Minus,
} from "lucide-react";

import { supabase } from "../../services/supabase";
import { useCart } from "../../context/CartContext";

import "./PriceList.css";

function PriceList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  useEffect(() => {
    loadPriceList();
  }, []);

  async function loadPriceList() {
    setLoading(true);
    setError("");

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
        throw productError;
      }

      if (categoryError) {
        throw categoryError;
      }

      if (settingsError) {
        throw settingsError;
      }

      const globalDiscount = Number(
        settingsData?.global_discount_percentage ?? 0
      );

      console.log(
        "GLOBAL CUSTOMER DISCOUNT:",
        globalDiscount
      );

      setProducts(productData || []);
      setCategories(categoryData || []);
      setDiscountPercentage(globalDiscount);
    } catch (err) {
      console.error(
        "CUSTOMER PRICE LIST ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to load the latest price list."
      );
    } finally {
      setLoading(false);
    }
  }

  function getActualPrice(product) {
    const price = Number(
      product.actual_price ??
        product.mrp ??
        product.rate ??
        0
    );

    return price;
  }

  function getCustomerPrice(product) {
    const actualPrice =
      getActualPrice(product);

    if (actualPrice <= 0) {
      return 0;
    }

    const discountedPrice =
      actualPrice -
      (actualPrice * discountPercentage) / 100;

    return Math.round(
      discountedPrice * 100
    ) / 100;
  }

  function getDiscountAmount(product) {
    const actualPrice =
      getActualPrice(product);

    const customerPrice =
      getCustomerPrice(product);

    return Math.round(
      (actualPrice - customerPrice) * 100
    ) / 100;
  }

  function handleAdd(product) {
    const actualPrice =
      getActualPrice(product);

    const customerPrice =
      getCustomerPrice(product);

    const discountAmount =
      getDiscountAmount(product);

    if (
      product.is_available !== true ||
      customerPrice <= 0
    ) {
      return;
    }

    const cartProduct = {
      ...product,

      id: product.id,

      name:
        product.product_name ||
        product.name ||
        "Product",

      product_name:
        product.product_name ||
        product.name ||
        "Product",

      productCode:
        product.product_code || "",

      product_code:
        product.product_code || "",

      sellingPrice: customerPrice,

      actualPrice: actualPrice,

      actual_price: actualPrice,

      mrp: actualPrice,

      discount: discountAmount,

      discountPercentage:
        discountPercentage,

      discount_percentage:
        discountPercentage,

      content:
        product.content || "",
    };

    console.log(
      "PRICE LIST ADD TO CART:",
      cartProduct
    );

    addToCart(cartProduct);
  }

  function getCartQuantity(productId) {
    const cartItem = cartItems?.find(
      (item) =>
        String(item.id) === String(productId)
    );

    return cartItem?.quantity || 0;
  }

  function handleIncrease(product) {
    increaseQuantity(product.id);
  }

  function handleDecrease(product) {
    decreaseQuantity(product.id);
  }

  const activeCategories =
    categories.filter(
      (category) =>
        category.is_active !== false
    );

  const groupedCategories =
    activeCategories
      .map((category) => ({
        ...category,

        products: products.filter(
          (product) =>
            String(product.category_id) ===
            String(category.id)
        ),
      }))
      .filter(
        (category) =>
          category.products.length > 0
      );

  if (loading) {
    return (
      <main className="price-list-page">
        <div className="price-list-loading">
          <RefreshCw
            className="loading-icon"
            size={30}
          />

          <p>
            Loading latest price list...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="price-list-page">

      <section className="price-list-hero">

        <span className="price-list-kicker">
          <Tag size={16} />
          SRI PRIYA TRADERS
        </span>

        <h1>
          Customer{" "}
          <span>Price List</span>
        </h1>

        <p>
          Check our latest cracker prices
          and add products directly to
          your cart.
        </p>

        <div className="price-list-discount">
          <strong>
            {discountPercentage}% OFF
          </strong>

          <span>
            Global Customer Discount
          </span>
        </div>

      </section>

      {error && (
        <div className="price-list-error">
          {error}
        </div>
      )}

      <div className="price-list-container">

        {groupedCategories.map(
          (category) => (

            <section
              className="price-category"
              key={category.id}
            >

              <div className="price-category-header">

                <div>
                  <span>
                    SRI PRIYA TRADERS
                  </span>

                  <h2>
                    {category.name}
                  </h2>
                </div>

                <div className="price-category-count">
                  {category.products.length} items
                </div>

              </div>

              <div className="price-table-header">

                <div>
                  PRODUCT
                </div>

                <div>
                  CONTENT
                </div>

                <div>
                  RATE
                </div>

                <div>
                  CUSTOMER RATE
                </div>

                <div>
                  ACTION
                </div>

              </div>

              <div className="price-products-list">

                {category.products.map(
                  (product) => {

                    const actualPrice =
                      getActualPrice(product);

                    const customerPrice =
                      getCustomerPrice(product);

                    const cartQuantity =
                      getCartQuantity(product.id);

                    const available =
                      product.is_available === true &&
                      customerPrice > 0;

                    return (
                      <div
                        className="price-product-row"
                        key={product.id}
                      >

                        <div className="price-product-info">

                          <div className="price-product-code">
                            <Tag size={14} />
                            {product.product_code}
                          </div>

                          <h3>
                            {product.product_name}
                          </h3>

                        </div>

                        <div className="price-product-content">

                          <Package size={16} />

                          <span>
                            {product.content ||
                              "—"}
                          </span>

                        </div>

                        <div className="price-rate">

                          <span className="mobile-price-label">
                            RATE
                          </span>

                          {actualPrice > 0 ? (
                            <strong>
                              ₹
                              {actualPrice.toFixed(
                                2
                              )}
                            </strong>
                          ) : (
                            <span className="price-coming">
                              Price Coming Soon
                            </span>
                          )}

                        </div>

                        <div className="price-customer-rate">

                          <span className="mobile-price-label">
                            CUSTOMER RATE
                          </span>

                          {customerPrice > 0 ? (
                            <>
                              <strong>
                                ₹
                                {customerPrice.toFixed(
                                  2
                                )}
                              </strong>

                              {discountPercentage >
                                0 && (
                                <small>
                                  {
                                    discountPercentage
                                  }
                                  % OFF
                                </small>
                              )}
                            </>
                          ) : (
                            <span className="price-coming">
                              Price Coming Soon
                            </span>
                          )}

                        </div>

                        <div className="price-action">

                          {available ? (

                            cartQuantity > 0 ? (

                              <div className="price-quantity-control">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDecrease(
                                      product
                                    )
                                  }
                                  aria-label="Decrease quantity"
                                >
                                  <Minus
                                    size={16}
                                  />
                                </button>

                                <div className="price-quantity-value">
                                  <strong>
                                    {cartQuantity}
                                  </strong>

                                  <span>
                                    ADDED
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleIncrease(
                                      product
                                    )
                                  }
                                  aria-label="Increase quantity"
                                >
                                  <Plus
                                    size={16}
                                  />
                                </button>

                              </div>

                            ) : (

                              <button
                                type="button"
                                className="price-add-button"
                                onClick={() =>
                                  handleAdd(
                                    product
                                  )
                                }
                              >
                                <ShoppingCart
                                  size={17}
                                />

                                ADD
                              </button>

                            )

                          ) : (

                            <button
                              type="button"
                              className="price-unavailable-button"
                              disabled
                            >
                              UNAVAILABLE
                            </button>

                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </section>
          )
        )}

        {groupedCategories.length === 0 && (
          <div className="price-empty">

            <Package size={40} />

            <h2>
              No products found
            </h2>

            <p>
              The price list is currently
              being updated.
            </p>

          </div>
        )}

      </div>

    </main>
  );
}

export default PriceList;