import { useEffect, useState } from "react";
import {
  Store,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  RefreshCw,
  Navigation,
} from "lucide-react";

import { supabase } from "../../services/supabase";

import "./Contact.css";

function Contact() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("site_settings")
        .select(
          `
          shop_name,
          phone,
          whatsapp_number,
          email,
          address,
          google_maps_link
          `
        )
        .eq("id", 1)
        .single();

      if (error) {
        throw error;
      }

      setSettings(data);
    } catch (error) {
      console.error(
        "Contact settings error:",
        error
      );

      setSettings({
        shop_name: "Sri Priya Traders",
        phone: "099650 93000",
        whatsapp_number: "",
        email: "",
        address:
          "Shop No. 497/1, Sattur - Sivakasi - Kalugumalai Road, Virudhunagar, Mettamalai, Tamil Nadu 626203",
        google_maps_link:
          "https://maps.app.goo.gl/faav9Rtnbg3tZcoz8",
      });
    } finally {
      setLoading(false);
    }
  }

  function cleanPhoneNumber(number) {
    if (!number) {
      return "";
    }

    return String(number).replace(/\D/g, "");
  }

  function getWhatsAppNumber() {
    const number = cleanPhoneNumber(
      settings?.whatsapp_number
    );

    if (!number) {
      return "";
    }

    if (number.length === 10) {
      return `91${number}`;
    }

    return number;
  }

  function handleWhatsApp() {
    const whatsappNumber =
      getWhatsAppNumber();

    if (!whatsappNumber) {
      return;
    }

    const message = encodeURIComponent(
      `Hi ${settings?.shop_name || "Sri Priya Traders"}, I would like to know more about your crackers and prices.`
    );

    window.open(
      `https://wa.me/${whatsappNumber}?text=${message}`,
      "_blank"
    );
  }

  function handleCall() {
    const phone =
      cleanPhoneNumber(settings?.phone);

    if (!phone) {
      return;
    }

    const callNumber =
      phone.length === 10
        ? `+91${phone}`
        : `+${phone}`;

    window.location.href =
      `tel:${callNumber}`;
  }

  function openGoogleMaps() {
    if (!settings?.google_maps_link) {
      return;
    }

    window.open(
      settings.google_maps_link,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (loading) {
    return (
      <main className="contact-page">
        <div className="contact-loading">
          <RefreshCw
            size={30}
            className="contact-loading-icon"
          />

          <p>
            Loading contact information...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="contact-page">

      {/* HERO */}

      <section className="contact-hero">

        <div className="contact-hero-content">

          <span className="contact-kicker">
            <Store size={16} />
            SRI PRIYA TRADERS
          </span>

          <h1>
            Find Our <span>Shop</span>
          </h1>

          <p>
            Visit Sri Priya Traders in
            Mettamalai for premium Sivakasi
            crackers at special prices.
          </p>

        </div>

      </section>

      {/* SHOP LOCATION */}

      <section className="contact-container">

        <div className="shop-location-card">

          {/* SHOP IMAGE */}

          <div className="shop-photo-wrapper">

            <img
              src="/images/sri-priya-traders-shop.jpg"
              alt="Sri Priya Traders shop in Mettamalai"
              className="shop-photo"
            />

            <div className="shop-photo-badge">
              <Store size={17} />
              OUR SHOP
            </div>

          </div>

          {/* SHOP INFORMATION */}

          <div className="shop-location-content">

            <span className="contact-card-label">
              VISIT US
            </span>

            <h2>
              {settings?.shop_name ||
                "Sri Priya Traders"}
            </h2>

            <p className="shop-location-description">
              Your trusted destination for
              quality Sivakasi crackers.
              Visit our shop and choose from
              our latest collection.
            </p>

            {/* ADDRESS */}

            <div className="location-detail">

              <div className="location-detail-icon">
                <MapPin size={20} />
              </div>

              <div>
                <span>
                  SHOP ADDRESS
                </span>

                <p>
                  Shop No. 497/1,
                  <br />
                  Sattur - Sivakasi -
                  Kalugumalai Road,
                  <br />
                  Virudhunagar,
                  Mettamalai,
                  <br />
                  Tamil Nadu - 626203
                </p>
              </div>

            </div>

            {/* PLUS CODE */}

            <div className="location-detail">

              <div className="location-detail-icon">
                <Navigation size={20} />
              </div>

              <div>
                <span>
                  GOOGLE MAPS PLUS CODE
                </span>

                <p>
                  9VXR+7M Mettamalai,
                  Tamil Nadu
                </p>
              </div>

            </div>

            {/* HOURS */}

            <div className="location-detail">

              <div className="location-detail-icon">
                <Clock size={20} />
              </div>

              <div>
                <span>
                  SHOP HOURS
                </span>

                <p>
                  Opens 9:00 AM
                </p>
              </div>

            </div>

            {/* MAP BUTTON */}

            <button
              type="button"
              className="maps-button"
              onClick={openGoogleMaps}
              disabled={
                !settings?.google_maps_link
              }
            >
              <MapPin size={19} />
              OPEN IN GOOGLE MAPS
              <ArrowRight size={18} />
            </button>

          </div>

        </div>

        {/* CONTACT DETAILS */}

        <div className="contact-details-card">

          <div className="contact-details-heading">

            <span className="contact-card-label">
              CONTACT DETAILS
            </span>

            <h2>
              We're Here To Help
            </h2>

          </div>

          <div className="contact-info-list">

            {/* PHONE */}

            {settings?.phone && (
              <div className="contact-info-item">

                <div className="contact-info-icon">
                  <Phone size={20} />
                </div>

                <div className="contact-info-text">

                  <span>
                    PHONE
                  </span>

                  <a
                    href={`tel:${cleanPhoneNumber(
                      settings.phone
                    )}`}
                  >
                    {settings.phone}
                  </a>

                </div>

              </div>
            )}

            {/* WHATSAPP */}

            {settings?.whatsapp_number && (
              <div className="contact-info-item">

                <div className="contact-info-icon whatsapp-icon">
                  <MessageCircle
                    size={20}
                  />
                </div>

                <div className="contact-info-text">

                  <span>
                    WHATSAPP
                  </span>

                  <button
                    type="button"
                    onClick={handleWhatsApp}
                  >
                    {settings.whatsapp_number}
                  </button>

                </div>

              </div>
            )}

            {/* EMAIL */}

            {settings?.email && (
              <div className="contact-info-item">

                <div className="contact-info-icon">
                  <Mail size={20} />
                </div>

                <div className="contact-info-text">

                  <span>
                    EMAIL
                  </span>

                  <a
                    href={`mailto:${settings.email}`}
                  >
                    {settings.email}
                  </a>

                </div>

              </div>
            )}

            {/* LOCATION */}

            <div className="contact-info-item">

              <div className="contact-info-icon">
                <MapPin size={20} />
              </div>

              <div className="contact-info-text">

                <span>
                  LOCATION
                </span>

                <strong>
                  Mettamalai,
                  Tamil Nadu
                </strong>

              </div>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="contact-actions">

            <button
              type="button"
              className="contact-call-button"
              onClick={handleCall}
              disabled={!settings?.phone}
            >
              <Phone size={18} />
              CALL NOW
            </button>

            <button
              type="button"
              className="contact-whatsapp-button"
              onClick={handleWhatsApp}
              disabled={
                !settings?.whatsapp_number
              }
            >
              <MessageCircle size={18} />
              WHATSAPP US
            </button>

          </div>

        </div>

        {/* ORDER CTA */}

        <div className="contact-order-banner">

          <div>

            <span>
              READY TO ORDER?
            </span>

            <h2>
              Browse our latest crackers
            </h2>

            <p>
              Check the latest customer
              prices and add your favourites
              to the cart.
            </p>

          </div>

          <a
            href="/products"
            className="contact-products-button"
          >
            BROWSE PRODUCTS
            <ArrowRight size={19} />
          </a>

        </div>

      </section>

    </main>
  );
}

export default Contact;