import jsPDF from "jspdf";

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function writeText(
  doc,
  text,
  x,
  y,
  {
    size = 8,
    bold = false,
    align = "left",
  } = {}
) {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);

  doc.text(String(text ?? ""), x, y, {
    align,
  });
}

function drawHeader(doc) {
  const pageWidth = 210;

  /*
   * OUTER BORDER
   */
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 277);

  /*
   * HEADER
   */
  writeText(
    doc,
    "Sri Priya Traders",
    pageWidth / 2,
    23,
    {
      size: 19,
      bold: true,
      align: "center",
    }
  );

  writeText(
    doc,
    "497-1, Sivakasi to Sattur Main Road, METTAMALAI, Sivakasi - 626 203.",
    pageWidth / 2,
    30,
    {
      size: 7.5,
      align: "center",
    }
  );

  writeText(
    doc,
    "Cell : 99650 93000",
    194,
    17,
    {
      size: 7,
      bold: true,
      align: "right",
    }
  );

  writeText(
    doc,
    "98659 93000",
    194,
    21,
    {
      size: 7,
      bold: true,
      align: "right",
    }
  );

  doc.setLineWidth(0.4);
  doc.line(14, 35, 196, 35);
}

function drawCustomerSection(doc, order) {
  /*
   * CUSTOMER SECTION
   */

  const leftX = 14;
  const rightStart = 122;
  const topY = 38;
  const bottomY = 72;

  doc.setLineWidth(0.35);

  /*
   * Main customer box
   */
  doc.rect(
    leftX,
    topY,
    182,
    bottomY - topY
  );

  /*
   * Vertical separation
   */
  doc.line(
    rightStart,
    topY,
    rightStart,
    bottomY
  );

  /*
   * TO
   */
  writeText(
    doc,
    "To",
    16,
    44,
    {
      size: 8,
      bold: true,
    }
  );

  const customerName =
    order.customer_name || "-";

  writeText(
    doc,
    customerName,
    16,
    51,
    {
      size: 8,
      bold: true,
    }
  );

  const address = [
    order.address || "",
    order.city || "",
    order.state || "",
  ]
    .filter(Boolean)
    .join(", ");

  const addressLines =
    doc.splitTextToSize(
      address || "-",
      96
    );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  doc.text(
    addressLines.slice(0, 3),
    16,
    57
  );

  if (order.mobile_number) {
    writeText(
      doc,
      `Mobile: ${order.mobile_number}`,
      16,
      68,
      {
        size: 7,
      }
    );
  }

  /*
   * RIGHT ORDER DETAILS
   */

  const labelX = 126;
  const colonX = 151;
  const valueX = 155;

  const orderNumber =
    order.order_number || "-";

  /*
   * NO.
   */
  writeText(
    doc,
    "No.",
    labelX,
    46,
    {
      size: 7.5,
    }
  );

  writeText(
    doc,
    ":",
    colonX,
    46,
    {
      size: 7.5,
    }
  );

  writeText(
    doc,
    orderNumber,
    valueX,
    46,
    {
      size: 7,
      bold: true,
    }
  );

  /*
   * DATE
   */
  writeText(
    doc,
    "Date",
    labelX,
    53,
    {
      size: 7.5,
    }
  );

  writeText(
    doc,
    ":",
    colonX,
    53,
    {
      size: 7.5,
    }
  );

  writeText(
    doc,
    formatDate(order.created_at),
    valueX,
    53,
    {
      size: 7.5,
    }
  );

  /*
   * BUYERS EXP NO.
   */
  writeText(
    doc,
    "Buyers Exp. No.",
    labelX,
    60,
    {
      size: 7,
    }
  );

  writeText(
    doc,
    ":",
    colonX,
    60,
    {
      size: 7.5,
    }
  );

  writeText(
    doc,
    "-",
    valueX,
    60,
    {
      size: 7.5,
    }
  );

  /*
   * ORDER
   */
  writeText(
    doc,
    "Order",
    labelX,
    67,
    {
      size: 7.5,
    }
  );

  writeText(
    doc,
    ":",
    colonX,
    67,
    {
      size: 7.5,
    }
  );

  writeText(
    doc,
    orderNumber,
    valueX,
    67,
    {
      size: 7,
      bold: true,
    }
  );
}

function drawTableHeader(doc, y) {
  const x = 14;
  const width = 182;
  const height = 8;

  const columns = [
    {
      label: "S.No.",
      x: x,
      width: 15,
    },
    {
      label: "Particulars",
      x: x + 15,
      width: 92,
    },
    {
      label: "QTY",
      x: x + 107,
      width: 17,
    },
    {
      label: "Rate",
      x: x + 124,
      width: 18,
    },
    {
      label: "PER",
      x: x + 142,
      width: 18,
    },
    {
      label: "AMOUNT",
      x: x + 160,
      width: 22,
    },
  ];

  doc.setLineWidth(0.35);

  /*
   * Header outer box
   */
  doc.rect(x, y, width, height);

  /*
   * Column lines
   */
  columns.forEach((column, index) => {
    if (index > 0) {
      doc.line(
        column.x,
        y,
        column.x,
        y + height
      );
    }
  });

  /*
   * Header text
   */
  columns.forEach((column) => {
    writeText(
      doc,
      column.label,
      column.x + column.width / 2,
      y + 5.4,
      {
        size: 6.5,
        bold: true,
        align: "center",
      }
    );
  });

  return columns;
}

