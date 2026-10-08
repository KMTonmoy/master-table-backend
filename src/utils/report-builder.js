import PDFDocument from "pdfkit";
import XLSX from "xlsx";

import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Customer } from "../models/Customer.js";
import { tierFor } from "../constants/status.js";

const COLORS = {
  ink: "#1A1A1A",
  muted: "#6B6B6B",
  border: "#D9D9D9",
  headerBg: "#F2F2F2",
  gold: "#E0A526",
  zebra: "#FAFAFA",
  headerInk: "#2B1B10",
};

const csvEscape = (v) => {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export const buildCsv = (report, rows) => {
  const meta = [
    [report.name || "Report"],
    [`Generated ${new Date().toLocaleString("en-US")}`],
    [`Period: ${report.range || "—"}`],
    [],
  ];
  const all = [...meta, ...rows];
  return "\uFEFF" + all.map((r) => r.map(csvEscape).join(",")).join("\r\n");
};

export const buildXlsx = (report, rows) => {
  const meta = [
    [report.name || "Report"],
    ["Generated", new Date().toLocaleString("en-US")],
    ["Period", report.range || "—"],
    [],
  ];
  const aoa = [...meta, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  const widths = [];
  rows.forEach((row) => {
    row.forEach((cell, i) => {
      const len = String(cell ?? "").length + 2;
      widths[i] = Math.max(widths[i] || 10, Math.min(len, 50));
    });
  });
  ws["!cols"] = widths.map((w) => ({ wch: w }));

  const headerRow = meta.length;
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: headerRow, c })];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: "FFFFFFFF" } },
        fill: { fgColor: { rgb: "FFE0A526" } },
        alignment: { vertical: "center", horizontal: "left" },
      };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
};

export const buildPdf = (report, rows) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 30,
      info: {
        Title: report.name || "Report",
        Author: "Master Table",
        Subject: report.range || "",
      },
    });

    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const leftX = doc.page.margins.left;

    doc.rect(0, 0, doc.page.width, 90).fill(COLORS.gold);
    doc
      .fillColor(COLORS.headerInk)
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("MASTER TABLE", leftX, 26, { width: pageWidth });
    doc
      .fillColor(COLORS.headerInk)
      .font("Helvetica")
      .fontSize(10)
      .text("Restaurant Analytics", leftX, 52, { width: pageWidth });

    let cursorY = 120;

    doc
      .fillColor(COLORS.ink)
      .font("Helvetica-Bold")
      .fontSize(18)
      .text(report.name || "Report", leftX, cursorY, { width: pageWidth });
    cursorY += 26;

    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(10);
    doc.text(`Period: ${report.range || "—"}`, leftX, cursorY);
    cursorY += 14;
    doc.text(
      `Generated: ${new Date().toLocaleString("en-US")}`,
      leftX,
      cursorY
    );
    cursorY += 14;
    doc.text(`Format: ${report.format || "PDF"}`, leftX, cursorY);
    cursorY += 20;

    doc
      .moveTo(leftX, cursorY)
      .lineTo(leftX + pageWidth, cursorY)
      .strokeColor(COLORS.border)
      .lineWidth(1)
      .stroke();
    cursorY += 16;

    if (!rows.length) {
      doc
        .fillColor(COLORS.muted)
        .font("Helvetica-Oblique")
        .fontSize(11)
        .text("No data available.", leftX, cursorY);
      doc.end();
      return;
    }

    const headers = rows[0];
    const body = rows.slice(1);
    const colCount = headers.length;
    const colWidth = pageWidth / colCount;
    const rowHeight = 22;
    const headerHeight = 28;
    const bottomLimit = doc.page.height - doc.page.margins.bottom - 20;

    const drawHeader = () => {
      doc.rect(leftX, cursorY, pageWidth, headerHeight).fill(COLORS.headerBg);
      doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(9);
      headers.forEach((h, i) => {
        doc.text(String(h), leftX + 8 + i * colWidth, cursorY + 9, {
          width: colWidth - 16,
          height: headerHeight,
          ellipsis: true,
        });
      });
      doc
        .rect(leftX, cursorY, pageWidth, headerHeight)
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .stroke();
      cursorY += headerHeight;
    };

    drawHeader();
    doc.font("Helvetica").fontSize(9).fillColor(COLORS.ink);

    body.forEach((row, idx) => {
      if (cursorY + rowHeight > bottomLimit) {
        doc.addPage();
        cursorY = doc.page.margins.top;
        drawHeader();
        doc.font("Helvetica").fontSize(9).fillColor(COLORS.ink);
      }
      if (idx % 2 === 1) {
        doc.rect(leftX, cursorY, pageWidth, rowHeight).fill(COLORS.zebra);
      }
      row.forEach((cell, i) => {
        doc.fillColor(COLORS.ink);
        doc.text(String(cell ?? ""), leftX + 8 + i * colWidth, cursorY + 7, {
          width: colWidth - 16,
          height: rowHeight,
          ellipsis: true,
          lineBreak: false,
        });
      });
      doc
        .rect(leftX, cursorY, pageWidth, rowHeight)
        .strokeColor(COLORS.border)
        .lineWidth(0.3)
        .stroke();
      cursorY += rowHeight;
    });

    const range = doc.bufferedPageRange();
    for (let p = 0; p < range.count; p++) {
      doc.switchToPage(range.start + p);
      const y = doc.page.height - doc.page.margins.bottom + 5;
      doc
        .moveTo(leftX, y - 10)
        .lineTo(leftX + pageWidth, y - 10)
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .stroke();
      doc
        .fillColor(COLORS.muted)
        .font("Helvetica")
        .fontSize(8)
        .text(`Master Table · ${report.name || "Report"}`, leftX, y, {
          width: pageWidth / 2,
          align: "left",
        });
      doc.text(`Page ${p + 1} of ${range.count}`, leftX, y, {
        width: pageWidth,
        align: "right",
      });
    }

    doc.end();
  });

