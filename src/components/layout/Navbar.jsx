import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

import { useCart } from "../../context/CartContext";
import { supabase } from "../../services/supabase";

import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const { cartCount } = useCart();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    async function loadAnnouncement() {
      const { data, error } = await supabase
        .from("site_settings")
        .select("announcement")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        console.error(
          "ANNOUNCEMENT LOAD ERROR:",
          error
        );

        setAnnouncement(
          "SRI PRIYA TRADERS • SIVAKASI CRACKERS • QUALITY & VALUE"
        );

        return;
      }

      setAnnouncement(
        data?.announcement?.trim() ||
          "SRI PRIYA TRADERS • SIVAKASI CRACKERS • QUALITY & VALUE"
      );
    }

    loadAnnouncement();
  }, []);

  return (
    <header className="site-header">

      {/* ========================= */}
      {/* ANNOUNCEMENT BAR */}
      {/* ========================= */}

      <div className="announcement-bar">

        <div className="announcement-marquee">

          <div className="announcement-track">

            <span className="announcement-item">
              <Sparkles size={16} />
              <span>{announcement}</span>
              <Sparkles size={16} />
            </span>

            <span className="announcement-item">
              <Sparkles size={16} />
              <span>{announcement}</span>
              <Sparkles size={16} />
            </span>

          </div>

        </div>

      </div>

      {/* ========================= */}
      {/* MAIN NAVBAR */}
      {/* ========================= */}

      <nav className="navbar">

        {/* SRI PRIYA TRADERS BRAND */}
        <Link
          to="/"
          className="brand"
          onClick={closeMenu}
        >

          <div className="brand-logo">
            SPT
          </div>

          <div className="brand-text">

            <span className="brand-name">
              SRI PRIYA
            </span>

            <span className="brand-subtitle">
              TRADERS
            </span>

          </div>

        </Link>

        {/* NAVIGATION */}
        <div
          className={`nav-links ${
            menuOpen ? "active" : ""
          }`}
        >

          <Link
            to="/"
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            to="/products"
            onClick={closeMenu}
          >
            Products
          </Link>

          <Link
            to="/price-list"
            onClick={closeMenu}
          >
            Price List
          </Link>

          <Link
            to="/contact"
            onClick={closeMenu}
          >
            Contact
          </Link>

        </div>

        {/* CART + MOBILE MENU */}
        <div className="nav-actions">

          <Link
            to="/cart"
            className="cart-button"
            onClick={closeMenu}
          >

            <ShoppingCart size={20} />

            <span>
              Cart
            </span>

            <strong>
              {cartCount}
            </strong>

          </Link>

          <button
            className="menu-button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label="Toggle menu"
          >

            {menuOpen ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}

          </button>

        </div>

      </nav>

    </header>
  );
}

export default Navbar;