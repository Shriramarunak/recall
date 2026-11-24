/**
 * Content API.
 *
 * Every screen reads content through these functions and nothing else, so the
 * day the content moves to a server this file is the only one that changes:
 * replace the local imports with `fetch(API_BASE + '/courses/' + id)` and the
 * signatures stay identical.
 */
import catalog from '../data/catalog.json';
import paths from '../data/paths.json';
import genaiEngineering from '../data/courses/genai-engineering.json';
import mlFoundations from '../data/courses/ml-foundations.json';
import langchainLanggraph from '../data/courses/langchain-langgraph.json';
import cloudAi from '../data/courses/cloud-ai.json';

const COURSES = {
  'genai-engineering': genaiEngineering,
  'ml-foundations': mlFoundations,
  'langchain-langgraph': langchainLanggraph,
  'cloud-ai': cloudAi,
};

/** Keeps call sites honest: they must handle a pending state from day one. */
const resolve = (value) => Promise.resolve(value);

export function fetchCatalog() {
  return resolve(catalog.courses);
}

export function fetchCourse(courseId) {
  const course = COURSES[courseId];
  if (!course) {
    return Promise.reject(new Error('No course with id "' + courseId + '"'));
  }
  return resolve(course);
}

/** Every course document, for global search and roadmaps. */
export function fetchAllCourses() {
  return resolve(Object.values(COURSES));
}

export function fetchPaths() {
  return resolve(paths.paths);
}

export const DEFAULT_COURSE_ID = catalog.courses[0].id;
