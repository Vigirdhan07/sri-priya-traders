import { supabase } from "./supabase";

function calculateSellingPrice(actualPrice, discountPercentage) {
  if (actualPrice === null || actualPrice === undefined) {
    return null;
  }

  const price = Number(actualPrice);
  const discount = Number(discountPercentage || 0);

  const sellingPrice =
    price - (price * discount) / 100;

  return Number(sellingPrice.toFixed(2));
}

function calculateDiscountAmount(actualPrice, discountPercentage) {
  if (actualPrice === null || actualPrice === undefined) {
    return 0;
  }

  const price = Number(actualPrice);
  const discount = Number(discountPercentage || 0);

  return Number(
    ((price * discount) / 100).toFixed(2)
  );
}

export async function getGlobalDiscount() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("global_discount_percentage")
    .eq("id", 1)
    .single();

  if (error) {
    console.error(
      "Error loading global discount:",
      error
    );

    throw error;
  }

  return Number(
    data?.global_discount_percentage || 0
  );
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      description,
      image_url,
      display_order,
      is_active
    `)
    .eq("is_active", true)
    .order("display_order", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error loading categories:",
      error
    );

    throw error;
  }

  return data || [];
}

export async function getProducts() {
  const [
    productsResult,
    settingsResult,
  ] = await Promise.all([
    supabase
      .from("products")
      .select(`
        id,
        product_code,
        product_name,
        category_id,
        content,
        actual_price,
        image_url,
        is_available,
        categories (
          id,
          name
        )
      `)
      .eq("is_available", true)
      .order("id", {
        ascending: true,
      }),

    supabase
      .from("site_settings")
      .select("global_discount_percentage")
      .eq("id", 1)
      .single(),
  ]);

  if (productsResult.error) {
    console.error(
      "Error loading products:",
      productsResult.error
    );

    throw productsResult.error;
  }

  if (settingsResult.error) {
    console.error(
      "Error loading global discount:",
      settingsResult.error
    );

    throw settingsResult.error;
  }

  const globalDiscount = Number(
    settingsResult.data?.global_discount_percentage || 0
  );

  const products = productsResult.data || [];

  return products.map((product) => {
    const actualPrice =
      product.actual_price === null
        ? null
        : Number(product.actual_price);

    const sellingPrice =
      calculateSellingPrice(
        actualPrice,
        globalDiscount
      );

    const discountAmount =
      calculateDiscountAmount(
        actualPrice,
        globalDiscount
      );

    return {
      id: product.id,

      code: product.product_code,

      name: product.product_name,

      category:
        product.categories?.name || "Other",

      categoryId:
        product.category_id,

      content:
        product.content || "",

      actualPrice: actualPrice,

      mrp: actualPrice,

      discountPercentage:
        globalDiscount,

      discountAmount:
        discountAmount,

      sellingPrice:
        sellingPrice,

      image:
        product.image_url || "",

      isAvailable:
        product.is_available,
    };
  });
}

export async function getProductsByCategory(
  categoryId
) {
  const products = await getProducts();

  return products.filter(
    (product) =>
      product.categoryId === Number(categoryId)
  );
}