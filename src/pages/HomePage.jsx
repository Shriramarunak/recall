import { Link } from 'react-router-dom';
import QueryPath from '../components/QueryPath';
import HeroImage from '../components/HeroImage';
import IndexTicks from '../components/IndexTicks';
import Icon from '../components/Icon';
import CourseCard from '../components/CourseCard';
import { DEFAULT_COURSE_ID } from '../api/client';
import { useCourse, useCatalog } from '../hooks/useCourse';
import { useProgress } from '../hooks/useProgress';
import { buildFlashcards, findTopic, formatDuration, totalMinutes } from '../lib/course';

const featuresFor = (course, cardCount) => [
  { label: course.topics.length + ' lessons', note: 'Written answers, not slides' },
  { label: course.modules.length + ' tracks', note: 'RAG through agent harnesses' },
  { label: cardCount + ' cards', note: 'Every follow-up question included' },
  { label: 'Offline first', note: 'Progress stays on your device' },
];

const MODES = [
  {
    id: 'read',
    icon: 'book',
    name: 'Read a lesson',
    body: 'Concept, a worked example, the answer you would say out loud, the steps, and the tradeoffs an interviewer will push on.',
    action: 'Open the course',
    href: '/course/' + DEFAULT_COURSE_ID,
  },
  {
    id: 'recall',
    icon: 'cards',
    name: 'Drill flashcards',
    body: 'Spaced-repetition cards from every lesson and follow-up. The scheduler brings back what you nearly forgot.',
    action: 'Start a drill',
    href: '/course/' + DEFAULT_COURSE_ID + '/flashcards',
  },
  {
    id: 'quiz',
    icon: 'target',
    name: 'Take a quiz',
    body: 'Ten multiple-choice questions pulled from the follow-ups, scored instantly, with misses linked back to the lesson.',
    action: 'Start a quiz',
    href: '/course/' + DEFAULT_COURSE_ID + '/quiz',
  },
  {
    id: 'mock',
    icon: 'mic',
    name: 'Run a mock round',
    body: 'A random question with no notes, a 90-second timer, and a rubric to score yourself against before you reveal the answer.',
    action: 'Take a round',
    href: '/course/' + DEFAULT_COURSE_ID + '/interview',
  },
];

export default function HomePage() {
  const { status, course } = useCourse(DEFAULT_COURSE_ID);
  const progress = useProgress(DEFAULT_COURSE_ID);
  const catalog = useCatalog();

  if (status !== 'ready') return <div className="shell page-pad">Loading…</div>;

  const resumeTopic = progress.lastTopicId ? findTopic(course, progress.lastTopicId) : null;
  const firstTopic = course.topics[0];
  const features = featuresFor(course, buildFlashcards(course).length);

  return (
    <>
      <section className="hero">
        <div className="shell hero__inner">
          <div className="hero__copy">
            <h1 className="hero__title">
              Study the stack behind every <span className="hero__title-accent">AI answer.</span>
            </h1>
            <p className="hero__lede">
              An interview-prep course for engineers who build with LLMs. {course.topics.length} lessons
              cover retrieval, transformers, fine-tuning, evals, red teaming and agents. Each one ends
              with the answer you would give in the room.
            </p>
            <div className="hero__actions">
              <Link
                className="btn btn--primary"
                to={'/course/' + course.id + '/topic/' + (resumeTopic ? resumeTopic.id : firstTopic.id)}
              >
                {resumeTopic ? 'Resume ' + resumeTopic.title : 'Start with lesson 01'}{' '}
                <Icon name="arrow-right" size={17} />
              </Link>
              <Link className="btn btn--ghost" to={'/course/' + course.id}>
                See the syllabus
              </Link>
            </div>
            <p className="hero__trust mono">
              {course.modules.length} tracks · {formatDuration(totalMinutes(course.topics))} of reading ·
              updated {course.updatedAt}
            </p>
          </div>

          <div className="hero__visual">
            <HeroImage />
          </div>
        </div>

        <div className="shell">
          <ul className="features">
            {features.map((feature) => (
              <li key={feature.label} className="features__item">
                <span className="features__label">{feature.label}</span>
                <span className="features__note">{feature.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="shell section">
        <div className="progress-panel card">
          <div className="progress-panel__head">
            <div>
              <span className="mono progress-panel__kicker">Your index</span>
              <h2 className="progress-panel__title">
                {progress.studiedCount} of {course.topics.length} lessons marked studied
              </h2>
              <p className="progress-panel__note">
                One tick per lesson, in course order. Click any tick to jump straight to it.
              </p>
            </div>
            <div className="progress-panel__actions">
              <Link className="btn btn--outline btn--sm" to={'/course/' + course.id}>
                Course map
              </Link>
              {progress.studiedCount > 0 && (
                <button type="button" className="btn btn--outline btn--sm" onClick={progress.reset}>
                  Reset progress
                </button>
              )}
            </div>
          </div>
          <IndexTicks course={course} progress={progress} />
        </div>
      </section>

      <section className="shell section">
        <header className="section__head">
          <span className="mono section__kicker">Three ways to study</span>
          <h2 className="section__title">Read it, recall it, then say it under pressure.</h2>
        </header>
        <div className="modes">
          {MODES.map((mode) => (
            <article key={mode.id} className="mode card">
              <span className="mode__icon" aria-hidden="true">
                <Icon name={mode.icon} size={22} />
              </span>
              <h3 className="mode__name">{mode.name}</h3>
              <p className="mode__body">{mode.body}</p>
              <Link className="mode__action" to={mode.href}>
                {mode.action} <Icon name="arrow-right" size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="shell section">
        <div className="pipeline">
          <div className="pipeline__copy">
            <span className="mono section__kicker">What you will be able to explain</span>
            <h2 className="section__title">The path from a question to a cited answer.</h2>
            <p className="pipeline__body">
              Every lesson maps to a stage in a real retrieval pipeline: how evidence is found,
              fused, ranked, trimmed to the context budget, and turned into an answer the model can
              defend. You learn each stage and the tradeoff an interviewer will press on.
            </p>
            <Link className="btn btn--outline" to={'/course/' + course.id + '/topic/' + firstTopic.id}>
              Start with the fundamentals <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          <div className="pipeline__visual">
            <QueryPath />
          </div>
        </div>
      </section>

      <section className="shell section">
        <header className="section__head">
          <span className="mono section__kicker">{catalog.length} courses</span>
          <h2 className="section__title">Pick a course and start studying.</h2>
        </header>
        <div className="catalog__grid">
          {catalog.map((c, i) => (
            <CourseCard key={c.id} course={c} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
