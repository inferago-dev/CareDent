/**
 * Gallery images.
 *
 * The gallery page merges these bundled entries with any product photos the
 * admin has uploaded, so it grows on its own as the catalogue does. To add
 * real installation or clinic photographs, drop the files into
 * `public/gallery/` and add an entry here - nothing else needs changing.
 */

export const GALLERY_CATEGORIES = ['Dental Chairs', 'Equipment', 'Utility & Sterilization'];

export const GALLERY_ITEMS = [
  {
    id: 'gamma-overhanging',
    src: '/products/gamma-overhanging.jpg',
    title: 'Gamma Overhanging',
    caption: 'Over-the-patient delivery, installed with a continental arm unit.',
    category: 'Dental Chairs',
    href: '/products/gamma-overhanging',
  },
  {
    id: 'gamma-premium',
    src: '/products/gamma-premium.jpg',
    title: 'Gamma Premium',
    caption: '6-program memory chair with ceramic spittoon and square box unit.',
    category: 'Dental Chairs',
    href: '/products/gamma-premium',
  },
  {
    id: 'gamma',
    src: '/products/gamma.jpg',
    title: 'Gamma',
    caption: 'The workhorse of high-volume practices, hanging-cord delivery.',
    category: 'Dental Chairs',
    href: '/products/gamma',
  },
  {
    id: 'beta',
    src: '/products/beta.jpg',
    title: 'Beta',
    caption: 'Compact footprint for rooms where every centimetre counts.',
    category: 'Dental Chairs',
    href: '/products/beta',
  },
  {
    id: 'alpha',
    src: '/products/alpha.jpg',
    title: 'Alpha',
    caption: 'Entry-level chair built on the same service-backed platform.',
    category: 'Dental Chairs',
    href: '/products/alpha',
  },
  {
    id: 'x-ray-units',
    src: '/products/x-ray-units.jpg',
    title: 'X-Ray Units',
    caption: 'Wall-mounted radiography, installed to AERB clearances.',
    category: 'Equipment',
    href: '/products/x-ray-units',
  },
  {
    id: 'scaler',
    src: '/products/scaler.jpg',
    title: 'Ultrasonic Scalers',
    caption: 'Optic and non-optic scalers, integrated or standalone.',
    category: 'Equipment',
    href: '/products/scalers',
  },
  {
    id: 'micromotor',
    src: '/products/micromotor.jpg',
    title: 'Dental Micromotors',
    caption: 'Brushless micromotors set up and torque-checked on handover.',
    category: 'Equipment',
    href: '/products/micromotors',
  },
  {
    id: 'curing-light',
    src: '/products/curing-light.jpg',
    title: 'LED Curing Lights',
    caption: 'Output verified with a radiometer at installation.',
    category: 'Equipment',
    href: '/products/led-curing-lights',
  },
  {
    id: 'handpiece',
    src: '/products/handpiece.jpg',
    title: 'Handpieces & Accessories',
    caption: 'Airotors, contra-angles and the spares we hold in stock.',
    category: 'Equipment',
    href: '/products/accessories',
  },
  {
    id: 'autoclaves',
    src: '/products/autoclaves.jpg',
    title: 'Autoclaves & Sterilization',
    caption: 'Class B autoclaves commissioned with a validation cycle.',
    category: 'Utility & Sterilization',
    href: '/products/autoclaves',
  },
  {
    id: 'uv-cabinet',
    src: '/products/uv-cabinet.jpg',
    title: 'UV Storage Cabinets',
    caption: 'Instrument storage that keeps a sterile tray sterile.',
    category: 'Utility & Sterilization',
    href: '/products',
  },
  {
    id: 'compressor',
    src: '/products/compressor.jpg',
    title: 'Oil-Free Compressors',
    caption: 'Sited away from patient areas, piped to every chair.',
    category: 'Utility & Sterilization',
    href: '/products/compressors',
  },
  {
    id: 'stools',
    src: '/products/stools.jpg',
    title: 'Ergonomic Stools',
    caption: 'Operator and assistant seating set to working height.',
    category: 'Utility & Sterilization',
    href: '/products/dental-stools',
  },
];
