import { useEffect, useState } from "react";
import {
  Save,
  RefreshCw,
  Percent,
  Truck,
  ShoppingCart,
  Store,
  Phone,
  Mail,
  MapPin,
  Megaphone,
  Navigation,
} from "lucide-react";

import { supabase } from "../../services/supabase";
import "./Settings.css";

function Settings() {
  const [settings, setSettings] = useState({
    shop_name: "Sri Priya Traders",
    phone: "",
    whatsapp_number: "",
    email: "",
    address: "",
    google_maps_link:
      "https://maps.app.goo.gl/faav9Rtnbg3tZcoz8",
    announcement: "",
    global_discount_percentage: 50,
    packing_charge: 0,
    minimum_order_amount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadSettings() {
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("SETTINGS LOAD ERROR:", error);

      setErrorMessage(
        error.message ||
          "Unable to load settings."
      );

      setLoading(false);
      return;
    }

    setSettings({
      shop_name:
        data.shop_name ||
        "Sri Priya Traders",

      phone:
        data.phone || "",

      whatsapp_number:
        data.whatsapp_number || "",

      email:
        data.email || "",

      address:
        data.address || "",

      google_maps_link:
        data.google_maps_link ||
        "https://maps.app.goo.gl/faav9Rtnbg3tZcoz8",

      announcement:
        data.announcement || "",

      global_discount_percentage:
        Number(
          data.global_discount_percentage || 0
        ),

      packing_charge:
        Number(data.packing_charge || 0),

      minimum_order_amount:
        Number(
          data.minimum_order_amount || 0
        ),
    });

    setLoading(false);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setSettings((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const discount = Number(
      settings.global_discount_percentage
    );

    const packing = Number(
      settings.packing_charge
    );

    const minimumOrder = Number(
      settings.minimum_order_amount
    );

    if (
      Number.isNaN(discount) ||
      discount < 0 ||
      discount > 100
    ) {
      setErrorMessage(
        "Global discount must be between 0% and 100%."
      );

      setSaving(false);
      return;
    }

    if (
      Number.isNaN(packing) ||
      packing < 0
    ) {
      setErrorMessage(
        "Packing charge cannot be negative."
      );

      setSaving(false);
      return;
    }

    if (
      Number.isNaN(minimumOrder) ||
      minimumOrder < 0
    ) {
      setErrorMessage(
        "Minimum order amount cannot be negative."
      );

      setSaving(false);
      return;
    }

    const mapsLink =
      settings.google_maps_link.trim();

    if (
      mapsLink &&
      !(
        mapsLink.startsWith("https://") ||
        mapsLink.startsWith("http://")
      )
    ) {
      setErrorMessage(
        "Google Maps link must be a valid URL."
      );

      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("site_settings")
      .update({
        shop_name:
          settings.shop_name.trim(),

        phone:
          settings.phone.trim() || null,

        whatsapp_number:
          settings.whatsapp_number.trim() ||
          null,

        email:
          settings.email.trim() || null,

        address:
          settings.address.trim() || null,

        google_maps_link:
          mapsLink || null,

        announcement:
          settings.announcement.trim() ||
          null,

        global_discount_percentage:
          discount,

        packing_charge:
          packing,

        minimum_order_amount:
          minimumOrder,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      console.error(
        "SETTINGS SAVE ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to save settings."
      );

      setSaving(false);
      return;
    }

    setSettings((current) => ({
      ...current,

      google_maps_link:
        mapsLink,

      global_discount_percentage:
        discount,

      packing_charge:
        packing,

      minimum_order_amount:
        minimumOrder,
    }));

    setMessage(
      "Settings saved successfully!"
    );

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="admin-settings-page">

        <div className="settings-loading">

          <RefreshCw
            size={30}
            className="settings-spin"
          />

          <p>
            Loading store settings...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="admin-settings-page">

      <div className="settings-header">

        <div>

          <span className="admin-section-label">
            SRI PRIYA TRADERS
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Manage your store information,
            pricing and customer ordering
            settings.
          </p>

        </div>

        <button
          className="settings-refresh-button"
          onClick={loadSettings}
          disabled={saving}
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>

      {message && (
        <div className="settings-success">
          ✓ {message}
        </div>
      )}

      {errorMessage && (
        <div className="settings-error">
          {errorMessage}
        </div>
      )}

      <div className="settings-grid">

        {/* =========================
            STORE INFORMATION
        ========================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <Store size={21} />
            </div>

            <div>

              <h2>
                Store Information
              </h2>

              <p>
                Information shown to your
                customers.
              </p>

            </div>

          </div>

          <div className="settings-form-grid">

            {/* SHOP NAME */}

            <div className="settings-field full-width">

              <label>
                Shop Name
              </label>

              <div className="settings-input-icon">

                <Store size={18} />

                <input
                  type="text"
                  name="shop_name"
                  value={settings.shop_name}
                  onChange={handleChange}
                  placeholder="Sri Priya Traders"
                />

              </div>

            </div>

            {/* PHONE */}

            <div className="settings-field">

              <label>
                Phone Number
              </label>

              <div className="settings-input-icon">

                <Phone size={18} />

                <input
                  type="text"
                  name="phone"
                  value={settings.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                />

              </div>

            </div>

            {/* WHATSAPP */}

            <div className="settings-field">

              <label>
                WhatsApp Number
              </label>

              <div className="settings-input-icon">

                <Phone size={18} />

                <input
                  type="text"
                  name="whatsapp_number"
                  value={
                    settings.whatsapp_number
                  }
                  onChange={handleChange}
                  placeholder="WhatsApp number"
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="settings-field full-width">

              <label>
                Email Address
              </label>

              <div className="settings-input-icon">

                <Mail size={18} />

                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleChange}
                  placeholder="Email address"
                />

              </div>

            </div>

            {/* ADDRESS */}

            <div className="settings-field full-width">

              <label>
                Shop Address
              </label>

              <div className="settings-input-icon textarea-icon">

                <MapPin size={18} />

                <textarea
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                  placeholder="Shop address"
                  rows="3"
                />

              </div>

            </div>

            {/* GOOGLE MAPS */}

            <div className="settings-field full-width">

              <label>
                Google Maps Link
              </label>

              <div className="settings-input-icon">

                <Navigation size={18} />

                <input
                  type="url"
                  name="google_maps_link"
                  value={
                    settings.google_maps_link
                  }
                  onChange={handleChange}
                  placeholder="Paste your Google Maps link"
                />

              </div>

              <small>
                Customers can use this link
                to find your exact shop
                location.
              </small>

            </div>

          </div>

        </section>

        {/* =========================
            PRICING & ORDERS
        ========================= */}

        <section className="settings-card pricing-settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <Percent size={21} />
            </div>

            <div>

              <h2>
                Pricing & Orders
              </h2>

              <p>
                Control customer pricing
                and order rules.
              </p>

            </div>

          </div>

          <div className="main-discount-box">

            <div className="main-discount-icon">
              <Percent size={28} />
            </div>

            <div className="main-discount-content">

              <label>
                Global Customer Discount
              </label>

              <p>
                This discount is automatically
                applied to every product on the
                customer website.
              </p>

              <div className="discount-input-wrapper">

                <input
                  type="number"
                  name="global_discount_percentage"
                  value={
                    settings.global_discount_percentage
                  }
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="1"
                />

                <span>
                  %
                </span>

              </div>

            </div>

          </div>

          <div className="settings-form-grid">

            {/* PACKING */}

            <div className="settings-field">

              <label>
                Packing Charge
              </label>

              <div className="settings-input-icon">

                <Truck size={18} />

                <input
                  type="number"
                  name="packing_charge"
                  value={
                    settings.packing_charge
                  }
                  onChange={handleChange}
                  min="0"
                  step="1"
                />

              </div>

              <small>
                Set 0 for FREE packing.
              </small>

            </div>

            {/* MINIMUM ORDER */}

            <div className="settings-field">

              <label>
                Minimum Order Amount
              </label>

              <div className="settings-input-icon">

                <ShoppingCart size={18} />

                <input
                  type="number"
                  name="minimum_order_amount"
                  value={
                    settings.minimum_order_amount
                  }
                  onChange={handleChange}
                  min="0"
                  step="1"
                />

              </div>

              <small>
                Set 0 to allow any order
                amount.
              </small>

            </div>

          </div>

        </section>

        {/* =========================
            ANNOUNCEMENT
        ========================= */}

        <section className="settings-card full-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <Megaphone size={21} />
            </div>

            <div>

              <h2>
                Customer Announcement
              </h2>

              <p>
                Message displayed on the
                customer website.
              </p>

            </div>

          </div>

          <div className="settings-field">

            <label>
              Announcement Message
            </label>

            <textarea
              name="announcement"
              value={settings.announcement}
              onChange={handleChange}
              placeholder="Example: Diwali orders are now open!"
              rows="3"
            />

          </div>

        </section>

      </div>

      {/* SAVE BAR */}

      <div className="settings-save-bar">

        <div>

          <strong>
            Ready to update your store?
          </strong>

          <span>
            Changes will apply to the website
            after saving.
          </span>

        </div>

        <button
          className="settings-save-button"
          onClick={handleSave}
          disabled={saving}
        >

          {saving ? (
            <>
              <RefreshCw
                size={18}
                className="settings-spin"
              />

              Saving...
            </>
          ) : (
            <>
              <Save size={18} />

              Save Settings
            </>
          )}

        </button>

      </div>

    </div>
  );
}

export default Settings;