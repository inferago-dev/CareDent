/**
 * Builds the downloadable pre-installation PDF.
 *
 * Called with no product it produces the general Care Dent site-readiness
 * document; called with a product it opens with that model's own requirements
 * and names the file after it.
 */

import PdfDoc from './pdf';
import {
  PRE_INSTALL_SECTIONS,
  SITE_READINESS_CHECKLIST,
  requirementsFor,
} from '../data/preInstallation';
import { COMPANY_DETAILS } from '../data/products';

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'care-dent';

export default function downloadPreInstallationPdf(product = null) {
  const doc = new PdfDoc({
    title: product
      ? `${product.name} - Pre-Installation Requirements`
      : 'Pre-Installation Requirements',
    subject: 'Site readiness requirements for a Care Dent installation',
    footer: `Care Dent  |  ${COMPANY_DETAILS.phoneNumbers[0]}  |  ${COMPANY_DETAILS.email}`,
  });

  doc.title1(
    product ? `${product.name}\nPre-Installation Requirements` : 'Pre-Installation Requirements',
    'Everything the site needs before an installation date is confirmed.'
  );

  doc.text(
    'Share this with your civil, electrical and plumbing contractors. Work through it before the ' +
    'installation date - a site that is ready is a chair that is working the same evening. If anything ' +
    'here is unclear, call us and an engineer will walk the layout through with you.',
    { size: 10, color: [0.42, 0.47, 0.55], spaceAfter: 6 }
  );

  doc.row('Clinic', '_______________________________________');
  doc.row('Contact person', '_______________________________________');
  doc.row('Site address', '_______________________________________');
  doc.row('Target installation date', '_______________________________________');

  if (product) {
    doc.rule();
    doc.heading(`Requirements for ${product.name}`, { eyebrow: 'MODEL SPECIFIC' });
    requirementsFor(product).forEach((item) => doc.bullet(item));
    if (product.specifications?.length) {
      doc.spacer(6);
      doc.text('Key specifications', { size: 10, bold: true, color: [0.09, 0.14, 0.33], spaceAfter: 3 });
      product.specifications.slice(0, 8).forEach((spec) => doc.row(spec.label, spec.value));
    }
  }

  doc.rule();

  PRE_INSTALL_SECTIONS.forEach((section, index) => {
    doc.heading(`${index + 1}. ${section.title}`, {
      eyebrow: section.optional ? 'OPTIONAL' : '',
    });
    if (section.summary) {
      doc.text(section.summary, { size: 9, color: [0.42, 0.47, 0.55], spaceAfter: 4 });
    }
    section.items.forEach((item) => doc.bullet(item));
  });

  doc.rule();
  doc.heading('Site-readiness checklist', { eyebrow: 'SIGN OFF BEFORE THE INSTALLATION DATE' });
  doc.spacer(4);
  SITE_READINESS_CHECKLIST.forEach((item) => doc.checkbox(item));

  doc.spacer(14);
  doc.row('Signed (clinic)', '____________________________');
  doc.row('Date', '____________________________');

  doc.spacer(12);
  doc.text(
    `Questions? Call ${COMPANY_DETAILS.founder} on ${COMPANY_DETAILS.phoneNumbers[0]} or request a free ` +
    'pre-installation site assessment at www.caredent.net/services/pre-installation.',
    { size: 9, color: [0.42, 0.47, 0.55] }
  );

  return doc.save(
    product
      ? `care-dent-pre-installation-${slugify(product.name)}.pdf`
      : 'care-dent-pre-installation-checklist.pdf'
  );
}
