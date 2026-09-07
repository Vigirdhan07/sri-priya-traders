import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Trash2,
  Package,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../../services/supabase";
import "./ManageImages.css";

function ManageImages() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadProducts() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("product_code", {
        ascending: true,
      });

    if (error) {
      console.error("PRODUCT IMAGE PRODUCTS ERROR:", error);

      setProducts([]);
      setErrorMessage(
        error.message || "Unable to load products."
      );

      setLoading(false);
      return;
    }

    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function clearMessages() {
    setMessage("");
    setErrorMessage("");
  }

  async function handleUpload(event, product) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    clearMessages();

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(
        "Please select a JPG, PNG or WEBP image."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        "Image size must be less than 5 MB."
      );

      event.target.value = "";
      return;
    }

    try {
      setUploadingId(product.id);

      const fileExtension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeCode = String(
        product.product_code || product.id
      )
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .toUpperCase();

      const filePath =
        `${safeCode}-${Date.now()}.${fileExtension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("product-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

      if (uploadError) {
        console.error(
          "IMAGE UPLOAD ERROR:",
          uploadError
        );

        throw new Error(
          uploadError.message ||
            "Unable to upload image."
        );
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

      const imageUrl =
        publicUrlData?.publicUrl;

      if (!imageUrl) {
        throw new Error(
          "Unable to create image URL."
        );
      }

      const { error: updateError } =
        await supabase
          .from("products")
          .update({
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

      if (updateError) {
        console.error(
          "PRODUCT IMAGE URL UPDATE ERROR:",
          updateError
        );

        throw new Error(
          updateError.message ||
            "Image uploaded but product could not be updated."
        );
      }

      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          item.id === product.id
            ? {
                ...item,
                image_url: imageUrl,
              }
            : item
        )
      );

      setMessage(
        `${product.product_name} image updated successfully.`
      );
    } catch (error) {
      console.error("IMAGE MANAGEMENT ERROR:", error);

      setErrorMessage(
        error.message ||
          "Something went wrong while uploading the image."
      );
    } finally {
      setUploadingId(null);
      event.target.value = "";
    }
  }

  async function handleDeleteImage(product) {
    if (!product.image_url) {
      return;
    }

    const confirmed = window.confirm(
      `Remove the image for "${product.product_name}"?`
    );

    if (!confirmed) {
      return;
    }

    clearMessages();

    try {
      setUploadingId(product.id);

      const marker =
        "/product-images/";

      const markerIndex =
        product.image_url.indexOf(marker);

      if (markerIndex !== -1) {
        const filePath =
          decodeURIComponent(
            product.image_url.substring(
              markerIndex + marker.length
            )
          );

        const { error: deleteError } =
          await supabase.storage
            .from("product-images")
            .remove([filePath]);

        if (deleteError) {
          console.warn(
            "STORAGE IMAGE DELETE ERROR:",
            deleteError
          );
        }
      }

      const { error: updateError } =
        await supabase
          .from("products")
          .update({
            image_url: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

      if (updateError) {
        throw new Error(
          updateError.message ||
            "Unable to remove product image."
        );
      }

      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          item.id === product.id
            ? {
                ...item,
                image_url: null,
              }
            : item
        )
      );

      setMessage(
        `${product.product_name} image removed successfully.`
      );
    } catch (error) {
      console.error(
        "IMAGE DELETE ERROR:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to remove image."
      );
    } finally {
      setUploadingId(null);
    }
  }

  const filteredProducts = products.filter(
    (product) => {
      const searchText =
        search.toLowerCase().trim();

      if (!searchText) {
        return true;
      }

      return (
        String(
          product.product_code || ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(
          product.product_name || ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(
          product.category || ""
        )
          .toLowerCase()
          .includes(searchText)
      );
    }
  );

  const imageCount = products.filter(
    (product) => product.image_url
  ).length;

  return (
    <div className="manage-images-page">

      <div className="manage-images-header">

        <div>
          <span className="admin-section-label">
            SRI PRIYA TRADERS
          </span>

          <h1>Product Images</h1>

          <p>
            Upload and manage images for all your products.
          </p>
        </div>

        <button
          className="refresh-images-button"
          onClick={loadProducts}
          disabled={loading}
        >
          <RefreshCw
            size={18}
            className={
              loading
                ? "images-loading-icon"
                : ""
            }
          />

          {loading
            ? "Loading..."
            : "Refresh"}
        </button>

      </div>

      {message && (
        <div className="images-success-message">
          <CheckCircle size={20} />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="images-error-message">
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="images-summary">

        <div className="images-summary-card">
          <Package size={24} />

          <div>
            <strong>
              {products.length}
            </strong>

            <span>
              Total Products
            </span>
          </div>
        </div>

        <div className="images-summary-card">
          <ImageIcon size={24} />

          <div>
            <strong>
              {imageCount}
            </strong>

            <span>
              Images Added
            </span>
          </div>
        </div>

        <div className="images-summary-card">
          <ImageIcon size={24} />

          <div>
            <strong>
              {products.length - imageCount}
            </strong>

            <span>
              Images Remaining
            </span>
          </div>
        </div>

      </div>

      <div className="images-toolbar">

        <div className="images-search">

          <Search size={19} />

          <input
            type="text"
            placeholder="Search product code, name or category..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <div className="images-count">
          {filteredProducts.length} products
        </div>

      </div>

      <div className="images-grid">

        {loading ? (

          <div className="images-loading-state">

            <RefreshCw
              size={32}
              className="images-loading-icon"
            />

            <p>
              Loading your products...
            </p>

          </div>

        ) : filteredProducts.length === 0 ? (

          <div className="images-empty-state">

            <Package size={44} />

            <h3>
              No products found
            </h3>

            <p>
              Try a different search term.
            </p>

          </div>

        ) : (

          filteredProducts.map(
            (product) => {

              const isUploading =
                uploadingId === product.id;

              return (
                <div
                  className="image-product-card"
                  key={product.id}
                >

                  <div className="image-preview">

                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                      />
                    ) : (
                      <div className="image-placeholder">
                        <Package size={42} />
                        <span>
                          No Image
                        </span>
                      </div>
                    )}

                  </div>

                  <div className="image-product-details">

                    <span className="image-product-code">
                      {product.product_code}
                    </span>

                    <h3>
                      {product.product_name}
                    </h3>

                    {product.content && (
                      <p>
                        {product.content}
                      </p>
                    )}

                  </div>

                  <div className="image-product-actions">

                    <label
                      className={
                        isUploading
                          ? "upload-image-button disabled"
                          : "upload-image-button"
                      }
                    >

                      {isUploading ? (
                        <>
                          <RefreshCw
                            size={17}
                            className="images-loading-icon"
                          />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={17} />
                          {product.image_url
                            ? "Replace Image"
                            : "Upload Image"}
                        </>
                      )}

                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(event) =>
                          handleUpload(
                            event,
                            product
                          )
                        }
                        disabled={isUploading}
                      />

                    </label>

                    {product.image_url && (
                      <button
                        className="delete-image-button"
                        onClick={() =>
                          handleDeleteImage(
                            product
                          )
                        }
                        disabled={isUploading}
                        title="Remove image"
                      >
                        <Trash2 size={17} />
                      </button>
                    )}

                  </div>

                </div>
              );
            }
          )

        )}

      </div>

    </div>
  );
}

export default ManageImages;