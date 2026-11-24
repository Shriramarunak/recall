/** Pure helpers over a course document. No data imports, no React. */

export function topicsByModule(course) {
  return course.modules.map((module) => ({
    ...module,
    topics: course.topics.filter((topic) => topic.moduleId === module.id),
  }));
}

export function findTopic(course, topicId) {
  return course.topics.find((topic) => topic.id === topicId) || null;
}

export function findModule(course, moduleId) {
  return course.modules.find((module) => module.id === moduleId) || null;
}

/** Previous / next in reading order, so the reader can move linearly. */
export function neighbours(course, topicId) {
  const index = course.topics.findIndex((topic) => topic.id === topicId);
  return {
    index,
    previous: index > 0 ? course.topics[index - 1] : null,
    next: index > -1 && index < course.topics.length - 1 ? course.topics[index + 1] : null,
  };
}

export function searchTopics(course, query) {
  const q = query.trim().toLowerCase();
  if (!q) return course.topics;
  return course.topics.filter((topic) =>
    (topic.title + ' ' + topic.concept + ' ' + topic.interviewAnswer).toLowerCase().includes(q),
  );
}

/**
 * Some lesson titles are already questions ("Why RAG?"); the rest need framing.
 */
export function coreQuestion(topic) {
  return topic.title.trim().endsWith('?')
    ? topic.title
    : 'Explain ' + topic.title + ' to an interviewer.';
}

/** The same question with the tradeoff follow-up an interviewer always adds. */
export function mockPrompt(topic) {
  return topic.title.trim().endsWith('?')
    ? topic.title + ' Name a production tradeoff as well.'
    : 'Explain ' + topic.title + ' — and name a production tradeoff.';
}

/**
 * One card per interview prompt: the "explain this" card for each topic plus
 * every follow-up question, which is how these get asked in a real loop.
 */
export function buildFlashcards(course, topics = course.topics) {
  const cards = [];
  topics.forEach((topic) => {
    cards.push({
      id: topic.id + '::main',
      topicId: topic.id,
      topicTitle: topic.title,
      moduleId: topic.moduleId,
      kind: 'core',
      question: coreQuestion(topic),
      answer: topic.interviewAnswer,
    });
    topic.followUps.forEach((followUp, i) => {
      cards.push({
        id: topic.id + '::follow-' + i,
        topicId: topic.id,
        topicTitle: topic.title,
        moduleId: topic.moduleId,
        kind: 'follow-up',
        question: followUp.question,
        answer: followUp.answer,
      });
    });
  });
  return cards;
}

export function totalMinutes(topics) {
  return topics.reduce((sum, topic) => sum + topic.minutes, 0);
}

export function formatDuration(minutes) {
  if (minutes < 60) return minutes + ' min';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? hours + ' hr ' + rest + ' min' : hours + ' hr';
}