function drawProductRow(
  doc,
  item,
  index,
  y,
  columns
) {
  const rowHeight = 8;

  /*
   * Row box
   */
  doc.setLineWidth(0.25);

  doc.rect(
    14,
    y,
    182,
    rowHeight
  );

  /*
   * Vertical lines
   */
  columns.forEach((column, columnIndex) => {
    if (columnIndex > 0) {
      doc.line(
        column.x,
        y,
        column.x,
        y + rowHeight
      );
    }
  });

  const productName =
    item.product_name || "-";

  const content =
    item.content
      ? ` (${item.content})`
      : "";

  const particulars =
    `${productName}${content}`;

  const quantity =
    Number(item.quantity || 0);

  const actualPrice =
    Number(item.actual_price || 0);

  const sellingPrice =
    Number(item.selling_price || 0);

  const amount =
    Number(item.item_total || 0);

  /*
   * S.NO
   */
  writeText(
    doc,
    index + 1,
    columns[0].x +
      columns[0].width / 2,
    y + 5.3,
    {
      size: 6.2,
      align: "center",
    }
  );

  /*
   * PARTICULARS
   */
  const particularLines =
    doc.splitTextToSize(
      particulars,
      87
    );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(6.1);

  doc.text(
    particularLines[0],
    columns[1].x + 2,
    y + 5.3
  );

  /*
   * QTY
   */
  writeText(
    doc,
    quantity,
    columns[2].x +
      columns[2].width / 2,
    y + 5.3,
    {
      size: 6.2,
      align: "center",
    }
  );

  /*
   * RATE
   */
  writeText(
    doc,
    formatCurrency(actualPrice),
    columns[3].x +
      columns[3].width - 1.5,
    y + 5.3,
    {
      size: 5.4,
      align: "right",
    }
  );

  /*
   * PER
   */
  writeText(
    doc,
    formatCurrency(sellingPrice),
    columns[4].x +
      columns[4].width - 1.5,
    y + 5.3,
    {
      size: 5.4,
      align: "right",
    }
  );

  /*
   * AMOUNT
   */
  writeText(
    doc,
    formatCurrency(amount),
    columns[5].x +
      columns[5].width - 1.5,
    y + 5.3,
    {
      size: 5.4,
      align: "right",
    }
  );
}

function drawBottomSection(
  doc,
  order,
  y
) {
  /*
   * LORRY + GRAND TOTAL
   */

  const leftWidth = 130;
  const totalWidth = 52;
  const boxHeight = 18;

  doc.setLineWidth(0.35);

  doc.rect(
    14,
    y,
    182,
    boxHeight
  );

  doc.line(
    14 + leftWidth,
    y,
    14 + leftWidth,
    y + boxHeight
  );

  /*
   * LORRY
   */
  writeText(
    doc,
    "LORRY",
    17,
    y + 7,
    {
      size: 7,
      bold: true,
    }
  );

  writeText(
    doc,
    "L.R. No.",
    17,
    y + 14,
    {
      size: 7,
    }
  );

  /*
   * GRAND TOTAL
   */
  writeText(
    doc,
    "GRAND TOTAL",
    148,
    y + 11,
    {
      size: 8,
      bold: true,
    }
  );

  writeText(
    doc,
    formatCurrency(order.grand_total),
    193,
    y + 11,
    {
      size: 8,
      bold: true,
      align: "right",
    }
  );

  return y + boxHeight;
}

