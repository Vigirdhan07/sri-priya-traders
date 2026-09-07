import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

import {
  Upload,
  FileSpreadsheet,
  Download,
  Database,
  Percent,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../../services/supabase";
import "./PriceList.css";

function cleanText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isNumber(value) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    !Number.isNaN(Number(value))
  );
}

function getCategoryName(row) {
  const first = cleanText(row[0]);
  const second = cleanText(row[1]);
  const rate = row[2];

  if (first === "" && second !== "" && !isNumber(rate)) {
    return second;
  }

  if (first !== "" && second === "" && !isNumber(rate)) {
    return first;
  }

  return "";
}

function parseExcelRows(rows) {
  const products = [];
  let currentCategory = "";

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];

    const serialNumber = cleanText(row[0]);
    const productName = cleanText(row[1]);
    const rate = row[2];
    const content = cleanText(row[3]);

    if (
      !serialNumber &&
      !productName &&
      !content &&
      !isNumber(rate)
    ) {
      continue;
    }

    const categoryName = getCategoryName(row);

    if (categoryName) {
      currentCategory = categoryName;
      continue;
    }

    if (isNumber(serialNumber) && productName) {
      const number = Number(serialNumber);

      products.push({
        serialNumber: number,
        productCode: `SPT${String(number).padStart(3, "0")}`,
        productName,
        categoryName: currentCategory || "Uncategorized",
        content,
        actualPrice: isNumber(rate)
          ? Number(rate)
          : null,
      });
    }
  }

  return products;
}

function calculateCustomerPrice(actualPrice, discount) {
  const price = Number(actualPrice || 0);
  const percentage = Number(discount || 0);

  return Math.max(
    0,
    price - (price * percentage) / 100
  );
}

