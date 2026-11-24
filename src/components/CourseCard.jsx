import { Link } from 'react-router-dom';
import Icon from './Icon';
import { useProgress } from '../hooks/useProgress';
import { formatDuration } from '../lib/course';

/** A catalog tile for one course, with this browser's progress on it. */
export default function CourseCard({ course, index = 0 }) {
  const progress = useProgress(course.id);
  const pct = course.topicCount ? Math.round((progress.studiedCount / course.topicCount) * 100) : 0;
  const started = progress.studiedCount > 0;

  return (
    <Link to={'/course/' + course.id} className="coursecard card">
      <span className="coursecard__index" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>

      <span className="mono coursecard__kicker">
        {course.level} · {formatDuration(course.minutes)}
      </span>

      <h3 className="coursecard__title">{course.title}</h3>
      <p className="coursecard__sub">{course.subtitle}</p>

      <ul className="coursecard__tags">
        {course.tags.slice(0, 4).map((tag) => (
          <li key={tag} className="coursecard__tag">
            {tag}
          </li>
        ))}
      </ul>

      <div className="coursecard__foot">
        <span className="mono coursecard__meta">
          {course.topicCount} lessons · {course.moduleCount} tracks
        </span>
        <span className="coursecard__go">
          {started ? 'Continue' : 'Start'} <Icon name="arrow-right" size={15} />
        </span>
      </div>

      <div className="coursecard__progress">
        <div className="coursecard__track" aria-hidden="true">
          <span style={{ width: pct + '%' }} />
        </div>
        <span className="mono coursecard__pct">{started ? pct + '% studied' : 'Not started'}</span>
      </div>
    </Link>
  );
}
