/**
 * A very small PDF writer.
 *
 * We only ever need to lay out headings, paragraphs, bullets and tick-boxes on
 * A4 pages, which a few hundred bytes of PDF syntax can do on their own - so
 * this avoids pulling a ~400 kB PDF library into the bundle for one download
 * button. Text is Helvetica (a PDF base-14 font, so nothing is embedded) and
 * is measured with the standard AFM widths so wrapping lands correctly.
 *
 *   const doc = new PdfDoc({ title: 'Checklist' });
 *   doc.heading('Site measurements');
 *   doc.bullet('Room length x width');
 *   doc.save('checklist.pdf');
 */

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BOTTOM = 64;

// Adobe AFM advance widths (1/1000 em) for Helvetica, chars 32-126.
const W_REGULAR = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

const W_BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

/** PDF strings here are WinAnsi; fold the typography we use back to ASCII. */
const ASCII_MAP = {
  '–': '-', '—': '-', '‘': "'", '’': "'",
  '“': '"', '”': '"', '…': '...', '×': 'x',
  '°': ' deg', '½': '1/2', '¼': '1/4', '¾': '3/4',
  '\u2011': '-', '\u00a0': ' ', '•': '-', '→': '->', 'Ω': 'ohm',
};

const toAscii = (value) =>
  String(value ?? '')
    .replace(/[–—‘’“”…×°½¼¾\u2011\u00a0•→Ω]/g, (c) => ASCII_MAP[c])
    .replace(/[^\x20-\x7e\n]/g, '');

const escapePdf = (value) => value.replace(/([\\()])/g, '\\$1');

export function measure(text, size, bold = false) {
  const table = bold ? W_BOLD : W_REGULAR;
  let total = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    total += (code >= 32 && code <= 126 ? table[code - 32] : 500) * size;
  }
  return total / 1000;
}

function wrapText(text, size, bold, maxWidth) {
  const lines = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && measure(candidate, size, bold) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    lines.push(line);
  }
  return lines;
}

const COLORS = {
  ink: [0.13, 0.16, 0.22],
  muted: [0.42, 0.47, 0.55],
  brand: [0.09, 0.14, 0.33],
  accent: [0.03, 0.57, 0.7],
  rule: [0.85, 0.88, 0.91],
  white: [1, 1, 1],
};

export default class PdfDoc {
  constructor({ title = 'Document', subject = '', footer = '' } = {}) {
    this.title = toAscii(title);
    this.subject = toAscii(subject);
    this.footer = toAscii(footer);
    this.pages = [];
    this.ops = null;
    this.y = 0;
    this.addPage();
  }

  addPage() {
    this.ops = [];
    this.pages.push(this.ops);
    this.y = PAGE_H - MARGIN;
    return this;
  }

  _ensure(space) {
    if (this.y - space < BOTTOM) this.addPage();
  }

  _fill(color) {
    return `${color[0]} ${color[1]} ${color[2]} rg`;
  }

  _stroke(color) {
    return `${color[0]} ${color[1]} ${color[2]} RG`;
  }

  /** Draws a single pre-measured line at an absolute baseline. */
  _line(text, { x, baseline, size, bold, color }) {
    this.ops.push(
      this._fill(color),
      'BT',
      `/${bold ? 'F2' : 'F1'} ${size} Tf`,
      `${x} ${baseline} Td`,
      `(${escapePdf(text)}) Tj`,
      'ET'
    );
  }

  rect(x, y, w, h, color) {
    this.ops.push(this._fill(color), `${x} ${y} ${w} ${h} re f`);
    return this;
  }

  rule({ color = COLORS.rule, gap = 10 } = {}) {
    this._ensure(gap * 2);
    this.y -= gap;
    this.ops.push(this._stroke(color), '0.7 w', `${MARGIN} ${this.y} m ${PAGE_W - MARGIN} ${this.y} l S`);
    this.y -= gap;
    return this;
  }

  spacer(height = 10) {
    this.y -= height;
    return this;
  }

  /**
   * Flows wrapped text down the page, breaking across pages as needed.
   * `indent` shifts the block right; `hanging` is drawn once in the gutter.
   */
  text(value, {
    size = 10,
    bold = false,
    color = COLORS.ink,
    indent = 0,
    lineHeight = 1.45,
    spaceAfter = 0,
    hanging = null,
    hangingColor = COLORS.accent,
    hangingBold = true,
  } = {}) {
    const body = toAscii(value);
    const x = MARGIN + indent;
    const lines = wrapText(body, size, bold, CONTENT_W - indent);
    const step = size * lineHeight;

    lines.forEach((line, i) => {
      this._ensure(step);
      const baseline = this.y - size;
      if (i === 0 && hanging) {
        const mark = toAscii(hanging);
        this._line(mark, {
          x: x - measure(mark, size, hangingBold) - 6,
          baseline,
          size,
          bold: hangingBold,
          color: hangingColor,
        });
      }
      this._line(line, { x, baseline, size, bold, color });
      this.y -= step;
    });

    this.y -= spaceAfter;
    return this;
  }

