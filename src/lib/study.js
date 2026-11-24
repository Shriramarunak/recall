/** Streaks, activity heatmap and goal helpers over the activity map. */
import { todayStr, addDays, daysBetween } from './srs';

/** Current consecutive-day streak ending today (or yesterday, still alive). */
export function currentStreak(activity, today = todayStr()) {
  if (!activity) return 0;
  // If nothing today, the streak can still be alive if yesterday was studied.
  let cursor = activity[today] ? today : addDays(today, -1);
  if (!activity[cursor]) return 0;
  let streak = 0;
  while (activity[cursor]) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(activity) {
  const days = Object.keys(activity || {})
    .filter((d) => activity[d])
    .sort();
  let best = 0;
  let run = 0;
  let prev = null;
  days.forEach((d) => {
    run = prev && daysBetween(prev, d) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  });
  return best;
}

/** How many study-days fell in the last 7 days (incl. today). */
export function studiedThisWeek(activity, today = todayStr()) {
  let count = 0;
  for (let i = 0; i < 7; i++) {
    if (activity && activity[addDays(today, -i)]) count += 1;
  }
  return count;
}

/** A weeks × 7 grid of {date, count} ending today, for a heatmap. */
export function heatmapWeeks(activity, weeks = 18, today = todayStr()) {
  // Walk back to the start of the grid (align so today sits in the last column).
  const todayDow = new Date(today + 'T00:00:00').getDay(); // 0 = Sun
  const start = addDays(today, -((weeks - 1) * 7 + todayDow));
  const grid = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      col.push({ date, count: (activity && activity[date]) || 0, future: date > today });
    }
    grid.push(col);
  }
  return grid;
}
