/**
 * Guides published at /guides.
 *
 * Stored as structured blocks rather than markdown so no parser dependency is
 * needed and the renderer stays predictable. Block types: 'p', 'h2', 'list',
 * 'note', 'table'.
 *
 * To add a guide: append an entry here. The route, the sitemap and the Article
 * structured data all pick it up automatically — nothing else to wire.
 */

export const ARTICLES = [
  {
    slug: 'how-to-choose-a-dental-chair',
    title: 'How to choose a dental chair: what actually matters',
    summary:
      'Nine things worth checking before you commit to a dental chair — and the specifications that sound important but rarely change your working day.',
    readingMinutes: 7,
    publishedAt: '2026-08-25',
    category: 'Buying guide',
    body: [
      { type: 'p', text: 'A dental chair is the single largest piece of equipment in your surgery and the one you touch for every patient, every day, for the next decade. Most buying advice focuses on the feature list. In practice, the things that decide whether you are happy with a chair three years in are duller than that — and easier to check before you buy.' },

      { type: 'h2', text: '1. Delivery system: over-the-patient or side' },
      { type: 'p', text: 'An over-hanging (continental) delivery arm puts the instruments across the patient, within easy reach without turning. A side-delivery unit keeps them out of the patient\'s eyeline, which anxious patients notice. Neither is better in the abstract — it depends on whether you work four-handed and how your assistant is positioned. Sit in both before deciding.' },

      { type: 'h2', text: '2. Legroom under the backrest' },
      { type: 'p', text: 'This is the specification people regret ignoring. If the chair base is bulky, you spend the day working with your knees turned out and your back compensating. Ask to sit at the head of a fully reclined chair and see where your legs go.' },

      { type: 'h2', text: '3. Upholstery, and whether it survives disinfectant' },
      { type: 'p', text: 'Memory foam is more comfortable for long procedures and holds its shape. The more important question is what the covering does after two years of daily wipe-down with the disinfectant your clinic actually uses. Ask what the upholstery is rated for, and what a replacement set costs.' },

      { type: 'h2', text: '4. Programmable positions' },
      { type: 'p', text: 'Memory programmes save small amounts of time many times a day. Six programmes is generous; most dentists use two or three. What matters more is whether the return-to-zero position is a single button, because you use it after every patient.' },

      { type: 'h2', text: '5. The spittoon and its plumbing' },
      { type: 'p', text: 'A ceramic bowl cleans better and stains less than resin. A rotatable bowl matters if your room is tight. Check where the drain runs and at what fall — this is one of the most common causes of a slow, smelly bowl months later, and it is a plumbing problem, not a chair problem.' },

      { type: 'h2', text: '6. Suction: motorised, and silenced' },
      { type: 'p', text: 'Weak suction is the fault that most often stops a surgery for the day. Ask whether the system is motorised or venturi, whether it auto-drains and flushes, and how loud it is in a small room. Then ask what the service interval is.' },

      { type: 'h2', text: '7. Light quality, not just lux' },
      { type: 'p', text: 'A high lux figure means little on its own. What matters is a shadow-free field at working distance, a colour temperature that lets you match shades honestly, and a sensor that lets you adjust it without touching it with a gloved hand.' },

      { type: 'h2', text: '8. What happens when it breaks' },
      { type: 'p', text: 'Every chair fails eventually. The questions that decide your downtime are: who repairs it, are they employed by the supplier or subcontracted, and is the part on a shelf in your city or on order from another state? Ask for the name of the engineer who would come. A supplier who cannot answer that is telling you something.' },

      { type: 'h2', text: '9. Whether your room can take it' },
      { type: 'p', text: 'The best chair for your practice is worthless if the crate does not fit up your stairwell, your supply cannot hold the load, or the drain runs the wrong way. Check the room against the specific unit before you sign anything — not after it is delivered.' },
      { type: 'note', text: 'Care Dent does this as a free site assessment: measurements, access, power and earthing, water, drainage, compressed air and suction, checked against the exact model you are considering.' },

      { type: 'h2', text: 'The specifications that matter less than you think' },
      { type: 'list', items: [
        'Headline lux figures, without a shadow-free field at working distance',
        'A long list of memory programmes you will never assign',
        'Touchscreen panels, which are one more thing to fail and hard to use gloved',
        'Colour options, which are worth exactly what they cost you in delivery time',
      ] },

      { type: 'h2', text: 'Before you sign' },
      { type: 'list', items: [
        'Sit in the chair, reclined, in the position you actually work in',
        'Ask what installation, commissioning and staff training cost — separately',
        'Ask what the three most commonly replaced parts are, and their price',
        'Ask how long a spare takes to arrive, and whether it is held locally',
        'Get the site checked before the order is placed, not after',
      ] },
    ],
  },

  {
    slug: 'dental-chair-maintenance-schedule',
    title: 'A maintenance schedule that prevents most breakdowns',
    summary:
      'Daily, weekly and monthly tasks your staff can do in minutes — and the annual checks that need an engineer. Most emergency call-outs trace back to a skipped item on this list.',
    readingMinutes: 6,
    publishedAt: '2026-08-25',
    category: 'Maintenance',
    body: [
      { type: 'p', text: 'Most breakdown calls are not sudden failures. They are small, ignorable problems that were left alone until they stopped the surgery. The good news is that the routine which prevents them is short, and most of it is not an engineer\'s job.' },

      { type: 'h2', text: 'Every day, at close' },
      { type: 'list', items: [
        'Flush the suction lines with the cleaning solution your supplier specifies — not plain water, and not bleach unless it is approved for your system',
        'Empty and rinse the solid filter trap. This one item causes more weak-suction calls than anything else',
        'Run water through the handpiece tubing for 20–30 seconds',
        'Wipe the upholstery with an approved disinfectant, not a solvent',
        'Drain the compressor tank of condensate',
      ] },
      { type: 'note', text: 'The compressor drain is the item most often skipped. Water sitting in the tank corrodes it from the inside and carries moisture into your lines — which is what eventually damages handpieces.' },

      { type: 'h2', text: 'Every week' },
      { type: 'list', items: [
        'Deep-clean the spittoon bowl and check the drain runs freely',
        'Lubricate handpieces according to the manufacturer\'s interval',
        'Check the air pressure gauge reads what it should at rest and under load',
        'Inspect tubing for kinks, chafing or perished sections at the flex points',
        'Test the autoclave with a chemical indicator, and record it',
      ] },

      { type: 'h2', text: 'Every month' },
      { type: 'list', items: [
        'Clean or replace the compressor air intake filter',
        'Check the suction motor for unusual noise or heat',
        'Test every chair function through its full range — all positions, all programmes',
        'Check the operating light for flicker and clean the reflector or lens',
        'Verify the foot control responds cleanly across its travel',
      ] },

      { type: 'h2', text: 'Every year, with an engineer' },
      { type: 'p', text: 'Some checks need instruments and a trained eye. An annual preventive visit should cover the hydraulic system and seals, motor lubrication, valve and solenoid condition, suction motor service, electrical safety and earthing, and light calibration. Autoclaves need validation, and X-ray equipment has its own radiation safety requirements.' },

      { type: 'h2', text: 'Warning signs worth a call before they become a breakdown' },
      { type: 'list', items: [
        'Suction that is weaker than last month, even slightly',
        'The chair pausing or hesitating before it moves',
        'A compressor that runs more often, or takes longer to build pressure',
        'Any new noise — bearings and pumps announce themselves well before they fail',
        'Water in the air lines, or moisture at the handpiece coupling',
      ] },
      { type: 'p', text: 'A fault caught at this stage is usually a part and an hour. The same fault left for three months is often a replacement and a lost day of patients.' },
    ],
  },

  {
    slug: 'dental-clinic-electrical-and-plumbing-requirements',
    title: 'What your building has to provide before a chair arrives',
    summary:
      'The power, earthing, water, drainage, compressed air and suction a dental surgery needs — and why discovering a gap on installation day is the most expensive way to find out.',
    readingMinutes: 6,
    publishedAt: '2026-08-25',
    category: 'Clinic setup',
    body: [
      { type: 'p', text: 'Installation day goes one of two ways. Either the room is ready and the unit is commissioned and handed over, or the engineers find a problem that belongs to your electrician or plumber, and everything stops while it is fixed. The difference is almost always something that could have been checked weeks earlier.' },

      { type: 'h2', text: 'Electrical' },
      { type: 'p', text: 'A dental chair needs a stable supply and, more importantly, a proper earth. Dedicated points matter: a chair sharing a circuit with an autoclave and a compressor will trip, usually at the worst moment. If your supply voltage swings — common in many areas — a stabiliser is not optional, and it needs to be sized for the load.' },
      { type: 'list', items: [
        'A dedicated point for the chair, not a shared extension',
        'A verified earth, tested rather than assumed',
        'Separate provision for compressor and autoclave loads',
        'A stabiliser where supply voltage is unstable',
        'Points positioned where the unit actually stands, before walls are closed',
      ] },

      { type: 'h2', text: 'Water and drainage' },
      { type: 'p', text: 'The chair needs a clean water inlet at usable pressure, and a waste line with enough fall to actually drain. Insufficient fall on the spittoon drain is one of the most common and most annoying post-installation problems: the bowl empties slowly, then starts to smell, and fixing it means opening up finished flooring.' },
      { type: 'list', items: [
        'Water inlet positioned for the unit, at adequate pressure',
        'Drain with proper fall — checked, not assumed',
        'Access to the drain run after the floor is finished',
        'Isolation valve so the chair can be shut off without shutting off the clinic',
      ] },

      { type: 'h2', text: 'Compressed air' },
      { type: 'p', text: 'Air must be dry and clean. Oil-free compressors avoid contaminating your lines, which is what damages handpieces over time. Size the compressor for the number of chairs you will have in three years, not the number you have on opening day — an undersized compressor runs constantly, wears fast and is the loudest object in your clinic.' },

      { type: 'h2', text: 'Suction' },
      { type: 'p', text: 'Suction lines need the right diameter and a fall towards the collection point. Where the motor sits matters too: it is noisy, so it belongs somewhere the noise does not reach the surgery or the waiting room, but still somewhere an engineer can reach it for service.' },

      { type: 'h2', text: 'Access — the one everybody forgets' },
      { type: 'p', text: 'A dental chair arrives in a crate. That crate has to get from the delivery vehicle to the room. Narrow stairwells, tight landings, lift dimensions and door widths have all stopped installations that were otherwise perfectly planned. Measure the route, not just the room.' },

      { type: 'h2', text: 'How to avoid finding out the hard way' },
      { type: 'p', text: 'Every item above can be checked before anything is ordered. Care Dent does this as a free site assessment — measurements, access, electrical, plumbing, air and suction, checked against the specific equipment you are buying — and gives your contractors a written list of what to prepare.' },
    ],
  },
];

export const findArticle = (slug) => ARTICLES.find((a) => a.slug === slug) || null;

/** Newest first. */
export const sortedArticles = () =>
  [...ARTICLES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