  title1(value, subtitle = '') {
    this.rect(0, PAGE_H - 132, PAGE_W, 132, COLORS.brand);
    this._line(toAscii('CARE DENT'), { x: MARGIN, baseline: PAGE_H - 52, size: 10, bold: true, color: COLORS.accent });
    this.y = PAGE_H - 62;
    this.text(value, { size: 21, bold: true, color: COLORS.white, lineHeight: 1.25 });
    if (subtitle) this.text(subtitle, { size: 10, color: [0.72, 0.78, 0.86] });
    this.y = PAGE_H - 132 - 30;
    return this;
  }

  heading(value, { eyebrow = '' } = {}) {
    this._ensure(60);
    this.spacer(8);
    if (eyebrow) this.text(eyebrow, { size: 8, bold: true, color: COLORS.accent, spaceAfter: 2 });
    this.text(value, { size: 13, bold: true, color: COLORS.brand, spaceAfter: 4 });
    return this;
  }

  bullet(value, { size = 10 } = {}) {
    return this.text(value, { size, indent: 16, hanging: '-', lineHeight: 1.4, spaceAfter: 2 });
  }

  /** An empty tick-box the clinic fills in by hand. */
  checkbox(value, { size = 10 } = {}) {
    const step = size * 1.9;
    this._ensure(step);
    const boxSize = 9;
    const boxY = this.y - size - 1;
    this.ops.push(
      this._stroke(COLORS.muted),
      '0.8 w',
      `${MARGIN + 2} ${boxY} ${boxSize} ${boxSize} re S`
    );
    this._line(toAscii(value), { x: MARGIN + 20, baseline: boxY + 1.5, size, bold: false, color: COLORS.ink });
    this.y -= step;
    return this;
  }

  /** A label/value row, used for the site-details block. */
  row(label, value) {
    const size = 9.5;
    const step = size * 1.7;
    this._ensure(step);
    const baseline = this.y - size;
    this._line(toAscii(label), { x: MARGIN, baseline, size, bold: true, color: COLORS.muted });
    this._line(toAscii(value), { x: MARGIN + 150, baseline, size, bold: false, color: COLORS.ink });
    this.y -= step;
    return this;
  }

  _footers() {
    const total = this.pages.length;
    this.pages.forEach((ops, index) => {
      const saved = this.ops;
      this.ops = ops;
      this.ops.push(this._stroke(COLORS.rule), '0.7 w', `${MARGIN} 52 m ${PAGE_W - MARGIN} 52 l S`);
      if (this.footer) {
        this._line(this.footer, { x: MARGIN, baseline: 38, size: 8, bold: false, color: COLORS.muted });
      }
      const label = `Page ${index + 1} of ${total}`;
      this._line(label, {
        x: PAGE_W - MARGIN - measure(label, 8, false),
        baseline: 38,
        size: 8,
        bold: false,
        color: COLORS.muted,
      });
      this.ops = saved;
    });
  }

  /** Serialises the document to PDF source (ASCII only, so 1 char = 1 byte). */
  toString() {
    this._footers();

    const objects = [];
    const push = (body) => objects.push(body); // 1-indexed by position

    const pageCount = this.pages.length;
    const firstPageObj = 3;
    const kids = this.pages.map((_, i) => `${firstPageObj + i * 2} 0 R`).join(' ');
    const fontRegular = firstPageObj + pageCount * 2;
    const fontBold = fontRegular + 1;

    push('<< /Type /Catalog /Pages 2 0 R >>');
    push(`<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`);

    this.pages.forEach((ops, i) => {
      const contentObj = firstPageObj + i * 2 + 1;
      push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
        `/Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> ` +
        `/Contents ${contentObj} 0 R >>`
      );
      const stream = ops.join('\n');
      push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    });

    push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    push(
      `<< /Title (${escapePdf(this.title)}) /Subject (${escapePdf(this.subject)}) ` +
      '/Producer (Care Dent website) /Creator (Care Dent website) >>'
    );
    const infoObj = objects.length;

    let pdf = '%PDF-1.4\n';
    const offsets = [];
    objects.forEach((body, i) => {
      offsets.push(pdf.length);
      pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    });

    const xrefStart = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const offset of offsets) {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${infoObj} 0 R >>\n`;
    pdf += `startxref\n${xrefStart}\n%%EOF\n`;

    return pdf;
  }

  toBlob() {
    return new Blob([this.toString()], { type: 'application/pdf' });
  }

  /** Triggers a browser download. Returns the object URL it revoked. */
  save(filename = 'document.pdf') {
    const url = URL.createObjectURL(this.toBlob());
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return filename;
  }
}

export { COLORS, MARGIN, PAGE_W, PAGE_H, toAscii };
