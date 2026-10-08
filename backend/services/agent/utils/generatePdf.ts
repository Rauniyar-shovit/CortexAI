import PDFDocument from "pdfkit";

// Pdf layout implemented from the "Onyx PDF Template" design.

export type PdfAccent = "Lavender" | "Mint" | "Peach";

export interface PdfTable {
  columns: string[];
  rows: string[][];
  caption?: string;
}

export interface PdfSection {
  heading: string;
  paragraphs?: string[];
  points?: string[];
  ordered?: boolean;
  table?: PdfTable;
}

export interface PdfKeyPoint {
  title: string;
  text: string;
}

export interface PdfData {
  title: string;
  subtitle?: string;
  prompt?: string;
  summary?: string[];
  keyPoints?: PdfKeyPoint[];
  sections: PdfSection[];
  sources?: string[];
}

export interface PdfOptions {
  accent?: PdfAccent;
  showSources?: boolean;
  date?: Date;
}

// oklch accents from the design, converted to hex (pdfkit only takes RGB)
const ACCENTS: Record<
  PdfAccent,
  { ac: string; ac2: string; ac3: string; acs: string }
> = {
  Lavender: { ac: "#c9c2fc", ac2: "#9ddbb9", ac3: "#f9b9a3", acs: "#eeecff" },
  Mint: { ac: "#9ddbb9", ac2: "#fab8ac", ac3: "#b6c9ff", acs: "#def5e8" },
  Peach: { ac: "#f9b9a3", ac2: "#b6c9ff", ac3: "#a6daaf", acs: "#ffe8e0" },
};

const COLOR = {
  ink: "#25233a",
  inkStrong: "#1d1a30",
  body: "#46435c",
  muted: "#67637e",
  line: "#e2dfee",
  tile: "#f2f0f8",
  card: "#f7f6fb",
  white: "#ffffff",
};

const FONT = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
  mono: "Courier",
};

const PAGE = {
  side: 50,
  top: 82,
  bottom: 72,
  headerY: 30,
};

const BODY = { size: 10.5, lineGap: 3.5 };

// Standard pdf fonts only cover WinAnsi, so swap or drop anything outside it
const WIN_ANSI_EXTRAS = "–—‘’“”•…€™‚„†‡ˆ‰Š‹ŒŽ˜šœžŸƒ";
const REPLACEMENTS: Record<string, string> = {
  "→": "->",
  "←": "<-",
  "≥": ">=",
  "≤": "<=",
  "≈": "~",
  "×": "x",
  "−": "-",
  "✓": "-",
};

const clean = (text: string = "") =>
  Array.from(String(text))
    .map((ch) => REPLACEMENTS[ch] ?? ch)
    .join("")
    .replace(/[^\x00-\xff]/g, (ch) => (WIN_ANSI_EXTRAS.includes(ch) ? ch : ""));

