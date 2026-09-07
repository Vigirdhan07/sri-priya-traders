import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  X,
  Download,
  MessageCircle,
  RefreshCw,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "../../services/supabase";
import "./Orders.css";

const ORDER_STATUSES = [
  "New",
  "Contacted",
  "Confirmed",
  "Payment Pending",
  "Payment Received",
  "Processing",
  "Completed",
  "Cancelled",
];

function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] =
    useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [orderItems, setOrderItems] =
    useState([]);

  const [loadingDetails, setLoadingDetails] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  async function loadOrders(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const { data, error: ordersError } =
        await supabase
          .from("orders")
          .select(
            `
              id,
              order_number,
              customer_name,
              mobile_number,
              email,
              state,
              city,
              address,
              subtotal,
              discount_percentage,
              discount_amount,
              packing_charge,
              grand_total,
              order_status,
              created_at,
              updated_at
            `
          )
          .order("created_at", {
            ascending: false,
          });

      if (ordersError) {
        throw ordersError;
      }

      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (ordersError) {
      console.error(
        "Orders loading error:",
        ordersError
      );

      setError(
        "Unable to load orders. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    if (!searchText) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter((order) => {
      return (
        order.order_number
          ?.toLowerCase()
          .includes(searchText) ||
        order.customer_name
          ?.toLowerCase()
          .includes(searchText) ||
        order.mobile_number
          ?.toLowerCase()
          .includes(searchText) ||
        order.email
          ?.toLowerCase()
          .includes(searchText)
      );
    });

    setFilteredOrders(filtered);
  }, [search, orders]);

  async function openOrder(order) {
    setSelectedOrder(order);
    setOrderItems([]);
    setLoadingDetails(true);

    try {
      const { data, error: itemsError } =
        await supabase
          .from("order_items")
          .select(
            `
              id,
              order_id,
              product_id,
              product_code,
              product_name,
              content,
              quantity,
              actual_price,
              discount_percentage,
              selling_price,
              item_total
            `
          )
          .eq("order_id", order.id)
          .order("id", {
            ascending: true,
          });

      if (itemsError) {
        throw itemsError;
      }

      setOrderItems(data || []);
    } catch (itemsError) {
      console.error(
        "Order items loading error:",
        itemsError
      );

      setError(
        "Unable to load the products for this order."
      );
    } finally {
      setLoadingDetails(false);
    }
  }

  function closeOrder() {
    setSelectedOrder(null);
    setOrderItems([]);
  }

  async function updateStatus(newStatus) {
    if (!selectedOrder) {
      return;
    }

    try {
      setUpdatingStatus(true);

      const { error: updateError } =
        await supabase
          .from("orders")
          .update({
            order_status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedOrder.id);

      if (updateError) {
        throw updateError;
      }

      const updatedOrder = {
        ...selectedOrder,
        order_status: newStatus,
        updated_at: new Date().toISOString(),
      };

      setSelectedOrder(updatedOrder);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === selectedOrder.id
            ? updatedOrder
            : order
        )
      );

      setFilteredOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === selectedOrder.id
            ? updatedOrder
            : order
        )
      );
    } catch (statusError) {
      console.error(
        "Status update error:",
        statusError
      );

      setError(
        "Unable to update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;
  }

  function formatDate(dateString) {
    if (!dateString) {
      return "-";
    }

    return new Date(dateString).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function getStatusClass(status) {
    return (
      status
        ?.toLowerCase()
        .replace(/\s+/g, "-") || "new"
    );
  }

  function downloadOrderExcel() {
    if (!selectedOrder) {
      return;
    }

    const orderRows = [
      {
        "Order ID":
          selectedOrder.order_number,
        "Customer Name":
          selectedOrder.customer_name,
        "Mobile Number":
          selectedOrder.mobile_number,
        Email:
          selectedOrder.email || "",
        City:
          selectedOrder.city || "",
        State:
          selectedOrder.state || "",
        Address:
          selectedOrder.address || "",
        "Order Status":
          selectedOrder.order_status || "",
        "Order Date":
          formatDate(
            selectedOrder.created_at
          ),
      },
    ];

    const itemRows = orderItems.map(
      (item) => ({
        "Product Code":
          item.product_code || "",
        "Product Name":
          item.product_name || "",
        Content:
          item.content || "",
        Quantity:
          Number(item.quantity || 0),
        "Actual Price":
          Number(
            item.actual_price || 0
          ),
        "Discount %":
          Number(
            item.discount_percentage || 0
          ),
        "Selling Price":
          Number(
            item.selling_price || 0
          ),
        "Item Total":
          Number(item.item_total || 0),
      })
    );

    const summaryRows = [
      {
        "Actual Total": Number(
          selectedOrder.subtotal || 0
        ),
        "Savings": Number(
          selectedOrder.discount_amount ||
            0
        ),
        "Product Total": Number(
          selectedOrder.grand_total || 0
        ) -
          Number(
            selectedOrder.packing_charge || 0
          ),
        "Packing Charge": Number(
          selectedOrder.packing_charge || 0
        ),
        "Grand Total": Number(
          selectedOrder.grand_total || 0
        ),
      },
    ];

    const workbook =
      XLSX.utils.book_new();

    const orderSheet =
      XLSX.utils.json_to_sheet(
        orderRows
      );

    const itemsSheet =
      XLSX.utils.json_to_sheet(
        itemRows
      );

    const summarySheet =
      XLSX.utils.json_to_sheet(
        summaryRows
      );

    XLSX.utils.book_append_sheet(
      workbook,
      orderSheet,
      "Customer Details"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      itemsSheet,
      "Ordered Products"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      "Order Summary"
    );

    const fileName = `${
      selectedOrder.order_number
    }.xlsx`;

    XLSX.writeFile(
      workbook,
      fileName
    );
  }

  function openWhatsApp() {
    if (!selectedOrder) {
      return;
    }

    const message = [
      "🔥 SRI PRIYA TRADERS - ORDER",
      "",
      `Order ID: ${selectedOrder.order_number}`,
      `Customer: ${selectedOrder.customer_name}`,
      `Mobile: ${selectedOrder.mobile_number}`,
      `Total: ${formatCurrency(
        selectedOrder.grand_total
      )}`,
      `Status: ${selectedOrder.order_status}`,
    ].join("\n");

    const encodedMessage =
      encodeURIComponent(message);

    const phone =
      selectedOrder.mobile_number?.replace(
        /\D/g,
        ""
      );

    if (!phone) {
      return;
    }

    window.open(
      `https://wa.me/91${phone}?text=${encodedMessage}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <span className="orders-label">
            SRI PRIYA TRADERS
          </span>

          <h1>Orders</h1>

          <p>
            Manage customer orders and
            download order details.
          </p>
        </div>

        <button
          className="orders-refresh"
          onClick={() =>
            loadOrders(true)
          }
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "orders-refresh-spin"
                : ""
            }
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="orders-error">
          {error}
        </div>
      )}

      <div className="orders-toolbar">
        <div className="orders-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search Order ID, customer, mobile or email..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="orders-count">
          {filteredOrders.length}{" "}
          {filteredOrders.length === 1
            ? "order"
            : "orders"}
        </div>
      </div>

      <div className="orders-table-card">
        {loading ? (
          <div className="orders-loading">
            <RefreshCw
              size={24}
              className="orders-refresh-spin"
            />
            <span>
              Loading orders...
            </span>
          </div>
        ) : filteredOrders.length ===
          0 ? (
          <div className="orders-empty">
            <Package size={38} />

            <strong>
              No orders found
            </strong>

            <span>
              Try another search or wait
              for a customer order.
            </span>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  (order) => (
                    <tr key={order.id}>
                      <td>
                        <strong className="order-id">
                          {
                            order.order_number
                          }
                        </strong>
                      </td>

                      <td>
                        <div className="customer-cell">
                          <strong>
                            {
                              order.customer_name
                            }
                          </strong>

                          <span>
                            {order.city},{" "}
                            {order.state}
                          </span>
                        </div>
                      </td>

                      <td>
                        {
                          order.mobile_number
                        }
                      </td>

                      <td>
                        <span className="order-date">
                          {formatDate(
                            order.created_at
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`order-status ${getStatusClass(
                            order.order_status
                          )}`}
                        >
                          {
                            order.order_status
                          }
                        </span>
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            order.grand_total
                          )}
                        </strong>
                      </td>

                      <td>
                        <button
                          className="view-order-button"
                          onClick={() =>
                            openOrder(order)
                          }
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div
          className="order-modal-overlay"
          onClick={closeOrder}
        >
          <div
            className="order-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="order-modal-header">
              <div>
                <span>
                  ORDER DETAILS
                </span>

                <h2>
                  {
                    selectedOrder.order_number
                  }
                </h2>
              </div>

              <button
                className="order-modal-close"
                onClick={closeOrder}
              >
                <X size={22} />
              </button>
            </div>

            <div className="order-modal-body">
              <div className="order-info-grid">
                <div className="order-info-card">
                  <div className="order-info-title">
                    <User size={18} />
                    <strong>
                      Customer Information
                    </strong>
                  </div>

                  <div className="order-info-list">
                    <div>
                      <span>
                        Full Name
                      </span>
                      <strong>
                        {
                          selectedOrder.customer_name
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Mobile Number
                      </span>
                      <strong>
                        {
                          selectedOrder.mobile_number
                        }
                      </strong>
                      </div>

                    <div>
                      <span>
                        Email
                      </span>
                      <strong>
                        {
                          selectedOrder.email ||
                          "-"
                        }
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="order-info-card">
                  <div className="order-info-title">
                    <MapPin size={18} />
                    <strong>
                      Delivery Address
                    </strong>
                  </div>

                  <div className="order-info-list">
                    <div>
                      <span>
                        City
                      </span>
                      <strong>
                        {
                          selectedOrder.city
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        State
                      </span>
                      <strong>
                        {
                          selectedOrder.state
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Full Address
                      </span>
                      <strong>
                        {
                          selectedOrder.address
                        }
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-products-section">
                <div className="order-section-heading">
                  <div>
                    <h3>
                      Ordered Products
                    </h3>
                    <span>
                      {orderItems.length}{" "}
                      product{" "}
                      {orderItems.length ===
                      1
                        ? ""
                        : "s"}
                    </span>
                  </div>
                </div>

                {loadingDetails ? (
                  <div className="order-items-loading">
                    <RefreshCw
                      size={20}
                      className="orders-refresh-spin"
                    />
                    Loading products...
                  </div>
                ) : (
                  <div className="order-items-wrapper">
                    {orderItems.map(
                      (item) => (
                        <div
                          className="order-item"
                          key={item.id}
                        >
                          <div className="order-item-main">
                            <strong>
                              {
                                item.product_name
                              }
                            </strong>

                            <span>
                              {item.product_code ||
                                "No code"}
                              {item.content
                                ? ` • ${item.content}`
                                : ""}
                            </span>
                          </div>

                          <div className="order-item-qty">
                            ×{" "}
                            {item.quantity}
                          </div>

                          <div className="order-item-price">
                            <span>
                              {formatCurrency(
                                item.selling_price
                              )}{" "}
                              each
                            </span>

                            <strong>
                              {formatCurrency(
                                item.item_total
                              )}
                            </strong>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="order-bottom-grid">
                <div className="order-summary-card">
                  <div className="order-info-title">
                    <Package size={18} />
                    <strong>
                      Order Summary
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>
                      Actual Total
                    </span>

                    <strong>
                      {formatCurrency(
                        Number(
                          selectedOrder.subtotal ||
                            0
                        ) +
                          Number(
                            selectedOrder.discount_amount ||
                              0
                          )
                      )}
                    </strong>
                  </div>

                  <div className="summary-row savings">
                    <span>
                      Savings
                    </span>

                    <strong>
                      -
                      {formatCurrency(
                        selectedOrder.discount_amount
                      )}
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>
                      Product Total
                    </span>

                    <strong>
                      {formatCurrency(
                        Number(
                          selectedOrder.grand_total ||
                            0
                        ) -
                          Number(
                            selectedOrder.packing_charge ||
                              0
                          )
                      )}
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>
                      Packing Charge
                    </span>

                    <strong>
                      {Number(
                        selectedOrder.packing_charge ||
                          0
                      ) === 0
                        ? "FREE"
                        : formatCurrency(
                            selectedOrder.packing_charge
                          )}
                    </strong>
                  </div>

                  <div className="summary-total">
                    <span>
                      Grand Total
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedOrder.grand_total
                      )}
                    </strong>
                  </div>
                </div>

                <div className="order-status-card">
                  <div className="order-info-title">
                    <CalendarDays
                      size={18}
                    />
                    <strong>
                      Order Status
                    </strong>
                  </div>

                  <label>
                    Current Status
                  </label>

                  <div className="status-select-wrapper">
                    <select
                      value={
                        selectedOrder.order_status
                      }
                      onChange={(event) =>
                        updateStatus(
                          event.target.value
                        )
                      }
                      disabled={
                        updatingStatus
                      }
                    >
                      {ORDER_STATUSES.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={17}
                    />
                  </div>

                  <span className="status-help">
                    Change the order status
                    as you process it.
                  </span>
                </div>
              </div>
            </div>

            <div className="order-modal-footer">
              <button
                className="download-order-button"
                onClick={
                  downloadOrderExcel
                }
                disabled={
                  loadingDetails ||
                  orderItems.length === 0
                }
              >
                <Download size={18} />
                Download Excel
              </button>

              <button
                className="whatsapp-order-button"
                onClick={
                  openWhatsApp
                }
              >
                <MessageCircle
                  size={18}
                />
                WhatsApp Customer
              </button>

              <button
                className="close-order-button"
                onClick={closeOrder}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;