export const buildReportRows = async (report) => {
  const name = (report.name || "").toLowerCase();

  if (name.includes("inventory")) {
    const list = await Product.find()
      .select("name category stock sold price status")
      .sort({ stock: 1 })
      .lean();
    return [
      ["Product", "Category", "Stock", "Sold", "Price", "Status"],
      ...list.map((p) => [
        p.name,
        p.category,
        p.stock ?? 0,
        p.sold ?? 0,
        `$${Number(p.price ?? 0).toFixed(2)}`,
        p.status ?? "Active",
      ]),
    ];
  }

  if (name.includes("customer")) {
    const list = await Customer.find().sort({ spent: -1 }).lean();
    const agg = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: { $toLower: "$email" },
          orders: { $sum: 1 },
          spent: { $sum: "$total" },
          lastTime: { $max: "$time" },
        },
      },
    ]);
    const byEmail = new Map(agg.map((a) => [a._id, a]));

    return [
      ["Name", "Email", "City", "Orders", "Spent", "Tier", "Last visit"],
      ...list.map((c) => {
        const a = byEmail.get((c.email || "").toLowerCase());
        const spent = Number(a?.spent || c.spent || 0);
        return [
          c.name,
          c.email,
          c.city || "—",
          a?.orders || c.orders || 0,
          `$${spent.toFixed(2)}`,
          tierFor(spent),
          a?.lastTime
            ? new Date(a.lastTime).toISOString().slice(0, 10)
            : c.lastVisit || "—",
        ];
      }),
    ];
  }

  if (name.includes("menu")) {
    const list = await Product.find().sort({ sold: -1 }).lean();
    return [
      ["Product", "Category", "Price", "Sold", "Revenue", "Rating"],
      ...list.map((p) => [
        p.name,
        p.category,
        `$${Number(p.price ?? 0).toFixed(2)}`,
        p.sold ?? 0,
        `$${(Number(p.price ?? 0) * Number(p.sold ?? 0)).toFixed(2)}`,
        Number(p.rating ?? 0).toFixed(1),
      ]),
    ];
  }

  const list = await Order.find({ status: { $ne: "Cancelled" } })
    .sort({ time: -1 })
    .limit(500)
    .lean();

  const rows = [
    ["Order ID", "Customer", "Phone", "Status", "Items", "Total", "Time"],
  ];

  list.forEach((o) => {
    rows.push([
      o.orderId,
      o.customer,
      o.phone || o.address?.phone || "—",
      o.status,
      (o.items || []).join(", "),
      `$${Number(o.total ?? 0).toFixed(2)}`,
      o.time instanceof Date
        ? o.time.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : String(o.time ?? ""),
    ]);
  });

  return rows;
};