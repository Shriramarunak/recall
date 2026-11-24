import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { schedule, todayStr } from '../lib/srs';

/**
 * Study state — one localStorage key, versioned, shaped like a `/progress`
 * payload so syncing it to an account later is a POST, not a reshape.
 *
 * Per course: studied, flagged, lastTopicId, notes, difficulty, srs (card
 * scheduling). Global: activity (study-days for streaks/heatmap) and goals.
 */
const STORAGE_KEY = 'retrieval-lab:progress';
const EMPTY = { version: 2, courses: {}, activity: {}, goals: { weekly: 12 } };

const ProgressContext = createContext(null);

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.courses) return EMPTY;
    // Forward-migrate older payloads by filling in the new fields.
    return {
      version: 2,
      courses: parsed.courses,
      activity: parsed.activity || {},
      goals: parsed.goals || { weekly: 12 },
    };
  } catch {
    return EMPTY;
  }
}

export function ProgressProvider({ children }) {
  const [state, setState] = useState(read);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private mode or storage full: state stays in memory for the session */
    }
  }, [state]);

  return <ProgressContext.Provider value={{ state, setState }}>{children}</ProgressContext.Provider>;
}

/** Studied maps for every course, for path/roadmap views. One hook, no loops. */
export function useAllStudied() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useAllStudied needs a <ProgressProvider> above it');
  const { state } = context;
  return useMemo(() => {
    const byCourse = {};
    const counts = {};
    for (const id in state.courses) {
      const studied = state.courses[id].studied || {};
      byCourse[id] = studied;
      counts[id] = Object.keys(studied).length;
    }
    return { byCourse, counts };
  }, [state]);
}

const SLICE_DEFAULTS = {
  studied: {},
  flagged: {},
  lastTopicId: null,
  notes: {},
  difficulty: {},
  srs: {},
};

// Merge defaults over any stored slice so migrated v1 data (which lacks the
// newer fields) always has every key present.
const courseSlice = (state, courseId) => ({ ...SLICE_DEFAULTS, ...(state.courses[courseId] || {}) });

/** Mark today as a study-day (idempotent per day, counts sessions). */
function withActivity(state) {
  const key = todayStr();
  return { ...state, activity: { ...state.activity, [key]: (state.activity[key] || 0) + 1 } };
}

export function useProgress(courseId) {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress needs a <ProgressProvider> above it');
  const { state, setState } = context;

  const slice = useMemo(() => courseSlice(state, courseId), [state, courseId]);

  const patch = useCallback(
    (updater, { activity = false } = {}) =>
      setState((current) => {
        const next = updater(courseSlice(current, courseId));
        const merged = { ...current, courses: { ...current.courses, [courseId]: next } };
        return activity ? withActivity(merged) : merged;
      }),
    [courseId, setState],
  );

  const toggleStudied = useCallback(
    (topicId) =>
      patch(
        (current) => {
          const studied = { ...current.studied };
          const wasStudied = Boolean(studied[topicId]);
          if (wasStudied) delete studied[topicId];
          else studied[topicId] = new Date().toISOString();
          return { ...current, studied };
        },
        // Only count activity when marking (not un-marking).
        { activity: !slice.studied[topicId] },
      ),
    [patch, slice.studied],
  );

  const toggleFlagged = useCallback(
    (topicId) =>
      patch((current) => {
        const flagged = { ...current.flagged };
        if (flagged[topicId]) delete flagged[topicId];
        else flagged[topicId] = true;
        return { ...current, flagged };
      }),
    [patch],
  );

  const markVisited = useCallback(
    (topicId) =>
      patch((current) => (current.lastTopicId === topicId ? current : { ...current, lastTopicId: topicId })),
    [patch],
  );

  const setNote = useCallback(
    (topicId, text) =>
      patch((current) => {
        const notes = { ...current.notes };
        if (text && text.trim()) notes[topicId] = text;
        else delete notes[topicId];
        return { ...current, notes };
      }),
    [patch],
  );

  const setDifficulty = useCallback(
    (topicId, level) =>
      patch((current) => {
        const difficulty = { ...current.difficulty };
        if (difficulty[topicId] === level || !level) delete difficulty[topicId];
        else difficulty[topicId] = level;
        return { ...current, difficulty };
      }),
    [patch],
  );

  const reviewCard = useCallback(
    (cardId, gradeQ) =>
      patch(
        (current) => {
          const srs = { ...current.srs };
          srs[cardId] = schedule(srs[cardId], gradeQ);
          return { ...current, srs };
        },
        { activity: true },
      ),
    [patch],
  );

  const recordActivity = useCallback(() => setState((current) => withActivity(current)), [setState]);

  const setWeeklyGoal = useCallback(
    (weekly) => setState((current) => ({ ...current, goals: { ...current.goals, weekly } })),
    [setState],
  );

  const reset = useCallback(
    () =>
      patch(() => ({ studied: {}, flagged: {}, lastTopicId: null, notes: {}, difficulty: {}, srs: {} })),
    [patch],
  );

  // Backup / restore the whole payload — the frontend's stand-in for sync.
  const exportData = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const importData = useCallback(
    (raw) => {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.courses) {
        throw new Error('That file is not a Recall backup.');
      }
      setState({
        version: 2,
        courses: parsed.courses,
        activity: parsed.activity || {},
        goals: parsed.goals || { weekly: 12 },
      });
    },
    [setState],
  );

  return {
    studied: slice.studied,
    flagged: slice.flagged,
    notes: slice.notes,
    difficulty: slice.difficulty,
    srs: slice.srs,
    lastTopicId: slice.lastTopicId,
    activity: state.activity,
    goals: state.goals,
    studiedCount: Object.keys(slice.studied).length,
    isStudied: (topicId) => Boolean(slice.studied[topicId]),
    isFlagged: (topicId) => Boolean(slice.flagged[topicId]),
    getNote: (topicId) => slice.notes[topicId] || '',
    getDifficulty: (topicId) => slice.difficulty[topicId] || null,
    toggleStudied,
    toggleFlagged,
    markVisited,
    setNote,
    setDifficulty,
    reviewCard,
    recordActivity,
    setWeeklyGoal,
    reset,
    exportData,
    importData,
  };
}
