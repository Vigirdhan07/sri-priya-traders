import { ArrowRight, Download, MapPin, Sparkles } from "lucide-react";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-glow hero-glow-one"></div>
      <div className="hero-glow hero-glow-two"></div>

      <div className="firework firework-one">
        <span></span>
      </div>

      <div className="firework firework-two">
        <span></span>
      </div>

      <div className="firework firework-three">
        <span></span>
      </div>

      <div className="hero-content">

        <div className="hero-badge">
          <Sparkles size={16} />
          <span>PREMIUM SIVAKASI CRACKERS</span>
          <Sparkles size={16} />
        </div>

        <h1>
          SRI PRIYA
          <span>TRADERS</span>
        </h1>

        <p className="hero-tagline">
          Celebrate Every Moment With
          <strong> Sparkling Joy 🎆</strong>
        </p>

        <p className="hero-description">
          Explore our collection of quality crackers at competitive prices,
          brought to you from the heart of Sivakasi.
        </p>

        <div className="hero-location">
          <MapPin size={17} />
          <span>Sivakasi, Tamil Nadu</span>
        </div>

        <div className="hero-buttons">

          <a href="/products" className="hero-button primary">
            SHOP PRODUCTS
            <ArrowRight size={19} />
          </a>

          <a href="/price-list" className="hero-button secondary">
            <Download size={18} />
            PRICE LIST
          </a>

        </div>

      </div>

      <div className="hero-bottom-fade"></div>

    </section>
  );
}

export default Hero;