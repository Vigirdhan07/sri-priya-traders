import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  Number(item.quantity || 0) + 1,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (productId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity:
                Number(item.quantity || 0) + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity:
                  Number(item.quantity || 0) - 1,
              }
            : item
        )
        .filter(
          (item) => Number(item.quantity || 0) > 0
        )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== productId
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  /* =========================
     TOTAL NUMBER OF PRODUCTS
  ========================= */

  const cartCount = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );
  }, [cartItems]);

  /* =========================
     ACTUAL TOTAL
     Before Global Discount
  ========================= */

  const actualTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => {
        const actualPrice =
          item.actualPrice ??
          item.mrp ??
          0;

        const quantity =
          Number(item.quantity || 0);

        return (
          total +
          Number(actualPrice) * quantity
        );
      },
      0
    );
  }, [cartItems]);

  /* =========================
     PRODUCT TOTAL
     After Global Discount
  ========================= */

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => {
        const sellingPrice =
          Number(item.sellingPrice || 0);

        const quantity =
          Number(item.quantity || 0);

        return (
          total +
          sellingPrice * quantity
        );
      },
      0
    );
  }, [cartItems]);

  /* =========================
     SAVINGS
     Actual Total - Product Total
  ========================= */

  const discountTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => {
        const actualPrice =
          Number(
            item.actualPrice ??
            item.mrp ??
            0
          );

        const sellingPrice =
          Number(item.sellingPrice || 0);

        const quantity =
          Number(item.quantity || 0);

        const savingsPerUnit =
          actualPrice - sellingPrice;

        return (
          total +
          savingsPerUnit * quantity
        );
      },
      0
    );
  }, [cartItems]);

  /* =========================
     PACKING
  ========================= */

  const packingCharge = 0;

  /* =========================
     GRAND TOTAL
  ========================= */

  const grandTotal =
    subtotal + packingCharge;

  const value = {
    cartItems,
    cartCount,

    actualTotal,
    subtotal,
    discountTotal,
    packingCharge,
    grandTotal,

    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside a CartProvider"
    );
  }

  return context;
}