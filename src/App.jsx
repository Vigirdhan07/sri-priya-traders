import { Routes, Route } from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/layout/Navbar";
import Hero from "./components/layout/Hero";
import Categories from "./components/products/Categories";
import FeaturedProducts from "./components/products/FeaturedProducts";

import Contact from "./pages/customer/Contact";
import Products from "./pages/customer/Products";
import CustomerPriceList from "./pages/customer/PriceList";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import OrderReview from "./pages/customer/OrderReview";
import OrderSuccess from "./pages/customer/OrderSuccess";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminRoute from "./pages/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import ManageImages from "./pages/admin/ManageImages";
import AdminCategories from "./pages/admin/Categories";
import PriceList from "./pages/admin/PriceList";
import Settings from "./pages/admin/Settings";

import "./App.css";
import "./HomePoster.css";

function Home() {
  return (
    <>
      {/* Main Hero */}
      <Hero />

      {/* Sri Priya Traders Promotional Poster */}
      <section className="spt-poster-section">
        <img
          src="/images/spt-poster.jpeg"
          alt="Sri Priya Traders - Premium Sivakasi Crackers"
          className="spt-poster"
        />
      </section>

      {/* Product Categories */}
      <Categories />

      {/* Featured Products */}
      <FeaturedProducts />
    </>
  );
}

function CustomerLayout() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/products" element={<Products />} />

        <Route
          path="/price-list"
          element={<CustomerPriceList />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/order-review"
          element={<OrderReview />}
        />

        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>

          {/* Admin Login */}
          <Route
            path="/admin"
            element={<AdminLogin />}
          />

          {/* Protected Admin Area */}
          <Route element={<AdminRoute />}>
            <Route
              path="/admin/*"
              element={<AdminLayout />}
            >
              <Route
                path="dashboard"
                element={<Dashboard />}
              />

              <Route
                path="orders"
                element={<Orders />}
              />

              <Route
                path="products"
                element={<AdminProducts />}
              />

              <Route
                path="images"
                element={<ManageImages />}
              />

              <Route
                path="categories"
                element={<AdminCategories />}
              />

              <Route
                path="price-list"
                element={<PriceList />}
              />

              <Route
                path="settings"
                element={<Settings />}
              />
            </Route>
          </Route>

          {/* Customer Website */}
          <Route
            path="/*"
            element={<CustomerLayout />}
          />

        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;