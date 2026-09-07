import { supabase } from "./supabase";

function generateOrderNumber() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const randomNumber = Math.floor(
    1000 + Math.random() * 9000
  );

  return `SPT-${year}${month}${day}-${randomNumber}`;
}

export async function createOrder({
  customer,
  cartItems,
  cartCount,
  subtotal,
  discountTotal,
  packingCharge,
  grandTotal,
}) {
  const orderNumber = generateOrderNumber();

  const actualTotal =
    Number(subtotal || 0) +
    Number(discountTotal || 0);

  const discountPercentage =
    actualTotal > 0
      ? Number(
          (
            (Number(discountTotal || 0) / actualTotal) *
            100
          ).toFixed(2)
        )
      : 0;

  const orderData = {
    order_number: orderNumber,
    customer_name: customer.name,
    mobile_number: customer.mobile,
    email: customer.email || "",
    state: customer.state,
    city: customer.city,
    address: customer.address,
    subtotal: Number(subtotal || 0),
    discount_percentage: discountPercentage,
    discount_amount: Number(discountTotal || 0),
    packing_charge: Number(packingCharge || 0),
    grand_total: Number(grandTotal || 0),
  };

  const itemsData = cartItems.map((item) => {
    const actualPrice = Number(
      item.mrp || item.actualPrice || 0
    );

    const sellingPrice = Number(
      item.sellingPrice || 0
    );

    const itemDiscountPercentage =
      actualPrice > 0
        ? Number(
            (
              ((actualPrice - sellingPrice) /
                actualPrice) *
              100
            ).toFixed(2)
          )
        : 0;

    return {
      product_id: item.id,
      product_code:
        item.productCode ||
        item.code ||
        "",
      product_name:
        item.name ||
        item.productName ||
        "",
      content:
        item.content ||
        "",
      quantity: Number(item.quantity || 0),
      actual_price: actualPrice,
      discount_percentage:
        itemDiscountPercentage,
      selling_price: sellingPrice,
      item_total:
        sellingPrice *
        Number(item.quantity || 0),
    };
  });

  const { data, error } = await supabase.rpc(
    "create_order",
    {
      p_order: orderData,
      p_items: itemsData,
    }
  );

  if (error) {
    console.error(
      "Order creation error:",
      error
    );

    throw new Error(
      "Unable to save your order. Please try again."
    );
  }

  if (!data || data.length === 0) {
    console.error(
      "Order creation returned no data."
    );

    throw new Error(
      "Order was not created. Please try again."
    );
  }

  const order = data[0];

  return {
    order,
    orderNumber: order.order_number,
    itemCount: cartCount,
  };
}