/** Pure helpers for learning paths over the catalog and studied counts. */

/**
 * Resolve a path's course ids against the catalog and this browser's studied
 * counts into per-step and overall progress.
 *
 * @param path           a path record ({ courseIds, ... })
 * @param catalogById    { [courseId]: catalogCourse }
 * @param studiedCounts  { [courseId]: number studied }
 */
export function pathStats(path, catalogById, studiedCounts = {}) {
  const steps = path.courseIds
    .map((id) => catalogById[id])
    .filter(Boolean)
    .map((course) => {
      const done = studiedCounts[course.id] || 0;
      return { course, done, complete: course.topicCount > 0 && done >= course.topicCount };
    });

  const totalTopics = steps.reduce((sum, s) => sum + s.course.topicCount, 0);
  const studied = steps.reduce((sum, s) => sum + s.done, 0);
  const minutes = steps.reduce((sum, s) => sum + s.course.minutes, 0);
  const pct = totalTopics ? Math.round((studied / totalTopics) * 100) : 0;
  const currentIndex = steps.findIndex((s) => !s.complete);

  return { steps, totalTopics, studied, minutes, pct, currentIndex };
}

export function catalogMap(courses) {
  return courses.reduce((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});
}
