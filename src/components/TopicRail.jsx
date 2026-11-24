import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';
import { topicsByModule, searchTopics } from '../lib/course';

/** The course index: search, grouped lessons, and what you have studied. */
export default function TopicRail({ course, progress, activeTopicId }) {
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const matches = new Set(searchTopics(course, query).map((topic) => topic.id));
    return topicsByModule(course)
      .map((module) => ({ ...module, topics: module.topics.filter((topic) => matches.has(topic.id)) }))
      .filter((module) => module.topics.length > 0);
  }, [course, query]);

  return (
    <div className="rail">
      <div className="rail__search">
        <label className="visually-hidden" htmlFor="rail-search">
          Search lessons
        </label>
        <Icon name="search" size={16} className="rail__search-icon" />
        <input
          id="rail-search"
          type="search"
          placeholder="Search lessons"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <p className="mono rail__count">
        {progress.studiedCount} / {course.topics.length} studied
      </p>

      <nav className="rail__nav" aria-label="Lessons">
        {groups.map((module) => (
          <section key={module.id} className="rail__group">
            <h2 className="mono rail__group-title">
              <span>{module.title}</span>
              <span className="rail__group-count">
                {module.topics.filter((topic) => progress.isStudied(topic.id)).length}/
                {module.topics.length}
              </span>
            </h2>
            <ul>
              {module.topics.map((topic) => (
                <li key={topic.id}>
                  <NavLink
                    to={'/course/' + course.id + '/topic/' + topic.id}
                    className={({ isActive }) =>
                      'rail__item' +
                      (isActive || topic.id === activeTopicId ? ' is-active' : '') +
                      (progress.isStudied(topic.id) ? ' is-studied' : '')
                    }
                  >
                    <span className="mono rail__item-num">{String(topic.order).padStart(2, '0')}</span>
                    <span className="rail__item-title">{topic.title}</span>
                    {progress.isFlagged(topic.id) && (
                      <span className="rail__item-flag" title="Flagged to revisit" aria-hidden="true" />
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {groups.length === 0 && <p className="rail__empty">No lesson matches “{query}”.</p>}
      </nav>
    </div>
  );
}
