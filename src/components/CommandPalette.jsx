import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { DEFAULT_COURSE_ID, fetchAllCourses } from '../api/client';
import { useCatalog } from '../hooks/useCourse';

/**
 * ⌘K / Ctrl-K command palette: jump to any lesson or a study mode without the
 * mouse. Opens on the shortcut, filters as you type, arrow keys + Enter commit.
 */
const base = '/course/' + DEFAULT_COURSE_ID;
const ACTIONS = [
  { id: 'a-courses', label: 'Browse courses', to: '/courses', icon: 'book', kind: 'Go to' },
  { id: 'a-news', label: 'AI news', to: '/news', icon: 'search', kind: 'Go to' },
  { id: 'a-flash', label: 'Flashcards', to: base + '/flashcards', icon: 'cards', kind: 'Go to' },
  { id: 'a-quiz', label: 'Quiz', to: base + '/quiz', icon: 'target', kind: 'Go to' },
  { id: 'a-mock', label: 'Mock interview', to: base + '/interview', icon: 'mic', kind: 'Go to' },
  { id: 'a-dash', label: 'Dashboard', to: base + '/dashboard', icon: 'target', kind: 'Go to' },
];

export default function CommandPalette() {
  const catalog = useCatalog();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    let active = true;
    fetchAllCourses().then((list) => active && setCourses(list));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((v) => !v);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('cmdk:open', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('cmdk:open', onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current && inputRef.current.focus());
    }
  }, [open]);

  const items = useMemo(() => {
    // Lessons from every course, so search is global.
    const lessons = courses.flatMap((c) =>
      c.topics.map((t) => ({
        id: 'lesson-' + c.id + '-' + t.id,
        label: t.title,
        kind: c.title,
        to: '/course/' + c.id + '/topic/' + t.id,
        icon: 'arrow-right',
      })),
    );
    const courseItems = catalog.map((c) => ({
      id: 'course-' + c.id,
      label: c.title,
      kind: 'Course',
      to: '/course/' + c.id,
      icon: 'book',
    }));
    const all = [...ACTIONS, ...courseItems, ...lessons];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((i) => (i.label + ' ' + i.kind).toLowerCase().includes(q));
  }, [courses, catalog, query]);

  useEffect(() => {
    if (active >= items.length) setActive(0);
  }, [items.length, active]);

  if (!open) return null;

  const go = (item) => {
    if (!item) return;
    navigate(item.to);
    setOpen(false);
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(items[active]);
    }
  };

  return (
    <div className="cmdk" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={() => setOpen(false)}>
      <div className="cmdk__panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cmdk__search">
          <Icon name="search" size={18} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search lessons, courses, actions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <kbd className="cmdk__esc">esc</kbd>
        </div>
        <ul className="cmdk__list">
          {items.slice(0, 40).map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                className={'cmdk__item' + (i === active ? ' is-active' : '')}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item)}
              >
                <Icon name={item.icon} size={15} />
                <span className="cmdk__label">{item.label}</span>
                <span className="cmdk__kind mono">{item.kind}</span>
              </button>
            </li>
          ))}
          {items.length === 0 && <li className="cmdk__empty">No match.</li>}
        </ul>
      </div>
    </div>
  );
}