export const generatePdf = (
  data: PdfData,
  options: PdfOptions = {},
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const accent = ACCENTS[options.accent ?? "Lavender"];
    const showSources = options.showSources ?? true;
    const date = (options.date ?? new Date()).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const doc = new PDFDocument({
      size: "A4",
      bufferPages: true,
      margins: {
        top: PAGE.top,
        bottom: PAGE.bottom,
        left: PAGE.side,
        right: PAGE.side,
      },
      info: {
        Author: "OnyxAI",
        Title: clean(data.title),
        Creator: "OnyxAI",
      },
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = PAGE.side;
    const width = doc.page.width - PAGE.side * 2;
    const bottomLimit = () => doc.page.height - PAGE.bottom;

    const ensureSpace = (height: number) => {
      if (doc.y + height > bottomLimit()) doc.addPage();
    };

    const measure = (
      text: string,
      font: string,
      size: number,
      w: number,
      lineGap = 0,
    ) =>
      doc.font(font).fontSize(size).heightOfString(text, { width: w, lineGap });

    const truncate = (text: string, maxWidth: number) => {
      if (doc.widthOfString(text) <= maxWidth) return text;
      let t = text;
      while (t.length && doc.widthOfString(t + "…") > maxWidth)
        t = t.slice(0, -1);
      return t.trimEnd() + "…";
    };

    const pill = (x: number, y: number, text: string, bg: string) => {
      doc.font(FONT.bold).fontSize(8);
      const w = doc.widthOfString(text) + 14;
      doc.roundedRect(x, y, w, 15, 7.5).fill(bg);
      doc
        .fillColor(COLOR.inkStrong)
        .text(text, x + 7, y + 4, { lineBreak: false });
      return w;
    };

    const topRoundedRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
    ) =>
      doc
        .moveTo(x, y + h)
        .lineTo(x, y + r)
        .quadraticCurveTo(x, y, x + r, y)
        .lineTo(x + w - r, y)
        .quadraticCurveTo(x + w, y, x + w, y + r)
        .lineTo(x + w, y + h)
        .closePath();

    const heading = (text: string) => {
      const h = measure(text, FONT.bold, 16, width);
      // keep the heading with at least a couple of lines of its content
      ensureSpace(h + 40);
      doc
        .font(FONT.bold)
        .fontSize(16)
        .fillColor(COLOR.ink)
        .text(text, left, doc.y, { width });
      doc.y += 6;
    };

    const paragraph = (text: string) => {
      doc
        .font(FONT.regular)
        .fontSize(BODY.size)
        .fillColor(COLOR.ink)
        .text(clean(text), left, doc.y, { width, lineGap: BODY.lineGap });
      doc.y += 9;
    };

    // ---- Hero card ----
    const drawHero = () => {
      const pad = 22;
      const inner = width - pad * 2;
      const title = clean(data.title);
      const subtitle = clean(data.subtitle);
      const prompt = data.prompt ? `"${clean(data.prompt)}"` : "";
      const subtitleWidth = Math.min(inner, 380);
      const promptLabelW = 44;
      const promptTextW = inner - 24 - promptLabelW - 10;

      const titleH = measure(title, FONT.bold, 26, inner, 2);
      const subtitleH = subtitle
        ? measure(subtitle, FONT.regular, 11.5, subtitleWidth, 2)
        : 0;
      const promptTextH = prompt
        ? measure(prompt, FONT.regular, 10, promptTextW, 2)
        : 0;
      const promptBoxH = prompt ? promptTextH + 22 : 0;

      const height =
        pad +
        15 +
        12 +
        titleH +
        (subtitle ? 8 + subtitleH : 0) +
        (prompt ? 14 + promptBoxH : 0) +
        pad;

      ensureSpace(height);
      const top = doc.y;
      doc.roundedRect(left, top, width, height, 18).fill(accent.acs);

      let y = top + pad;
      let x = left + pad;

      doc
        .font(FONT.bold)
        .fontSize(26)
        .fillColor(COLOR.ink)
        .text(title, left + pad, y, { width: inner, lineGap: 2 });
      y += titleH;

      if (subtitle) {
        y += 8;
        doc
          .font(FONT.regular)
          .fontSize(11.5)
          .fillColor(COLOR.body)
          .text(subtitle, left + pad, y, { width: subtitleWidth, lineGap: 2 });
        y += subtitleH;
      }

      if (prompt) {
        y += 14;
        doc.roundedRect(left + pad, y, inner, promptBoxH, 12).fill(COLOR.white);
        doc
          .font(FONT.bold)
          .fontSize(7.5)
          .fillColor(COLOR.muted)
          .text("PROMPT", left + pad + 12, y + 12.5, {
            width: promptLabelW,
            characterSpacing: 0.6,
            lineBreak: false,
          });
        doc
          .font(FONT.regular)
          .fontSize(10)
          .fillColor(COLOR.ink)
          .text(prompt, left + pad + 12 + promptLabelW + 10, y + 11, {
            width: promptTextW,
            lineGap: 2,
          });
      }

      doc.x = left;
      doc.y = top + height + 22;
    };

    // ---- Key point tiles (3 per row) ----
    const drawKeyPoints = (items: PdfKeyPoint[]) => {
      const cols = 3;
      const gap = 8;
      const pad = 12;
      const tileW = (width - gap * (cols - 1)) / cols;
      const textW = tileW - pad * 2;
      const dots = [accent.ac, accent.ac2, accent.ac3];

      for (let i = 0; i < items.length; i += cols) {
        const row = items.slice(i, i + cols).map((item) => ({
          title: clean(item.title),
          text: clean(item.text),
        }));
        const heights = row.map(
          (item) =>
            8 +
            6 +
            measure(item.title, FONT.bold, 11.5, textW) +
            3 +
            measure(item.text, FONT.regular, 9.5, textW, 1.5),
        );
        const tileH = Math.max(...heights) + pad * 2;

        ensureSpace(tileH);
        const top = doc.y;
        row.forEach((item, j) => {
          const x = left + j * (tileW + gap);
          doc.roundedRect(x, top, tileW, tileH, 14).fill(COLOR.tile);
          doc
            .circle(x + pad + 4, top + pad + 4, 4)
            .fill(dots[(i + j) % dots.length]);

          let y = top + pad + 8 + 6;
          doc
            .font(FONT.bold)
            .fontSize(11.5)
            .fillColor(COLOR.ink)
            .text(item.title, x + pad, y, { width: textW });
          y += measure(item.title, FONT.bold, 11.5, textW) + 3;
          doc
            .font(FONT.regular)
            .fontSize(9.5)
            .fillColor(COLOR.body)
            .text(item.text, x + pad, y, { width: textW, lineGap: 1.5 });
        });

        doc.x = left;
        doc.y = top + tileH + gap;
      }
      doc.y += 14;
    };

    // ---- Bulleted / numbered list ----
    const drawList = (points: string[], ordered = false) => {
      const indent = 16;
      const textW = width - indent;
      points.forEach((raw, i) => {
        const text = clean(raw);
        const firstLineH = measure(
          "A",
          FONT.regular,
          BODY.size,
          textW,
          BODY.lineGap,
        );
        ensureSpace(firstLineH + 4);
        const y = doc.y;

        if (ordered) {
          doc
            .font(FONT.bold)
            .fontSize(BODY.size)
            .fillColor(COLOR.ink)
            .text(`${i + 1}.`, left, y, { width: indent, lineBreak: false });
        } else {
          doc.circle(left + 4, y + BODY.size * 0.55, 2.8).fill(accent.ac);
        }

        doc
          .font(FONT.regular)
          .fontSize(BODY.size)
          .fillColor(COLOR.ink)
          .text(text, left + indent, y, {
            width: textW,
            lineGap: BODY.lineGap,
          });
        doc.y += 4;
      });
      doc.x = left;
      doc.y += 10;
    };

    // ---- Table (header repeats on page break) ----
    const drawTable = (table: PdfTable) => {
      const columns = table.columns.map(clean);
      const rows = table.rows.map((row) =>
        columns.map((_, i) => clean(row[i] ?? "")),
      );
      if (!columns.length) return;

      const colW = width / columns.length;
      const padX = 10;
      const padY = 7;
      const size = 9.5;
      const radius = 12;

      const rowHeight = (cells: string[], font: string) =>
        Math.max(...cells.map((c) => measure(c, font, size, colW - padX * 2))) +
        padY * 2;

      const drawCells = (cells: string[], font: string, y: number) => {
        doc.font(font).fontSize(size).fillColor(COLOR.ink);
        cells.forEach((cell, i) => {
          doc.text(cell, left + i * colW + padX, y + padY, {
            width: colW - padX * 2,
          });
        });
      };

      const headH = rowHeight(columns, FONT.bold);
      let segmentTop = 0;

      const startSegment = () => {
        segmentTop = doc.y;
        topRoundedRect(left, segmentTop, width, headH, radius).fill(COLOR.tile);
        drawCells(columns, FONT.bold, segmentTop);
        doc.y = segmentTop + headH;
      };

      const closeSegment = () => {
        doc
          .roundedRect(left, segmentTop, width, doc.y - segmentTop, radius)
          .lineWidth(0.75)
          .stroke(COLOR.line);
      };

      ensureSpace(headH + (rows[0] ? rowHeight(rows[0], FONT.regular) : 0));
      startSegment();

      for (const row of rows) {
        const h = rowHeight(row, FONT.regular);
        if (doc.y + h > bottomLimit()) {
          closeSegment();
          doc.addPage();
          startSegment();
        }
        const y = doc.y;
        doc
          .moveTo(left, y)
          .lineTo(left + width, y)
          .lineWidth(0.75)
          .stroke(COLOR.line);
        drawCells(row, FONT.regular, y);
        doc.y = y + h;
      }
      closeSegment();

      doc.x = left;
      if (table.caption) {
        doc.y += 5;
        doc
          .font(FONT.regular)
          .fontSize(8.5)
          .fillColor(COLOR.muted)
          .text(clean(table.caption), left, doc.y, { width });
      }
      doc.y += 18;
    };

    // ---- Sources card ----
    const drawSources = (sources: string[]) => {
      const padX = 16;
      const padY = 14;
      const numW = 24;
      const textW = width - padX * 2 - numW;
      const items = sources.map(clean);
      const itemHeights = items.map((s) =>
        measure(s, FONT.regular, 9.5, textW, 1),
      );
      const height =
        padY * 2 +
        measure("Sources", FONT.bold, 11.5, textW) +
        6 +
        itemHeights.reduce((sum, h) => sum + h + 3, 0);

      ensureSpace(Math.min(height, bottomLimit() - PAGE.top));
      const top = doc.y;
      doc.roundedRect(left, top, width, height, 16).fill(COLOR.card);

      let y = top + padY;
      doc
        .font(FONT.bold)
        .fontSize(11.5)
        .fillColor(COLOR.ink)
        .text("Sources", left + padX, y, { width: textW });
      y += measure("Sources", FONT.bold, 11.5, textW) + 6;

      items.forEach((source, i) => {
        doc
          .font(FONT.mono)
          .fontSize(8.5)
          .fillColor(COLOR.muted)
          .text(`[${i + 1}]`, left + padX, y + 1, {
            width: numW,
            lineBreak: false,
          });
        doc
          .font(FONT.regular)
          .fontSize(9.5)
          .fillColor(COLOR.body)
          .text(source, left + padX + numW, y, { width: textW, lineGap: 1 });
        y += itemHeights[i] + 3;
      });

      doc.x = left;
      doc.y = top + height + 18;
    };

    // ---- Running header / footer (drawn on every page at the end) ----
    const drawHeader = () => {
      const y = PAGE.headerY;
      doc.circle(left + 8, y + 8, 8).fill(COLOR.ink);
      doc.circle(left + 6.4, y + 6.4, 2.4).fill(accent.ac);

      doc.font(FONT.bold).fontSize(11).fillColor(COLOR.ink);
      doc.text("Onyx", left + 22, y + 3, { lineBreak: false });
      const pillX = left + 22 + doc.widthOfString("Onyx") + 8;
      const pillW = pill(pillX, y + 0.5, "AI generated", accent.ac);

      const metaX = pillX + pillW + 16;
      const metaW = left + width - metaX;
      doc.font(FONT.regular).fontSize(8.5).fillColor(COLOR.muted);
      doc.text(truncate(clean(data.title), metaW), metaX, y + 4, {
        width: metaW,
        align: "right",
        lineBreak: false,
      });

      doc
        .moveTo(left, y + 25)
        .lineTo(left + width, y + 25)
        .lineWidth(0.75)
        .stroke(COLOR.line);
    };

    const drawFooter = () => {
      const y = doc.page.height - 50;
      doc
        .moveTo(left, y)
        .lineTo(left + width, y)
        .lineWidth(0.75)
        .stroke(COLOR.line);
      doc.circle(left + 3, y + 14, 3).fill(accent.ac);
      doc.font(FONT.regular).fontSize(8).fillColor(COLOR.muted);
      doc.text(
        "Generated by Onyx AI. It can make mistakes — review before sharing.",
        left + 11,
        y + 10.5,
        { lineBreak: false },
      );
      doc.text("onyx.ai", left, y + 10.5, {
        width,
        align: "right",
        lineBreak: false,
      });
    };

    // ---- Document body ----
    drawHero();

    if (data.summary?.length) {
      heading("Summary");
      data.summary.forEach(paragraph);
      doc.y += 6;
    }

    if (data.keyPoints?.length) drawKeyPoints(data.keyPoints);

    data.sections?.forEach((section) => {
      heading(clean(section.heading));
      section.paragraphs?.forEach(paragraph);
      if (section.table) drawTable(section.table);
      if (section.points?.length) drawList(section.points, section.ordered);
      else doc.y += 8;
    });

    if (showSources && data.sources?.length) drawSources(data.sources);

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      // header/footer sit inside the page margins, so lift them while drawing
      // to stop pdfkit from auto-adding pages
      const { top, bottom } = doc.page.margins;
      doc.page.margins.top = 0;
      doc.page.margins.bottom = 0;
      drawHeader();
      drawFooter();
      doc.page.margins.top = top;
      doc.page.margins.bottom = bottom;
    }

    doc.end();
  });
};
