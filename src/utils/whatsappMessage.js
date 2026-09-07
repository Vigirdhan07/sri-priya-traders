export function generateOrderId() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const time = String(
    Date.now()
  ).slice(-4);

  return `SPT-${year}${month}${day}-${time}`;
}


export function createWhatsAppMessage({
  orderId,
  customer,
  cartItems,
  cartCount,
  subtotal,
  discountTotal,
  grandTotal,
}) {
  let message = "";

  message += `🎆 SRI PRIYA TRADERS 🎆\n`;
  message += `SIVAKASI CRACKERS\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `📋 ORDER ID: ${orderId}\n\n`;

  message += `👤 CUSTOMER DETAILS\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;

  message += `Name: ${customer.name}\n`;
  message += `Mobile: ${customer.mobile}\n`;

  if (customer.email) {
    message += `Email: ${customer.email}\n`;
  }

  message += `City: ${customer.city}\n`;
  message += `State: ${customer.state}\n`;
  message += `Address: ${customer.address}\n\n`;

  message += `🛍️ ORDERED PRODUCTS\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;

  cartItems.forEach((item, index) => {
    const itemTotal =
      item.sellingPrice * item.quantity;

    message += `${index + 1}. ${item.name}\n`;
    message += `   Code: ${item.code}\n`;
    message += `   Qty: ${item.quantity}\n`;
    message += `   Price: ₹${item.sellingPrice}\n`;
    message += `   Total: ₹${itemTotal}\n\n`;
  });

  message += `📦 TOTAL ITEMS: ${cartCount}\n\n`;

  message += `💰 BILL SUMMARY\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;

  message += `Product Total: ₹${subtotal}\n`;
  message += `Your Savings: ₹${discountTotal}\n`;
  message += `Grand Total: ₹${grandTotal}\n\n`;

  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🙏 Thank you for choosing Sri Priya Traders!\n`;
  message += `Please confirm availability and final order details.`;

  return message;
}