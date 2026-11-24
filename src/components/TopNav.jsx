import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import Logo from './Logo';
import Icon from './Icon';
import { DEFAULT_COURSE_ID } from '../api/client';
import { useProgress } from '../hooks/useProgress';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/paths', label: 'Paths' },
  { to: '/courses', label: 'Courses' },
  { to: '/videos', label: 'Videos' },
  { to: '/news', label: 'News' },
];

export default function TopNav({ topicCount = 70 }) {
  const [open, setOpen] = useState(false);
  const { studiedCount, lastTopicId } = useProgress(DEFAULT_COURSE_ID);

  const resumeHref =
    '/course/' + DEFAULT_COURSE_ID + (lastTopicId ? '/topic/' + lastTopicId : '');

  return (
    <header className="nav">
      <div className="shell nav__inner">
        <Link to="/" className="nav__brand" onClick={() => setOpen(false)}>
          <Logo tone="accent" />
          <span className="nav__wordmark">Recall</span>
        </Link>

        <nav className={'nav__links' + (open ? ' is-open' : '')} aria-label="Primary">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => 'nav__link' + (isActive ? ' is-active' : '')}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav__actions">
          <button
            type="button"
            className="nav__search"
            onClick={() => window.dispatchEvent(new Event('cmdk:open'))}
            aria-label="Open command palette"
            title="Jump to anything"
          >
            <Icon name="search" size={15} />
            <span className="nav__search-text">Jump to…</span>
            <kbd>⌘K</kbd>
          </button>
          <span className="nav__meter mono" title="Topics you have marked as studied">
            {studiedCount} / {topicCount} studied
          </span>
          <Link className="btn btn--primary btn--sm" to={resumeHref}>
            {lastTopicId ? 'Resume' : 'Start studying'} <Icon name="arrow-right" size={16} />
          </Link>
          <button
            type="button"
            className="nav__burger"
            aria-expanded={open}
            aria-label="Toggle navigation"
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
