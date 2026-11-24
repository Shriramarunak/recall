import { Link, useParams } from 'react-router-dom';
import BackLink from '../components/BackLink';
import Icon from '../components/Icon';
import PathFlow from '../components/PathFlow';
import { useAllCourses, usePaths } from '../hooks/useCourse';
import { useAllStudied } from '../hooks/useProgress';
import { formatDuration, topicsByModule, totalMinutes } from '../lib/course';
import { catalogMap } from '../lib/paths';

export default function PathPage() {
  const { pathId } = useParams();
  const paths = usePaths();
  const courses = useAllCourses();
  const { byCourse, counts } = useAllStudied();

  const path = paths.find((p) => p.id === pathId);
  const coursesById = catalogMap(courses);

  if (paths.length === 0 || courses.length === 0) {
    return <div className="shell page-pad">Loading the path…</div>;
  }
  if (!path) {
    return (
      <div className="shell page-pad">
        <h1>Path not found</h1>
        <p>
          <Link to="/paths">Back to paths</Link>
        </p>
      </div>
    );
  }

  const steps = path.courseIds
    .map((id) => coursesById[id])
    .filter(Boolean)
    .map((course) => {
      const total = course.topics.length;
      const done = counts[course.id] || 0;
      // Full course docs carry per-topic minutes; the summary field is catalog-only.
      const minutes = totalMinutes(course.topics);
      return { course, total, done, minutes, complete: done >= total, modules: topicsByModule(course) };
    });

  const totalTopics = steps.reduce((s, x) => s + x.total, 0);
  const studied = steps.reduce((s, x) => s + Math.min(x.done, x.total), 0);
  const minutes = steps.reduce((s, x) => s + x.minutes, 0);
  const pct = totalTopics ? Math.round((studied / totalTopics) * 100) : 0;
  const currentIndex = steps.findIndex((s) => !s.complete);
  const current = currentIndex === -1 ? null : steps[currentIndex];

  return (
    <section className="shell page-pad path">
      <BackLink to="/paths" label="Paths" />

      <header className="path__head">
        <span className="mono section__kicker">Learning path</span>
        <h1 className="path__title">{path.title}</h1>
        <p className="path__goal">{path.goal}</p>

        <div className="path__bar" aria-hidden="true">
          <span style={{ width: pct + '%' }} />
        </div>
        <div className="path__stats mono">
          <span>{pct}% complete</span>
          <span>
            {studied} / {totalTopics} lessons
          </span>
          <span>{steps.length} courses</span>
          <span>{formatDuration(minutes)}</span>
        </div>

        {current && (
          <Link className="btn btn--primary" to={'/course/' + current.course.id}>
            {studied > 0 ? 'Continue with ' + current.course.title : 'Start ' + current.course.title}{' '}
            <Icon name="arrow-right" size={16} />
          </Link>
        )}
        {!current && <p className="path__done mono">Path complete. Every lesson studied.</p>}
      </header>

      <div className="path__hint mono">Click any course, track or lesson to open it.</div>
      <PathFlow steps={steps} byCourse={byCourse} currentIndex={currentIndex} />
    </section>
  );
}
