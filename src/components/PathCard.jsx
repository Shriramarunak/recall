import { Link } from 'react-router-dom';
import Icon from './Icon';
import { formatDuration } from '../lib/course';
import { pathStats } from '../lib/paths';

/** A learning-path tile: the ordered course sequence plus overall progress. */
export default function PathCard({ path, catalogById, counts, index = 0 }) {
  const stats = pathStats(path, catalogById, counts);
  const started = stats.studied > 0;

  return (
    <Link to={'/path/' + path.id} className="pathcard card">
      <span className="pathcard__index" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="mono pathcard__kicker">
        {stats.steps.length} courses · {formatDuration(stats.minutes)}
      </span>
      <h3 className="pathcard__title">{path.title}</h3>
      <p className="pathcard__sub">{path.subtitle}</p>

      <ol className="pathseq" aria-label="Course sequence">
        {stats.steps.map((step, i) => (
          <li key={step.course.id} className={'pathseq__step' + (step.complete ? ' is-complete' : '')}>
            <span className="pathseq__name">{step.course.title}</span>
            {i < stats.steps.length - 1 && (
              <span className="pathseq__arrow" aria-hidden="true">
                →
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="pathcard__foot">
        <div className="pathcard__track" aria-hidden="true">
          <span style={{ width: stats.pct + '%' }} />
        </div>
        <span className="mono pathcard__pct">
          {started ? stats.pct + '%' : 'Start'} <Icon name="arrow-right" size={14} />
        </span>
      </div>
    </Link>
  );
}
