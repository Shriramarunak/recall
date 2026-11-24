/**
 * Spaced repetition — a compact SM-2 scheduler.
 *
 * Each reviewable card keeps { ease, interval, reps, lapses, due }. `due` is a
 * local YYYY-MM-DD date string so "due today" is a plain string comparison and
 * the whole thing serialises cleanly into the progress object.
 */

export const GRADES = [
  { id: 'again', label: 'Again', hint: '<1 day', q: 1, tone: 'again' },
  { id: 'hard', label: 'Hard', hint: 'shorter', q: 3, tone: 'hard' },
  { id: 'good', label: 'Good', hint: 'on track', q: 4, tone: 'good' },
  { id: 'easy', label: 'Easy', hint: 'longer', q: 5, tone: 'easy' },
];

export function todayStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return todayStr(d);
}

export function daysBetween(fromStr, toStr) {
  const a = new Date(fromStr + 'T00:00:00');
  const b = new Date(toStr + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

export function newCard() {
  return { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: todayStr() };
}

/** Apply a grade (q from GRADES) and return the next card state. */
export function schedule(card, q, today = todayStr()) {
  const prev = card || newCard();
  let { ease, interval, reps, lapses } = prev;

  if (q < 3) {
    // Lapse: reset the interval, nudge ease down, due again today.
    reps = 0;
    lapses += 1;
    interval = 0;
    ease = Math.max(1.3, ease - 0.2);
    return { ease, interval, reps, lapses, due: today };
  }

  reps += 1;
  if (reps === 1) interval = 1;
  else if (reps === 2) interval = q === 3 ? 4 : 6;
  else interval = Math.max(1, Math.round(interval * ease * (q === 3 ? 0.8 : 1)));

  // Standard SM-2 ease update, floored at 1.3.
  ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  return { ease, interval, reps, lapses, due: addDays(today, interval) };
}

export function isDue(card, today = todayStr()) {
  if (!card) return true; // never reviewed → due
  return card.due <= today;
}

/** Split a deck of cards into due / new / later buckets for a summary. */
export function summarise(cards, srs, today = todayStr()) {
  let due = 0;
  let fresh = 0;
  let later = 0;
  cards.forEach((card) => {
    const state = srs[card.id];
    if (!state) fresh += 1;
    else if (state.due <= today) due += 1;
    else later += 1;
  });
  return { due, fresh, later, total: cards.length };
}
