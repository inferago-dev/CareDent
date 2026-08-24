/**
 * Question-and-answer content for the pages that show an FAQ block.
 *
 * Shared rather than kept inside each page because scripts/prerender-meta.mjs
 * emits the matching FAQPage structured data into the static HTML. Google
 * requires marked-up answers to be visible on the page, so both must come from
 * this one list or they will drift apart.
 */
export const FAQS_BY_PATH = {
  '/dental-chair-service-chennai': [
  {
    q: 'Do you service equipment you did not sell?',
    a: 'Yes. We service dental chairs, compressors, autoclaves, X-ray units and handpieces regardless of where they were bought, including units from other suppliers.',
  },
  {
    q: 'How quickly can an engineer visit?',
    a: 'Log the request and an engineer calls you to confirm a slot. Working hours are Monday to Saturday, 9 AM to 7 PM. Urgent breakdowns are best raised by phone rather than the form.',
  },
  {
    q: 'Do you carry spares to the visit?',
    a: 'We hold common spares — tubing, valves, bearings, handpiece parts, suction components — in stock, so where the fault is clear from your description the part travels with the engineer and the repair finishes in one visit.',
  },
  {
    q: 'Do you work outside Chennai?',
    a: 'We are based in Mugalivakkam, Chennai and travel for installations and service visits. Tell us your location when you call and we will confirm what we can schedule.',
  },
  {
    q: 'Can you help over the phone before booking a visit?',
    a: 'Often, yes. Some faults are a setting, a tripped switch or a blocked line, and our technicians will talk you through the checks before anyone is charged for a visit.',
  },
  ],
  '/dental-clinic-setup': [
  {
    q: 'What is the first thing to decide when setting up a dental clinic?',
    a: 'The room. Chair choice, compressor size and suction all follow from how many surgeries the space can hold and what power, water, drainage and air the building can give you. Deciding equipment before checking the room is what causes expensive changes later.',
  },
  {
    q: 'How much space does one dental surgery need?',
    a: 'Enough for the chair with the backrest fully reclined, plus working room for the dentist and assistant to move around the patient, plus the delivery unit and spittoon. Care Dent measures your specific room against the specific unit as part of a free site assessment.',
  },
  {
    q: 'What electrical supply does a dental chair need?',
    a: 'A stable single-phase supply with a proper earth, and a dedicated point rather than a shared extension. Requirements vary by model, which is why the site assessment covers the electrical points, earthing and any stabiliser needed before delivery.',
  },
  {
    q: 'Should I buy all the equipment from one supplier?',
    a: 'Not necessarily, but one supplier who installs and services everything means one phone number when something fails, and no argument about whose part is at fault. Care Dent supplies, installs and services the full set.',
  },
  {
    q: 'How long does a clinic setup take?',
    a: 'The civil, electrical and plumbing work usually sets the timeline, not the equipment. Getting the site checked early is what keeps installation day short — the room is ready before anything is delivered.',
  },
  ],
};

export const faqsFor = (path) => FAQS_BY_PATH[path] || [];
