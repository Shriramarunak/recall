import { Link, useParams } from 'react-router-dom';
import IndexTicks from '../components/IndexTicks';
import Icon from '../components/Icon';
import BackLink from '../components/BackLink';
import { useCourse } from '../hooks/useCourse';
import { useProgress } from '../hooks/useProgress';
import { findTopic, formatDuration, topicsByModule, totalMinutes } from '../lib/course';

export default function CoursePage() {
  const { courseId } = useParams();
  const { status, course } = useCourse(courseId);
  const progress = useProgress(courseId);

  if (status === 'loading') return <div className="shell page-pad">Loading the syllabus…</div>;
  if (status === 'error') return <div className="shell page-pad">That course does not exist.</div>;

  const modules = topicsByModule(course);
  const resumeTopic = progress.lastTopicId ? findTopic(course, progress.lastTopicId) : null;
  const flagged = course.topics.filter((topic) => progress.isFlagged(topic.id));

  return (
    <>
      <section className="course-head">
        <div className="shell course-head__inner">
          <BackLink to="/" label="Home" tone="dark" />
          <span className="mono course-head__kicker">Syllabus · {course.level}</span>
          <h1 className="course-head__title">{course.title}</h1>
          <p className="course-head__lede">{course.subtitle}</p>
          <dl className="stats">
            <div className="stats__item">
              <dt className="mono">Lessons</dt>
              <dd>{course.topics.length}</dd>
            </div>
            <div className="stats__item">
              <dt className="mono">Tracks</dt>
              <dd>{modules.length}</dd>
            </div>
            <div className="stats__item">
              <dt className="mono">Reading</dt>
              <dd>{formatDuration(totalMinutes(course.topics))}</dd>
            </div>
            <div className="stats__item">
              <dt className="mono">Studied</dt>
              <dd>
                {progress.studiedCount}
                <span className="stats__of">/{course.topics.length}</span>
              </dd>
            </div>
          </dl>
          <div className="course-head__actions">
            <Link
              className="btn btn--primary"
              to={
                '/course/' + course.id + '/topic/' + (resumeTopic ? resumeTopic.id : course.topics[0].id)
              }
            >
              {resumeTopic ? 'Resume ' + resumeTopic.title : 'Start lesson 01'}{' '}
              <Icon name="arrow-right" size={17} />
            </Link>
            <Link className="btn btn--ghost" to={'/course/' + course.id + '/flashcards'}>
              Flashcards
            </Link>
            <Link className="btn btn--ghost" to={'/course/' + course.id + '/quiz'}>
              Quiz
            </Link>
            <Link className="btn btn--ghost" to={'/course/' + course.id + '/interview'}>
              Mock interview
            </Link>
            <Link className="btn btn--ghost" to={'/course/' + course.id + '/dashboard'}>
              Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="shell section">
        <div className="progress-panel card">
          <div className="progress-panel__head">
            <div>
              <span className="mono progress-panel__kicker">Your index</span>
              <h2 className="progress-panel__title">Every lesson, in order</h2>
              <p className="progress-panel__note">
                Filled ticks are studied. An orange ring means you flagged it to revisit.
              </p>
            </div>
          </div>
          <IndexTicks course={course} progress={progress} />
        </div>
      </section>

      {flagged.length > 0 && (
        <section className="shell section">
          <header className="section__head">
            <span className="mono section__kicker">{flagged.length} flagged</span>
            <h2 className="section__title">Come back to these.</h2>
          </header>
          <ul className="flagged">
            {flagged.map((topic) => (
              <li key={topic.id}>
                <Link className="flagged__item card" to={'/course/' + course.id + '/topic/' + topic.id}>
                  <span className="mono">{String(topic.order).padStart(2, '0')}</span>
                  <strong>{topic.title}</strong>
                  <span className="flagged__minutes mono">{topic.minutes} min</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="shell section">
        <header className="section__head">
          <span className="mono section__kicker">Tracks</span>
          <h2 className="section__title">What you cover, track by track.</h2>
        </header>

        <div className="syllabus">
          {modules.map((module) => {
            const done = module.topics.filter((topic) => progress.isStudied(topic.id)).length;
            return (
              <section key={module.id} className="module card">
                <header className="module__head">
                  <span className="mono module__num">{String(module.order).padStart(2, '0')}</span>
                  <div>
                    <h3 className="module__title">{module.title}</h3>
                    <p className="module__note">{module.note}</p>
                  </div>
                  <span className="mono module__count">
                    {done}/{module.topics.length}
                  </span>
                </header>
                <ul className="module__list">
                  {module.topics.map((topic) => (
                    <li key={topic.id}>
                      <Link
                        className={
                          'lesson' + (progress.isStudied(topic.id) ? ' is-studied' : '')
                        }
                        to={'/course/' + course.id + '/topic/' + topic.id}
                      >
                        <span className="mono lesson__num">{String(topic.order).padStart(2, '0')}</span>
                        <span className="lesson__title">{topic.title}</span>
                        <span className="mono lesson__minutes">{topic.minutes} min</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>
    </>
  );
}
