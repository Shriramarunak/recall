import { Link } from 'react-router-dom';

/**
 * The course as 70 ticks — one per topic, in reading order, filled when you
 * mark a topic studied. It is the index itself, not an abstract percentage.
 */
export default function IndexTicks({ course, progress, tone = 'light' }) {
  return (
    <ul className={'ticks ticks--' + tone} aria-label="Topic completion">
      {course.topics.map((topic) => {
        const studied = progress.isStudied(topic.id);
        const flagged = progress.isFlagged(topic.id);
        return (
          <li key={topic.id}>
            <Link
              to={'/course/' + course.id + '/topic/' + topic.id}
              className={
                'ticks__tick' + (studied ? ' is-studied' : '') + (flagged ? ' is-flagged' : '')
              }
              title={
                topic.order + '. ' + topic.title + (studied ? ', studied' : '') + (flagged ? ', flagged' : '')
              }
              aria-label={topic.title + (studied ? ', studied' : ', not studied')}
            />
          </li>
        );
      })}
    </ul>
  );
}
