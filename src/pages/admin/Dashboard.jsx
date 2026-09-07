import { useEffect, useState } from "react";
import {
  Package,
  ShoppingBag,
  IndianRupee,
  Clock3,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    sales: 0,
    newOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [
        productsResult,
        ordersResult,
        salesResult,
        newOrdersResult,
        recentOrdersResult,
      ] = await Promise.all([
        supabase
          .from("products")
          .select("id", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("orders")
          .select("id", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("orders")
          .select("grand_total"),

        supabase
          .from("orders")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("order_status", "New"),

        supabase
          .from("orders")
          .select(
            "id, order_number, customer_name, mobile_number, grand_total, order_status, created_at"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(5),
      ]);

      if (productsResult.error) {
        throw productsResult.error;
      }

      if (ordersResult.error) {
        throw ordersResult.error;
      }

      if (salesResult.error) {
        throw salesResult.error;
      }

      if (newOrdersResult.error) {
        throw newOrdersResult.error;
      }

      if (recentOrdersResult.error) {
        throw recentOrdersResult.error;
      }

      const totalSales = (salesResult.data || []).reduce(
        (total, order) =>
          total + Number(order.grand_total || 0),
        0
      );

      setStats({
        products: productsResult.count || 0,
        orders: ordersResult.count || 0,
        sales: totalSales,
        newOrders: newOrdersResult.count || 0,
      });

      setRecentOrders(
        recentOrdersResult.data || []
      );
    } catch (dashboardError) {
      console.error(
        "Dashboard loading error:",
        dashboardError
      );

      setError(
        "Unable to load dashboard information."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function formatDate(dateString) {
    if (!dateString) {
      return "-";
    }

    return new Date(dateString).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatCurrency(amount) {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN"
    )}`;
  }

  function getStatusClass(status) {
    return (
      status
        ?.toLowerCase()
        .replace(/\s+/g, "-") || "new"
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <span className="dashboard-label">
            SRI PRIYA TRADERS
          </span>

          <h1>Dashboard</h1>

          <p>
            Welcome back, {user?.email}
          </p>
        </div>

        <button
          className="dashboard-refresh"
          onClick={loadDashboard}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "refresh-spinning"
                : ""
            }
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <div className="stat-icon">
            <Package size={23} />
          </div>

          <div>
            <span>Total Products</span>
            <strong>
              {loading ? "..." : stats.products}
            </strong>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon">
            <ShoppingBag size={23} />
          </div>

          <div>
            <span>Total Orders</span>
            <strong>
              {loading ? "..." : stats.orders}
            </strong>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon">
            <IndianRupee size={23} />
          </div>

          <div>
            <span>Total Sales</span>
            <strong>
              {loading
                ? "..."
                : formatCurrency(stats.sales)}
            </strong>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon">
            <Clock3 size={23} />
          </div>

          <div>
            <span>New Orders</span>
            <strong>
              {loading ? "..." : stats.newOrders}
            </strong>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2>Recent Orders</h2>
            <p>
              Latest customer orders received
            </p>
          </div>

          <Link
            to="/admin/orders"
            className="dashboard-view-all"
          >
            View All
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="recent-orders">
          {loading ? (
            <div className="dashboard-empty">
              Loading orders...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="dashboard-empty">
              <ShoppingBag size={30} />
              <strong>
                No orders yet
              </strong>
              <span>
                Customer orders will appear here.
              </span>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div
                className="recent-order-row"
                key={order.id}
              >
                <div className="recent-order-main">
                  <strong>
                    {order.order_number}
                  </strong>

                  <span>
                    {order.customer_name}
                  </span>
                </div>

                <div className="recent-order-date">
                  {formatDate(
                    order.created_at
                  )}
                </div>

                <div
                  className={`order-status ${getStatusClass(
                    order.order_status
                  )}`}
                >
                  {order.order_status}
                </div>

                <strong className="recent-order-total">
                  {formatCurrency(
                    order.grand_total
                  )}
                </strong>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="dashboard-quick-actions">
        <Link
          to="/admin/orders"
          className="quick-action"
        >
          <ShoppingBag size={22} />
          <div>
            <strong>Manage Orders</strong>
            <span>
              View and update customer orders
            </span>
          </div>
          <ArrowRight size={18} />
        </Link>

        <Link
          to="/admin/products"
          className="quick-action"
        >
          <Package size={22} />
          <div>
            <strong>Manage Products</strong>
            <span>
              Edit products and prices
            </span>
          </div>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;