function drawSummarySection(
  doc,
  order,
  y
) {
  const boxHeight = 38;

  doc.setLineWidth(0.35);

  doc.rect(
    14,
    y,
    182,
    boxHeight
  );

  /*
   * Values
   */

  const actualTotal =
    Number(order.discount_amount || 0) +
    Number(order.subtotal || 0);

  const discountPercentage =
    Number(
      order.discount_percentage || 0
    );

  const discountAmount =
    Number(
      order.discount_amount || 0
    );

  const productTotal =
    Number(order.subtotal || 0);

  const packingCharge =
    Number(order.packing_charge || 0);

  const grandTotal =
    Number(order.grand_total || 0);

  /*
   * LEFT COLUMN
   */

  writeText(
    doc,
    `Actual Total : ${formatCurrency(actualTotal)}`,
    18,
    y + 8,
    {
      size: 7,
    }
  );

  writeText(
    doc,
    `Discount : ${discountPercentage}%`,
    18,
    y + 16,
    {
      size: 7,
    }
  );

  writeText(
    doc,
    `Discount Amount : ${formatCurrency(
      discountAmount
    )}`,
    18,
    y + 24,
    {
      size: 7,
    }
  );

  /*
   * RIGHT COLUMN
   */

  writeText(
    doc,
    `Product Total : ${formatCurrency(
      productTotal
    )}`,
    105,
    y + 8,
    {
      size: 7,
    }
  );

  writeText(
    doc,
    `Packing : ${
      packingCharge > 0
        ? formatCurrency(packingCharge)
        : "FREE"
    }`,
    105,
    y + 16,
    {
      size: 7,
    }
  );

  writeText(
    doc,
    `NET TOTAL : ${formatCurrency(
      grandTotal
    )}`,
    105,
    y + 27,
    {
      size: 8,
      bold: true,
    }
  );

  return y + boxHeight;
}

function drawFooter(doc, y) {
  const footerHeight = 28;

  doc.setLineWidth(0.35);

  doc.rect(
    14,
    y,
    182,
    footerHeight
  );

  /*
   * Prepared / Checked section
   */
  doc.line(
    115,
    y,
    115,
    y + footerHeight
  );

  doc.line(
    115,
    y + 14,
    196,
    y + 14
  );

  /*
   * Terms
   */

  writeText(
    doc,
    "1. Goods once sold cannot be returned.",
    18,
    y + 7,
    {
      size: 5.8,
    }
  );

  writeText(
    doc,
    "2. Subject to Sivakasi Jurisdiction.",
    18,
    y + 14,
    {
      size: 5.8,
    }
  );

  writeText(
    doc,
    "E. & O.E.",
    18,
    y + 21,
    {
      size: 5.8,
    }
  );

  /*
   * Prepared by
   */

  writeText(
    doc,
    "Prepared by",
    119,
    y + 8,
    {
      size: 7,
    }
  );

  doc.line(
    151,
    y + 9,
    191,
    y + 9
  );

  /*
   * Checked by
   */

  writeText(
    doc,
    "Checked by",
    119,
    y + 22,
    {
      size: 7,
    }
  );

  doc.line(
    151,
    y + 23,
    191,
    y + 23
  );

  /*
   * Proprietor
   */

  writeText(
    doc,
    "For Sri Priya Traders",
    196,
    y + 7,
    {
      size: 7,
      bold: true,
      align: "right",
    }
  );
}

export function downloadOrderBillPdf(
  order,
  orderItems
) {
  if (!order) {
    alert("Order information is missing.");
    return;
  }

  if (!orderItems || orderItems.length === 0) {
    alert("No products found for this order.");
    return;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  /*
   * ==========================================================
   * PAGE SETTINGS
   * ==========================================================
   */

  const pageHeight = 297;

  /*
   * First page
   */

  drawHeader(doc);

  drawCustomerSection(
    doc,
    order
  );

  let tableY = 75;

  const columns =
    drawTableHeader(
      doc,
      tableY
    );

  tableY += 8;

  /*
   * ==========================================================
   * PRODUCT ROWS
   * ==========================================================
   */

  const rowHeight = 8;

  /*
   * Keep enough space at bottom for:
   *
   * Lorry
   * Grand Total
   * Summary
   * Footer
   */

  const bottomReserved = 86;

  let currentY = tableY;

  orderItems.forEach(
    (item, index) => {
      if (
        currentY + rowHeight >
        pageHeight - bottomReserved
      ) {
        /*
         * New page
         */
        doc.addPage();

        drawHeader(doc);

        /*
         * Continue product table
         */
        currentY = 40;

        drawTableHeader(
          doc,
          currentY
        );

        currentY += 8;
      }

      drawProductRow(
        doc,
        item,
        index,
        currentY,
        columns
      );

      currentY += rowHeight;
    }
  );

  /*
   * ==========================================================
   * BOTTOM INFORMATION
   * ==========================================================
   */

  /*
   * If the table is too close to the bottom,
   * move bottom section to a fresh page.
   */

  if (
    currentY >
    pageHeight - 82
  ) {
    doc.addPage();

    drawHeader(doc);

    currentY = 45;
  }

  currentY += 2;

  /*
   * GRAND TOTAL
   */

  currentY =
    drawBottomSection(
      doc,
      order,
      currentY
    );

  currentY += 4;

  /*
   * SUMMARY
   */

  currentY =
    drawSummarySection(
      doc,
      order,
      currentY
    );

  currentY += 4;

  /*
   * FOOTER
   */

  drawFooter(
    doc,
    currentY
  );

  /*
   * ==========================================================
   * DOWNLOAD
   * ==========================================================
   */

  const fileName =
    `${
      order.order_number ||
      "sri-priya-traders-bill"
    }.pdf`;

  doc.save(fileName);
}