import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Home,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

import { useCart } from "../../context/CartContext";
import { supabase } from "../../services/supabase";

import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartCount,
    actualTotal,
    subtotal,
    discountTotal,
    packingCharge,
    grandTotal,
  } = useCart();

  const [minimumOrder, setMinimumOrder] = useState(0);
  const [loadingMinimumOrder, setLoadingMinimumOrder] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "",
    state: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

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

        setMinimumOrder(0);
        return;
      }

      setMinimumOrder(
        Number(data?.minimum_order || 0)
      );
    } catch (error) {
      console.error(
        "Minimum order loading error:",
        error
      );

      setMinimumOrder(0);
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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name.";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile =
        "Please enter your mobile number.";
    } else if (
      !/^[6-9]\d{9}$/.test(
        formData.mobile.trim()
      )
    ) {
      newErrors.mobile =
        "Enter a valid 10-digit mobile number.";
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email =
        "Enter a valid email address.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Please enter your city.";
    }

    if (!formData.state.trim()) {
      newErrors.state = "Please enter your state.";
    }

    if (!formData.address.trim()) {
      newErrors.address =
        "Please enter your full address.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (event) => {
    event.preventDefault();

    if (minimumOrderNotMet) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    navigate("/order-review", {
      state: {
        customer: {
          ...formData,
        },
      },
    });
  };

  if (cartItems.length === 0) {
    return (
      <section className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-empty">
            <ShoppingBag size={55} />

            <h1>
              Your Cart is Empty
            </h1>

            <p>
              Add some crackers before continuing
              to checkout.
            </p>

            <Link
              to="/products"
              className="checkout-shop-button"
            >
              Shop Crackers
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <div className="checkout-container">

        <div className="checkout-header">
          <div>
            <span className="checkout-label">
              SRI PRIYA TRADERS
            </span>

            <h1>
              Checkout
            </h1>

            <p>
              Enter your details to continue
              with your order.
            </p>
          </div>

          <div className="checkout-items-count">
            {cartCount}{" "}
            {cartCount === 1
              ? "item"
              : "items"}
          </div>
        </div>

        <form
          className="checkout-layout"
          onSubmit={handleContinue}
        >

          {/* CUSTOMER DETAILS */}

          <div className="customer-form">

            <div className="form-card">

              <div className="form-card-header">

                <div className="form-icon">
                  <User size={21} />
                </div>

                <div>
                  <h2>
                    Customer Details
                  </h2>

                  <p>
                    Please provide your contact
                    information.
                  </p>
                </div>

              </div>

              {/* NAME */}

              <div className="form-group">

                <label htmlFor="name">
                  Full Name
                  <span>*</span>
                </label>

                <div className="input-wrapper">
                  <User size={18} />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                {errors.name && (
                  <small className="form-error">
                    {errors.name}
                  </small>
                )}

              </div>

              {/* MOBILE */}

              <div className="form-group">

                <label htmlFor="mobile">
                  Mobile Number
                  <span>*</span>
                </label>

                <div className="input-wrapper">
                  <Phone size={18} />

                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength="10"
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>

                {errors.mobile && (
                  <small className="form-error">
                    {errors.mobile}
                  </small>
                )}

              </div>

              {/* EMAIL */}

              <div className="form-group">

                <label htmlFor="email">
                  Email Address
                  <small>Optional</small>
                </label>

                <div className="input-wrapper">
                  <Mail size={18} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="yourname@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {errors.email && (
                  <small className="form-error">
                    {errors.email}
                  </small>
                )}

              </div>

              <div className="form-row">

                {/* CITY */}

                <div className="form-group">

                  <label htmlFor="city">
                    City
                    <span>*</span>
                  </label>

                  <div className="input-wrapper">
                    <MapPin size={18} />

                    <input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="Your city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  {errors.city && (
                    <small className="form-error">
                      {errors.city}
                    </small>
                  )}

                </div>

                {/* STATE */}

                <div className="form-group">

                  <label htmlFor="state">
                    State
                    <span>*</span>
                  </label>

                  <div className="input-wrapper">
                    <MapPin size={18} />

                    <input
                      id="state"
                      name="state"
                      type="text"
                      placeholder="Your state"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>

                  {errors.state && (
                    <small className="form-error">
                      {errors.state}
                    </small>
                  )}

                </div>

              </div>

              {/* ADDRESS */}

              <div className="form-group">

                <label htmlFor="address">
                  Full Address
                  <span>*</span>
                </label>

                <div className="input-wrapper textarea-wrapper">
                  <Home size={18} />

                  <textarea
                    id="address"
                    name="address"
                    rows="4"
                    placeholder="House / Shop number, street, area..."
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                {errors.address && (
                  <small className="form-error">
                    {errors.address}
                  </small>
                )}

              </div>

            </div>
          </div>

          {/* ORDER SUMMARY */}

          <aside className="checkout-summary">

            <div className="checkout-summary-card">

              <div className="summary-title">
                <h2>
                  Order Summary
                </h2>

                <span>
                  {cartCount}{" "}
                  {cartCount === 1
                    ? "item"
                    : "items"}
                </span>
              </div>

              <div className="checkout-products">

                {cartItems.map((item) => (
                  <div
                    className="checkout-product"
                    key={item.id}
                  >

                    <div>
                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        Qty: {item.quantity}
                      </span>
                    </div>

                    <strong>
                      ₹
                      {Number(
                        item.sellingPrice || 0
                      ) * item.quantity}
                    </strong>

                  </div>
                ))}

              </div>

              <div className="checkout-total-lines">

                <div>
                  <span>
                    Actual Total
                  </span>

                  <strong>
                    ₹{actualTotal}
                  </strong>
                </div>

                <div className="checkout-savings">
                  <span>
                    Your Savings
                  </span>

                  <strong>
                    ₹{discountTotal}
                  </strong>
                </div>

                <div>
                  <span>
                    Product Total
                  </span>

                  <strong>
                    ₹{subtotal}
                  </strong>
                </div>

                <div>
                  <span>
                    Packing Charge
                  </span>

                  <strong>
                    {packingCharge > 0
                      ? `₹${packingCharge}`
                      : "FREE"}
                  </strong>
                </div>

              </div>

              {/* MINIMUM ORDER MESSAGE */}

              {!loadingMinimumOrder &&
                minimumOrder > 0 && (
                  <div
                    className={
                      minimumOrderNotMet
                        ? "minimum-order-warning"
                        : "minimum-order-success"
                    }
                  >
                    {minimumOrderNotMet ? (
                      <>
                        <strong>
                          ⚠️ Minimum Order ₹
                          {minimumOrder}
                        </strong>

                        <span>
                          Add ₹{amountNeeded} more
                          to continue.
                        </span>
                      </>
                    ) : (
                      <>
                        <strong>
                          ✅ Minimum order reached
                        </strong>

                        <span>
                          You can continue to
                          checkout.
                        </span>
                      </>
                    )}
                  </div>
                )}

              <div className="checkout-grand-total">

                <span>
                  Grand Total
                </span>

                <strong>
                  ₹{grandTotal}
                </strong>

              </div>

              <div className="checkout-actions">

                <Link
                  to="/cart"
                  className="back-cart-button"
                >
                  <ArrowLeft size={17} />
                  Back to Cart
                </Link>

                <button
                  type="submit"
                  className="continue-button"
                  disabled={
                    loadingMinimumOrder ||
                    minimumOrderNotMet
                  }
                >
                  {minimumOrderNotMet
                    ? "Minimum Order Not Reached"
                    : "Continue"}

                  {!minimumOrderNotMet && (
                    <ArrowRight size={18} />
                  )}
                </button>

              </div>

              <p className="checkout-note">
                Your order will be reviewed before
                final confirmation.
              </p>

            </div>
          </aside>

        </form>

      </div>
    </section>
  );
}

export default Checkout;