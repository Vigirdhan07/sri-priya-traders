import {
  ShoppingCart,
  Package,
  Tag,
  Minus,
  Plus,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import "./ProductCard.css";

function ProductCard({ product }) {
  const {
    name,
    code,
    content,
    actualPrice,
    sellingPrice,
    discountPercentage,
    image,
  } = product;

  const {
    cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const cartItem = cartItems.find(
    (item) => item.id === product.id
  );

  const quantity = cartItem ? cartItem.quantity : 0;

  const hasPrice =
    actualPrice !== null &&
    actualPrice !== undefined &&
    sellingPrice !== null &&
    sellingPrice !== undefined;

  return (
    <article className="product-card">

      <div className="product-image-container">

        <img
          src={image}
          alt={name}
          className="product-image"
          onError={(event) => {
            event.currentTarget.style.display = "none";
            event.currentTarget.nextElementSibling.style.display =
              "flex";
          }}
        />

        <div className="product-image-placeholder">
          <span>🎆</span>
          <small>SRI PRIYA</small>
        </div>

      </div>

      <div className="product-details">

        {hasPrice && discountPercentage > 0 && (
          <div className="discount-badge">
            {discountPercentage}% OFF
          </div>
        )}

        <div className="product-code">
          <Tag size={12} />
          {code}
        </div>

        <h3>{name}</h3>

        <div className="product-content">
          <Package size={14} />
          {content}
        </div>

        <div className="product-pricing">

          <div>
            {hasPrice ? (
              <>
                <span className="mrp">
                  ₹{actualPrice}
                </span>

                <span className="selling-price">
                  ₹{sellingPrice}
                </span>
              </>
            ) : (
              <span className="selling-price">
                Price Coming Soon
              </span>
            )}
          </div>

          <span className="unit-text">
            per {content}
          </span>

        </div>

        <div className="product-actions">

          <div className="quantity-preview">

            <button
              type="button"
              onClick={() => decreaseQuantity(product.id)}
              disabled={quantity === 0}
            >
              <Minus size={15} />
            </button>

            <span>{quantity}</span>

            <button
              type="button"
              onClick={() => increaseQuantity(product.id)}
              disabled={quantity === 0}
            >
              <Plus size={15} />
            </button>

          </div>

          <button
            type="button"
            className="add-cart-button"
            onClick={() => addToCart(product)}
            disabled={!hasPrice}
          >
            <ShoppingCart size={17} />
            {!hasPrice
              ? "UNAVAILABLE"
              : quantity > 0
              ? "ADDED"
              : "ADD"}
          </button>

        </div>

      </div>

    </article>
  );
}

export default ProductCard;