function PriceList() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [updateProgress, setUpdateProgress] = useState("");

  async function loadSettings() {
    setLoadingSettings(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("site_settings")
      .select("global_discount_percentage")
      .eq("id", 1)
      .single();

    if (error) {
      console.error(
        "PRICE LIST SETTINGS ERROR:",
        error
      );

      setGlobalDiscount(0);
      setErrorMessage(
        "Unable to load global discount."
      );
    } else {
      setGlobalDiscount(
        Number(
          data?.global_discount_percentage || 0
        )
      );
    }

    setLoadingSettings(false);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    setSuccessMessage("");
    setErrorMessage("");
    setWarningMessage("");
    setUpdateProgress("");
    setProducts([]);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validExtension =
      file.name.toLowerCase().endsWith(".xlsx") ||
      file.name.toLowerCase().endsWith(".xls");

    if (!validExtension) {
      setSelectedFile(null);
      setErrorMessage(
        "Please select an Excel .xlsx or .xls file."
      );
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target.result;

        const workbook = XLSX.read(arrayBuffer, {
          type: "array",
        });

        if (
          !workbook.SheetNames ||
          workbook.SheetNames.length === 0
        ) {
          setErrorMessage(
            "No worksheet was found in the Excel file."
          );
          return;
        }

        const firstSheet =
          workbook.Sheets[
            workbook.SheetNames[0]
          ];

        const rows = XLSX.utils.sheet_to_json(
          firstSheet,
          {
            header: 1,
            defval: "",
            raw: true,
          }
        );

        const parsedProducts =
          parseExcelRows(rows);

        if (parsedProducts.length === 0) {
          setErrorMessage(
            "No products could be found. Make sure the Excel contains S.NO, PRODUCT DETAILS and RATE."
          );
          return;
        }

        setProducts(parsedProducts);

        const missingRates =
          parsedProducts.filter(
            (product) =>
              product.actualPrice === null
          );

        if (missingRates.length > 0) {
          setWarningMessage(
            `${missingRates.length} product(s) have no RATE. Their existing database price will be kept.`
          );
        }

        setSuccessMessage(
          `Excel loaded successfully. ${parsedProducts.length} products found.`
        );
      } catch (error) {
        console.error(
          "EXCEL PARSE ERROR:",
          error
        );

        setErrorMessage(
          "Unable to read this Excel file. Please check the file format."
        );
      }
    };

    reader.onerror = () => {
      setErrorMessage(
        "Unable to read the selected Excel file."
      );
    };

    reader.readAsArrayBuffer(file);
  }

  async function getOrCreateCategory(
    categoryName,
    categoryCache
  ) {
    const normalizedName =
      cleanText(categoryName);

    if (!normalizedName) {
      return null;
    }

    const cacheKey =
      normalizedName.toLowerCase();

    if (
      Object.prototype.hasOwnProperty.call(
        categoryCache,
        cacheKey
      )
    ) {
      return categoryCache[cacheKey];
    }

    const {
      data: existingCategory,
      error: findCategoryError,
    } = await supabase
      .from("categories")
      .select("id")
      .ilike("name", normalizedName)
      .limit(1)
      .maybeSingle();

    if (findCategoryError) {
      throw findCategoryError;
    }

    if (existingCategory) {
      categoryCache[cacheKey] =
        existingCategory.id;

      return existingCategory.id;
    }

    const {
      data: newCategory,
      error: insertCategoryError,
    } = await supabase
      .from("categories")
      .insert({
        name: normalizedName,
        description: "",
        display_order:
          Object.keys(categoryCache).length + 1,
        is_active: true,
      })
      .select("id")
      .single();

    if (insertCategoryError) {
      throw insertCategoryError;
    }

    categoryCache[cacheKey] =
      newCategory.id;

    return newCategory.id;
  }

  async function updateProductsInDatabase() {
    if (products.length === 0) {
      setErrorMessage(
        "Please upload an Excel file first."
      );
      return;
    }

    const confirmed = window.confirm(
      `Update ${products.length} products in the database?\n\nThe RATE from Excel will become the actual price.\n\nThe customer price will continue to be calculated using the ${globalDiscount}% global discount.`
    );

    if (!confirmed) {
      return;
    }

    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setWarningMessage("");
    setUpdateProgress("");

    try {
      const categoryCache = {};

      let updatedCount = 0;
      let insertedCount = 0;

      for (
        let i = 0;
        i < products.length;
        i++
      ) {
        const product = products[i];

        setUpdateProgress(
          `Updating ${i + 1} of ${products.length}: ${product.productCode}`
        );

        const categoryId =
          await getOrCreateCategory(
            product.categoryName,
            categoryCache
          );

        const {
          data: existingProduct,
          error: findError,
        } = await supabase
          .from("products")
          .select("id, actual_price")
          .eq(
            "product_code",
            product.productCode
          )
          .maybeSingle();

        if (findError) {
          throw findError;
        }

        const productData = {
          product_code:
            product.productCode,

          product_name:
            product.productName,

          category_id:
            categoryId,

          content:
            product.content,

          is_available: true,

          updated_at:
            new Date().toISOString(),
        };

        /*
          IMPORTANT:
          Excel RATE = ACTUAL PRICE.

          We do NOT store the discounted customer
          price here.

          Customer price is calculated later using
          the global discount from Settings.
        */
        if (product.actualPrice !== null) {
          productData.actual_price =
            product.actualPrice;
        }

        if (existingProduct) {
          const { error: updateError } =
            await supabase
              .from("products")
              .update(productData)
              .eq(
                "id",
                existingProduct.id
              );

          if (updateError) {
            throw updateError;
          }

          updatedCount++;
        } else {
          const { error: insertError } =
            await supabase
              .from("products")
              .insert(productData);

          if (insertError) {
            throw insertError;
          }

          insertedCount++;
        }
      }

      setUpdateProgress("");

      setSuccessMessage(
        `Database updated successfully! ${updatedCount} products updated and ${insertedCount} new products added.`
      );

      const missingRateCount =
        products.filter(
          (product) =>
            product.actualPrice === null
        ).length;

      if (missingRateCount > 0) {
        setWarningMessage(
          `${missingRateCount} product(s) had no RATE, so their existing database price was kept.`
        );
      }
    } catch (error) {
      console.error(
        "PRICE LIST UPDATE ERROR:",
        error
      );

      setUpdateProgress("");

      setErrorMessage(
        error.message ||
          "Unable to update products."
      );
    } finally {
      setUploading(false);
    }
  }

  function downloadTemplate() {
    const templateRows = [
      [
        "S.NO",
        "PRODUCT DETAILS",
        "RATE",
        "CONTENT",
        "QTY",
        "AMOUNT",
      ],
      [
        1,
        "Example Product",
        100,
        "Box (10 Pcs)",
        "",
        "",
      ],
    ];

    const worksheet =
      XLSX.utils.aoa_to_sheet(
        templateRows
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Price List"
    );

    XLSX.writeFile(
      workbook,
      "Sri-Priya-Traders-Price-List-Template.xlsx"
    );
  }

  const missingRateCount =
    products.filter(
      (product) =>
        product.actualPrice === null
    ).length;

  return (
    <div className="admin-price-list-page">

      <div className="admin-price-list-header">

        <div>
          <span className="admin-section-label">
            SRI PRIYA TRADERS
          </span>

          <h1>Price List</h1>

          <p>
            Upload your master Excel price list
            and update all products automatically.
          </p>
        </div>

        <button
          className="refresh-price-list-button"
          onClick={loadSettings}
          disabled={loadingSettings}
        >
          <RefreshCw
            size={18}
            className={
              loadingSettings
                ? "loading-icon"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {successMessage && (
        <div className="price-list-success">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="price-list-error">
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {warningMessage && (
        <div className="price-list-warning">
          <AlertCircle size={20} />
          <span>{warningMessage}</span>
        </div>
      )}

      {updateProgress && (
        <div className="price-list-progress">
          <RefreshCw
            size={20}
            className="loading-icon"
          />

          <span>{updateProgress}</span>
        </div>
      )}

      <div className="price-list-grid">

        <div className="price-list-card">

          <div className="price-list-card-header">

            <div className="price-list-icon">
              <FileSpreadsheet size={25} />
            </div>

            <div>
              <h2>Master Price List</h2>

              <p>
                Upload the Excel containing your
                actual product prices.
              </p>
            </div>

          </div>

          <label className="excel-upload-area">

            <Upload size={42} />

            <strong>
              {selectedFile
                ? selectedFile.name
                : "Choose your Excel file"}
            </strong>

            <span>
              .xlsx or .xls files supported
            </span>

            <span className="choose-excel-button">
              <Upload size={18} />
              Choose Excel File
            </span>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              hidden
            />

          </label>

          <button
            className="download-template-button"
            onClick={downloadTemplate}
          >
            <Download size={18} />
            Download Excel Template
          </button>

        </div>

        <div className="price-list-card">

          <div className="price-list-card-header">

            <div className="price-list-icon">
              <Database size={25} />
            </div>

            <div>
              <h2>Automatic Pricing</h2>

              <p>
                Your Excel contains actual prices
                only.
              </p>
            </div>

          </div>

          <div className="global-discount-box">

            <div>
              <span>
                Global Customer Discount
              </span>

              <strong>
                {globalDiscount}%
              </strong>
            </div>

            <Percent size={32} />

          </div>

          <div className="pricing-example">

            <div>
              <span>
                Excel Actual Price
              </span>

              <strong>
                ₹100
              </strong>
            </div>

            <div className="pricing-arrow">
              ↓
            </div>

            <div>
              <span>
                Customer Price
              </span>

              <strong>
                ₹
                {calculateCustomerPrice(
                  100,
                  globalDiscount
                ).toFixed(2)}
              </strong>
            </div>

          </div>

          <p className="pricing-note">
            Change the global discount from
            <strong> Settings </strong>
            and all customer prices update
            automatically.
          </p>

        </div>

      </div>

      {products.length > 0 && (

        <div className="price-preview-section">

          <div className="price-preview-header">

            <div>
              <span className="admin-section-label">
                EXCEL PREVIEW
              </span>

              <h2>
                {products.length} Products Found
              </h2>

              <p>
                Review the products before updating
                the database.
              </p>
            </div>

            <div className="preview-stats">

              <div>
                <strong>
                  {products.length}
                </strong>

                <span>
                  Products
                </span>
              </div>

              <div>
                <strong>
                  {missingRateCount}
                </strong>

                <span>
                  Missing Rates
                </span>
              </div>

              <div>
                <strong>
                  {globalDiscount}%
                </strong>

                <span>
                  Discount
                </span>
              </div>

            </div>

          </div>

          <div className="price-preview-table-wrapper">

            <table className="price-preview-table">

              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>Product Code</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Content</th>
                  <th>Actual Price</th>
                  <th>Discount</th>
                  <th>Customer Price</th>
                </tr>
              </thead>

              <tbody>

                {products.map((product) => {

                  const customerPrice =
                    product.actualPrice === null
                      ? null
                      : calculateCustomerPrice(
                          product.actualPrice,
                          globalDiscount
                        );

                  return (
                    <tr
                      key={
                        product.productCode
                      }
                    >

                      <td>
                        {product.serialNumber}
                      </td>

                      <td>
                        <strong>
                          {product.productCode}
                        </strong>
                      </td>

                      <td>
                        {product.productName}
                      </td>

                      <td>
                        {product.categoryName}
                      </td>

                      <td>
                        {product.content || "—"}
                      </td>

                      <td>

                        {product.actualPrice ===
                        null ? (
                          <span className="missing-rate">
                            Rate Missing
                          </span>
                        ) : (
                          <strong>
                            ₹
                            {product.actualPrice.toFixed(
                              2
                            )}
                          </strong>
                        )}

                      </td>

                      <td>
                        <span className="discount-pill">
                          {globalDiscount}%
                        </span>
                      </td>

                      <td>

                        {customerPrice === null ? (
                          "—"
                        ) : (
                          <strong className="customer-price">
                            ₹
                            {customerPrice.toFixed(
                              2
                            )}
                          </strong>
                        )}

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

          <div className="price-update-footer">

            <div>

              <strong>
                Ready to update {products.length}{" "}
                products?
              </strong>

              <span>
                Actual prices will be saved from
                Excel. Customer prices use the
                {` ${globalDiscount}% `}
                global discount automatically.
              </span>

            </div>

            <button
              className="confirm-price-update-button"
              onClick={
                updateProductsInDatabase
              }
              disabled={uploading}
            >

              {uploading ? (
                <>
                  <RefreshCw
                    size={20}
                    className="loading-icon"
                  />

                  Updating...
                </>
              ) : (
                <>
                  <Database size={20} />

                  Confirm & Update Products
                </>
              )}

            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default PriceList;