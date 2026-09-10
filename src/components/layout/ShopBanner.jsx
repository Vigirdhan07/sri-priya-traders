import "./ShopBanner.css";

function ShopBanner() {
  return (
    <section className="shop-banner-section">
      <div className="shop-banner-container">
        <div className="shop-banner-glow">
          <img
            src="/images/shop-banner.png"
            alt="Sri Priya Traders"
            className="shop-banner-image"
          />
        </div>
      </div>
    </section>
  );
}

export default ShopBanner;