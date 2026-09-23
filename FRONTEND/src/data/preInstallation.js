/**
 * Pre-installation site requirements.
 *
 * This is the checklist our engineers walk a clinic through before an
 * installation date is confirmed. It is rendered on /services/pre-installation,
 * summarised on each product page, and exported to the downloadable PDF
 * (see src/lib/preInstallationPdf.js) - so all three stay in sync from here.
 */

export const PRE_INSTALL_SECTIONS = [
  {
    id: 'measurements',
    title: 'Site Measurements',
    iconName: 'Ruler',
    summary: 'Everything we need to confirm the unit fits the room - and can be carried into it.',
    items: [
      'Room length × width',
      'Ceiling height',
      'Door width and height',
      'Equipment installation area',
      'Required clearance around equipment',
      'Access path for bringing equipment inside',
      'Lift / staircase dimensions if applicable',
    ],
  },
  {
    id: 'electrical',
    title: 'Electrical Requirements',
    iconName: 'Zap',
    summary: 'Power has to be in place and terminated before the engineer arrives.',
    items: [
      'Power supply requirements',
      'Voltage and phase requirements',
      'Dedicated electrical points',
      'Earthing requirements',
      'MCB / isolator requirements',
      'UPS / stabilizer requirements where applicable',
      'Position of electrical points',
    ],
  },
  {
    id: 'plumbing',
    title: 'Plumbing & Drainage',
    iconName: 'Droplets',
    summary: 'Water in, waste out - both terminated at the positions marked on the layout.',
    items: [
      'Water inlet location',
      'Water supply size',
      'Drain outlet location',
      'Drain pipe size',
      'Drainage slope',
      'Wastewater connection',
      'Air / water line requirements where applicable',
    ],
  },
  {
    id: 'air',
    title: 'Compressed Air & Suction',
    iconName: 'Wind',
    summary: 'The utility lines that decide whether the chair actually performs on day one.',
    items: [
      'Compressor requirements',
      'Air pressure requirements',
      'Air outlet location',
      'Suction / vacuum requirements',
      'Suction outlet location',
      'Required pipe routing',
    ],
  },
  {
    id: 'placement',
    title: 'Equipment Placement',
    iconName: 'LayoutGrid',
    summary: 'Where the unit sits, and how much room is left to work around it.',
    items: [
      'Equipment dimensions',
      'Installation footprint',
      'Minimum operating clearance',
      'Chair / unit positioning',
      'Operator and assistant working space',
      'Patient access',
      'Equipment access for maintenance',
    ],
  },
  {
    id: 'structural',
    title: 'Structural Requirements',
    iconName: 'Building2',
    summary: 'Floors, walls and ceilings have to be finished and able to take the load.',
    items: [
      'Floor condition',
      'Floor level / strength where required',
      'Wall mounting requirements',
      'Ceiling mounting requirements',
      'Equipment anchoring requirements',
    ],
  },
  {
    id: 'environment',
    title: 'Ventilation & Environment',
    iconName: 'Thermometer',
    summary: 'Conditions that protect electronics, upholstery and compressor life.',
    items: [
      'Room ventilation',
      'Temperature requirements where applicable',
      'Humidity requirements where applicable',
      'Dust / moisture considerations',
      'Adequate lighting',
    ],
  },
  {
    id: 'vastu',
    title: 'Optional Layout & Vastu Consultation',
    iconName: 'Compass',
    optional: true,
    summary:
      'Not an engineering requirement - but if your layout follows Vastu, tell us early and we will plan the utility positions around it at no extra cost.',
    items: [
      'Preferred equipment orientation',
      'Room entrance position',
      'Chair / unit direction',
      'Utility positioning',
    ],
  },
  {
    id: 'access',
    title: 'Installation Access',
    iconName: 'Truck',
    summary: 'What has to be true on the morning of the installation date.',
    items: [
      'Site must be accessible on the installation date',
      'Equipment delivery route must be clear',
      'Lift / access arrangements',
      'Room should be ready before installation',
      'Required civil, electrical and plumbing work completed beforehand',
    ],
  },
];

/** The tick-box list a clinic signs off before we lock an installation date. */
export const SITE_READINESS_CHECKLIST = [
  'Room measurements provided',
  'Electrical points completed',
  'Proper earthing available',
  'Water connection completed',
  'Drainage completed',
  'Air / suction lines completed',
  'Flooring and wall work completed',
  'Equipment access confirmed',
  'Installation area cleared',
  'Site ready for installation',
];

/**
 * The short, product-specific version shown under the spec table on a product
 * page. Keyed by product category; `default` covers anything unmapped.
 */
export const EQUIPMENT_REQUIREMENTS = {
  'Dental Chairs': [
    'Minimum 2.4 m × 3.0 m clear floor area per chair, 2.6 m ceiling height',
    'Dedicated 15 A point with proper earthing (< 5 Ω) within 1.5 m of the base',
    '½" water inlet and 1½" drain outlet terminated at the marked chair position',
    'Compressed air line at 4-6 bar and a suction line routed to the unit',
    'Level, finished flooring able to take a 180 kg point load',
    'Door clearance of at least 900 mm along the full delivery route',
  ],
  Radiology: [
    'Lead-lined or shielded room as per AERB requirements, with approval in hand',
    'Dedicated stabilised power point with earthing at the exposure position',
    'Wall able to carry the arm load; anchoring points confirmed before drilling',
    'Operator standing position at least 2 m from the tube head, or behind a barrier',
  ],
  Sterilization: [
    'Dedicated 16 A point with earthing, on its own MCB',
    'Softened / distilled water supply and a drain within reach of the unit',
    'Bench depth of at least 600 mm with 100 mm rear clearance for venting',
    'Ventilated area - not enclosed inside a sealed cabinet',
  ],
  Utility: [
    'Ventilated, dry location away from patient areas (compressors are noisy)',
    'Dedicated power point with earthing, sized to the motor rating',
    'Piping route to each chair planned and laid before installation',
    'Clearance on all sides for filter changes and drain-down',
  ],
  default: [
    'Finished, level floor and completed civil work in the installation area',
    'Dedicated power point with proper earthing at the equipment position',
    'Water, drain, air and suction lines terminated where required',
    'Clear delivery access from the street to the room',
  ],
};

export const requirementsFor = (product) =>
  EQUIPMENT_REQUIREMENTS[product?.category] ||
  (product?.kind === 'chair' ? EQUIPMENT_REQUIREMENTS['Dental Chairs'] : EQUIPMENT_REQUIREMENTS.default);

/** The four steps we promise on the pre-installation page. */
export const ASSESSMENT_STEPS = [
  {
    title: 'Share your site',
    description: 'Send room dimensions and a floor plan or a few photos through the form below.',
  },
  {
    title: 'Engineer reviews',
    description: 'We check the layout against the equipment footprint and utility positions.',
  },
  {
    title: 'Site visit or call',
    description: 'A marked-up layout, with electrical, water, drain, air and suction positions.',
  },
  {
    title: 'Sign-off & schedule',
    description: 'Once the readiness checklist is ticked, we confirm the installation date.',
  },
];
