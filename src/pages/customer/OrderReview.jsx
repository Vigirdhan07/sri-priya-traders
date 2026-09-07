import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  User,
  Phone,
  Mail,
  MapPin,
  Home,
  ArrowLeft,
  CheckCircle,
  ShoppingBag,
  MessageCircle,
} from "lucide-react";

import { useCart } from "../../context/CartContext";

import { createOrder } from "../../services/orderService";

import "./OrderReview.css";

function OrderReview() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    cartItems,
    cartCount,
    actualTotal,
    subtotal,
    discountTotal,
    packingCharge,
    grandTotal,
    clearCart,
  } = useCart();

  const customer = location.state?.customer;

  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  if (!customer) {
    return (
      <section className="review-page">

        <div className="review-container">

          <div className="review-error">

            <div className="review-error-icon">
              ⚠️
            </div>

            <h1>
              Customer Details Not Found
            </h1>

            <p>
              Please go back to checkout and enter your details again.
            </p>

            <Link
              to="/checkout"
              className="review-back-button"
            >
              Back to Checkout
            </Link>

          </div>

        </div>

      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section className="review-page">

        <div className="review-container">

          <div className="review-error">

            <div className="review-error-icon">
              🛒
            </div>

            <h1>
              Your Cart is Empty
            </h1>

            <p>
              Add products before reviewing your order.
            </p>

            <Link
              to="/products"
              className="review-back-button"
            >
              Shop Crackers
            </Link>

          </div>

        </div>

      </section>
    );
  }

  const handleEditDetails = () => {
    navigate("/checkout", {
      state: {
        customer,
      },
    });
  };

  const handleConfirmOrder = async () => {
    if (confirming) {
      return;
    }

    try {
      setConfirming(true);
      setError("");

      const result = await createOrder({
        customer,
        cartItems,
        cartCount,
        subtotal,
        discountTotal,
        packingCharge,
        grandTotal,
      });

      const ownerWhatsAppNumber =
        "916379660799";

      const message = [
        "🔥 SRI PRIYA TRADERS - NEW ORDER",
        "",
        `Order ID: ${result.orderNumber}`,
        "",
        `Customer: ${customer.name}`,
        `Mobile: ${customer.mobile}`,
        customer.email
          ? `Email: ${customer.email}`
          : null,
        `City: ${customer.city}`,
        `State: ${customer.state}`,
        `Address: ${customer.address}`,
        "",
        `Total Products: ${cartCount}`,
        `Product Total: ₹${subtotal}`,
        `Savings: ₹${discountTotal}`,
        `Grand Total: ₹${grandTotal}`,
        "",
        "Please check the order in the Admin Panel.",
      ]
        .filter(Boolean)
        .join("\n");

      const whatsappUrl =
        `https://wa.me/${ownerWhatsAppNumber}?text=` +
        encodeURIComponent(message);

      clearCart();

      navigate("/order-success", {
        state: {
          orderNumber: result.orderNumber,
          customer,
          grandTotal,
        },
        replace: true,
      });

      window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (err) {
      console.error(
        "Confirm order error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while confirming your order."
      );

      setConfirming(false);
    }
  };

  return (
    <section className="review-page">

      <div className="review-container">

        {/* HEADER */}

        <div className="review-header">

          <div>

            <span className="review-label">
              SRI PRIYA TRADERS
            </span>

            <h1>
              Review Your Order
            </h1>

            <p>
              Please check all details before confirming your order.
            </p>

          </div>

          <div className="review-status">
            <CheckCircle size={18} />
            Review
          </div>

        </div>

        {/* MAIN */}

        <div className="review-layout">

          {/* LEFT */}

          <div className="review-main">

            {/* CUSTOMER */}

            <div className="review-card">

              <div className="review-card-header">

                <div className="review-card-icon">
                  <User size={20} />
                </div>

                <div>

                  <h2>
                    Customer Details
                  </h2>

                  <p>
                    Order contact information
                  </p>

                </div>

              </div>

              <div className="customer-details-grid">

                <div className="customer-detail">

                  <User size={18} />

                  <div>

                    <span>
                      Full Name
                    </span>

                    <strong>
                      {customer.name}
                    </strong>

                  </div>

                </div>

                <div className="customer-detail">

                  <Phone size={18} />

                  <div>

                    <span>
                      Mobile Number
                    </span>

                    <strong>
                      {customer.mobile}
                    </strong>

                  </div>

                </div>

                {customer.email && (
                  <div className="customer-detail">

                    <Mail size={18} />

                    <div>

                      <span>
                        Email Address
                      </span>

                      <strong>
                        {customer.email}
                      </strong>

                    </div>

                  </div>
                )}

                <div className="customer-detail">

                  <MapPin size={18} />

                  <div>

                    <span>
                      City
                    </span>

                    <strong>
                      {customer.city}
                    </strong>

                  </div>

                </div>

                <div className="customer-detail">

                  <MapPin size={18} />

                  <div>

                    <span>
                      State
                    </span>

                    <strong>
                      {customer.state}
                    </strong>

                  </div>

                </div>

                <div className="customer-detail address-detail">

                  <Home size={18} />

                  <div>

                    <span>
                      Full Address
                    </span>

                    <strong>
                      {customer.address}
                    </strong>

                  </div>

                </div>

              </div>

              <button
                type="button"
                className="edit-details-button"
                onClick={handleEditDetails}
              >
                Edit Customer Details
              </button>

            </div>

            {/* PRODUCTS */}

            <div className="review-card">

              <div className="review-card-header">

                <div className="review-card-icon">
                  <ShoppingBag size={20} />
                </div>

                <div>

                  <h2>
                    Ordered Products
                  </h2>

                  <p>
                    {cartCount}{" "}
                    {cartCount === 1
                      ? "item"
                      : "items"}{" "}
                    in your order
                  </p>

                </div>

              </div>

              <div className="review-products">

                {cartItems.map((item) => (

                  <div
                    className="review-product"
                    key={item.id}
                  >

                    <div className="review-product-image">

                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";

                          event.currentTarget.parentElement.classList.add(
                            "review-image-fallback"
                          );
                        }}
                      />

                      <span>
                        🎆
                      </span>

                    </div>

                    <div className="review-product-info">

                      <span className="review-product-code">
                        {item.code}
                      </span>

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        {item.content}
                      </p>

                    </div>

                    <div className="review-product-quantity">

                      <span>
                        Quantity
                      </span>

                      <strong>
                        {item.quantity}
                      </strong>

                    </div>

                    <div className="review-product-price">

                      <span>
                        ₹{item.sellingPrice} ×{" "}
                        {item.quantity}
                      </span>

                      <strong>
                        ₹
                        {Number(
                          item.sellingPrice || 0
                        ) * item.quantity}
                      </strong>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* SUMMARY */}

          <aside className="review-summary">

            <div className="review-summary-card">

              <h2>
                Order Summary
              </h2>

              <div className="summary-line">

                <span>
                  Total Items
                </span>

                <strong>
                  {cartCount}
                </strong>

              </div>

              <div className="summary-line">

                <span>
                  Actual Total
                </span>

                <strong>
                  ₹{actualTotal}
                </strong>

              </div>

              <div className="summary-line">

                <span>
                  Product Total
                </span>

                <strong>
                  ₹{subtotal}
                </strong>

              </div>

              <div className="summary-line savings">

                <span>
                  Your Savings
                </span>

                <strong>
                  ₹{discountTotal}
                </strong>

              </div>

              <div className="summary-line">

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

              <div className="review-grand-total">

                <span>
                  Grand Total
                </span>

                <strong>
                  ₹{grandTotal}
                </strong>

              </div>

              {error && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#ffe8e8",
                    color: "#a00000",
                    fontSize: "13px",
                    lineHeight: "1.5",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="review-info-box">

                <strong>
                  📱 WhatsApp Confirmation
                </strong>

                <p>
                  Your order will first be saved securely.
                  Then the order summary will be opened in WhatsApp.
                </p>

              </div>

              <button
                type="button"
                className="confirm-order-button"
                onClick={handleConfirmOrder}
                disabled={confirming}
              >

                <MessageCircle size={19} />

                {confirming
                  ? "Saving Order..."
                  : "Confirm Order on WhatsApp"}

              </button>

              <Link
                to="/cart"
                className="review-cart-button"
              >

                <ArrowLeft size={17} />

                Back to Cart

              </Link>

              <p className="review-note">
                Please verify your products, quantity and
                customer details before confirming.
              </p>

            </div>

          </aside>

        </div>

      </div>

    </section>
  );
}

export default OrderReview;