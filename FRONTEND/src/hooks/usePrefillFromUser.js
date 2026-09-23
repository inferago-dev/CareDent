import { useState } from 'react';

/**
 * Fills a form with the signed-in customer's details, once, when they arrive.
 *
 * Every public form did this in an effect: `useEffect(() => setForm(...), [user])`.
 * That works, but it renders the empty form first and then immediately renders
 * it again filled - a cascading render React warns about, and the reason these
 * four files accounted for every remaining lint error in the app.
 *
 * Adjusting state during render instead is the pattern React documents for
 * exactly this case ("adjusting state when a prop changes"): React discards the
 * in-progress render and re-runs the component before committing anything, so
 * the browser only ever paints the filled form.
 *
 *   usePrefillFromUser(user, (u) => setForm((f) => ({
 *     ...f,
 *     name: f.name || u.name || '',
 *   })));
 *
 * `apply` must leave fields the visitor has already typed in alone - hence the
 * `f.name ||` guard at every call site. It runs once per distinct user object,
 * so a re-render never overwrites their edits.
 */
export default function usePrefillFromUser(user, apply) {
  const [prefilledFor, setPrefilledFor] = useState(null);

  if (user && user !== prefilledFor) {
    setPrefilledFor(user);
    apply(user);
  }
}
