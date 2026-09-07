import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle,
  ShoppingBag,
  Home,
} from "lucide-react";

import "./OrderSuccess.css";

function OrderSuccess() {
  const location = useLocation();

  const orderNumber =
    location.state?.orderNumber;

  const grandTotal =
    location.state?.grandTotal;

  return (
    <section className="order-success-page">

      <div className="order-success-card">

        <div className="success-icon">
          <CheckCircle size={58} />
        </div>

        <span className="success-label">
          SRI PRIYA TRADERS
        </span>

        <h1>
          Order Confirmed!
        </h1>

        <p>
          Your order has been successfully saved.
        </p>

        {orderNumber && (
          <div className="order-number-box">

            <span>
              Order ID
            </span>

            <strong>
              {orderNumber}
            </strong>

          </div>
        )}

        {grandTotal !== undefined && (
          <div className="success-total">

            <span>
              Grand Total
            </span>

            <strong>
              ₹{grandTotal}
            </strong>

          </div>
        )}

        <div className="success-whatsapp">

          <strong>
            📱 WhatsApp
          </strong>

          <p>
            The order summary has been prepared for
            WhatsApp confirmation with Sri Priya Traders.
          </p>

        </div>

        <div className="success-actions">

          <Link
            to="/products"
            className="success-shop-button"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>

          <Link
            to="/"
            className="success-home-button"
          >
            <Home size={18} />
            Home
          </Link>

        </div>

      </div>

    </section>
  );
}

export default OrderSuccess;