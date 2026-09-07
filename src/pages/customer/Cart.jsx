import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";

import { useCart } from "../../context/CartContext";
import { supabase } from "../../services/supabase";

import "./Cart.css";

function Cart() {
  const {
    cartItems,
    cartCount,
    actualTotal,
    subtotal,
    discountTotal,
    packingCharge,
    grandTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const [minimumOrder, setMinimumOrder] = useState(1500);
  const [loadingMinimumOrder, setLoadingMinimumOrder] =
    useState(true);

  useEffect(() => {
    loadMinimumOrder();
  }, []);

  async function loadMinimumOrder() {
    try {
      setLoadingMinimumOrder(true);

      const { data, error } = await supabase
        .from("site_settings")
        .select("minimum_order")
        .eq("id", 1)
        .single();

      if (error) {
        console.error(
          "Error loading minimum order:",
          error
        );

        // Safe fallback
        setMinimumOrder(1500);
        return;
      }

      const databaseMinimumOrder =
        Number(data?.minimum_order || 0);

      // Use database value if available.
      // Otherwise use ₹1500.
      setMinimumOrder(
        databaseMinimumOrder > 0
          ? databaseMinimumOrder
          : 1500
      );

    } catch (error) {
      console.error(
        "Minimum order loading error:",
        error
      );

      // Safe fallback
      setMinimumOrder(1500);

    } finally {
      setLoadingMinimumOrder(false);
    }
  }

  const minimumOrderNotMet =
    minimumOrder > 0 &&
    subtotal < minimumOrder;

  const amountNeeded = Math.max(
    0,
    minimumOrder - subtotal
  );

  if (cartItems.length === 0) {
    return (
      <section className="cart-page">

        <div className="cart-container">

          <div className="empty-cart">

            <div className="empty-cart-icon">
              <ShoppingCart size={55} />
            </div>

            <h1>
              Your Cart is Empty
            </h1>

            <p>
              Looks like you haven't added any crackers yet.
            </p>

            <Link
              to="/products"
              className="continue-shopping-button"
            >
              <ShoppingBag size={19} />
              Shop Crackers
            </Link>

          </div>

        </div>

      </section>
    );
  }

  return (
    <section className="cart-page">

      <div className="cart-container">

        <div className="cart-header">

          <div>
            <span className="cart-label">
              SRI PRIYA TRADERS
            </span>

            <h1>
              Your Cart
            </h1>

            <p>
              Review your crackers before checkout.
            </p>
          </div>

          <div className="cart-count">
            {cartCount}{" "}
            {cartCount === 1 ? "item" : "items"}
          </div>

        </div>

        <div className="cart-layout">

          {/* CART ITEMS */}

          <div className="cart-items">

            {cartItems.map((item) => {

              const actualPrice =
                Number(item.actualPrice || 0);

              const sellingPrice =
                Number(item.sellingPrice || 0);

              const itemSavings =
                Math.max(
                  0,
                  actualPrice - sellingPrice
                );

              const itemTotal =
                sellingPrice * item.quantity;

              return (
                <div
                  className="cart-item"
                  key={item.id}
                >

                  <div className="cart-item-image">

                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";

                        event.currentTarget.parentElement.classList.add(
                          "image-fallback"
                        );
                      }}
                    />

                    <span>
                      🎆
                    </span>

                  </div>

                  <div className="cart-item-details">

                    <div className="cart-item-code">
                      {item.code}
                    </div>

                    <h2>
                      {item.name}
                    </h2>

                    <p>
                      {item.content}
                    </p>

                    {actualPrice > sellingPrice && (
                      <div className="cart-item-original-price">
                        ₹{actualPrice}
                      </div>
                    )}

                    <div className="cart-item-price">
                      ₹{sellingPrice}

                      <span>
                        / {item.content}
                      </span>
                    </div>

                    {itemSavings > 0 && (
                      <div className="cart-item-savings">
                        You save ₹{itemSavings} per unit
                      </div>
                    )}

                  </div>

                  <div className="cart-item-controls">

                    <div className="quantity-control">

                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                        aria-label={`Decrease ${item.name}`}
                      >
                        <Minus size={17} />
                      </button>

                      <strong>
                        {item.quantity}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                        aria-label={`Increase ${item.name}`}
                      >
                        <Plus size={17} />
                      </button>

                    </div>

                    <strong className="item-total">
                      ₹{itemTotal}
                    </strong>

                    <button
                      type="button"
                      className="remove-item"
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>

                </div>
              );
            })}

            <Link
              to="/products"
              className="back-shopping"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </Link>

          </div>

          {/* ORDER SUMMARY */}

          <aside className="cart-summary">

            <div className="summary-heading">
              <h2>
                Order Summary
              </h2>
            </div>

            <div className="summary-row">
              <span>
                Items
              </span>

              <strong>
                {cartCount}
              </strong>
            </div>

            <div className="summary-row">
              <span>
                Actual Total
              </span>

              <strong>
                ₹{actualTotal}
              </strong>
            </div>

            <div className="summary-row savings-row">
              <span>
                Your Savings
              </span>

              <strong>
                ₹{discountTotal}
              </strong>
            </div>

            <div className="summary-row">
              <span>
                Product Total
              </span>

              <strong>
                ₹{subtotal}
              </strong>
            </div>

            <div className="summary-row">
              <span>
                Packing Charge
              </span>

              <strong>
                {packingCharge > 0
                  ? `₹${packingCharge}`
                  : "FREE"}
              </strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-row total-row">
              <span>
                Grand Total
              </span>

              <strong>
                ₹{grandTotal}
              </strong>
            </div>

            {/* MINIMUM ORDER MESSAGE */}

            {!loadingMinimumOrder &&
              minimumOrder > 0 && (
                <div
                  className={
                    minimumOrderNotMet
                      ? "cart-minimum-warning"
                      : "cart-minimum-success"
                  }
                >

                  {minimumOrderNotMet ? (
                    <>
                      <strong>
                        ⚠️ Minimum Order ₹{minimumOrder}
                      </strong>

                      <span>
                        Add ₹{amountNeeded} more to continue.
                      </span>
                    </>
                  ) : (
                    <>
                      <strong>
                        ✅ Minimum order reached
                      </strong>

                      <span>
                        You can proceed to checkout.
                      </span>
                    </>
                  )}

                </div>
              )}

            <p className="packing-note">
              Packing and delivery charges, if applicable,
              will be confirmed with your order.
            </p>

            {/* CHECKOUT BUTTON */}

            {minimumOrderNotMet ? (
              <button
                type="button"
                className="checkout-button checkout-button-disabled"
                disabled
              >
                Add ₹{amountNeeded} More
              </button>
            ) : (
              <Link
                to="/checkout"
                className="checkout-button"
              >
                Proceed to Checkout
              </Link>
            )}

            <div className="secure-note">
              🔒 Order details will be reviewed before confirmation.
            </div>

          </aside>

        </div>

      </div>

    </section>
  );
}

export default Cart;