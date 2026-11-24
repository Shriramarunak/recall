import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon';
import BackLink from '../components/BackLink';
import { useCourse } from '../hooks/useCourse';
import { useProgress } from '../hooks/useProgress';
import { buildFlashcards, findModule } from '../lib/course';
import { GRADES, isDue } from '../lib/srs';

const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const SCOPES = [
  { id: 'due', label: 'Due today' },
  { id: 'all', label: 'Whole course' },
  { id: 'unstudied', label: 'Not yet studied' },
  { id: 'flagged', label: 'Flagged' },
];

export default function FlashcardsPage() {
  const { courseId } = useParams();
  const { status, course } = useCourse(courseId);
  const progress = useProgress(courseId);
  const [params] = useSearchParams();

  const [scope, setScope] = useState(params.get('deck') === 'due' ? 'due' : 'all');
  const [order, setOrder] = useState('course');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  // In SRS mode, reviewed cards leave the session queue; this holds their ids.
  const [reviewed, setReviewed] = useState([]);

  const isSrs = scope === 'due';

  const cards = useMemo(() => {
    if (!course) return [];
    const all = buildFlashcards(course);
    let deck = all;
    if (scope === 'due') deck = all.filter((c) => isDue(progress.srs[c.id]) && !reviewed.includes(c.id));
    if (scope === 'flagged') deck = all.filter((c) => progress.isFlagged(c.topicId));
    if (scope === 'unstudied') deck = all.filter((c) => !progress.isStudied(c.topicId));
    return !isSrs && order === 'shuffled' ? shuffle(deck) : deck;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, scope, order, reviewed, progress.studied, progress.flagged, progress.srs]);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setReviewed([]);
  }, [scope, order]);

  const card = cards[index] || null;

  const step = (delta) => {
    setIndex((value) => Math.min(Math.max(value + delta, 0), Math.max(cards.length - 1, 0)));
    setFlipped(false);
  };

  const grade = (q) => {
    if (!card) return;
    progress.reviewCard(card.id, q);
    setReviewed((r) => [...r, card.id]); // removes it from the due queue
    setFlipped(false);
    setIndex(0); // queue shrinks; show the next due card
  };

  useEffect(() => {
    const onKey = (event) => {
      if (event.target.tagName === 'INPUT') return;
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        setFlipped((value) => !value);
      }
      if (!isSrs && event.code === 'ArrowRight') {
        setIndex((value) => Math.min(value + 1, Math.max(cards.length - 1, 0)));
        setFlipped(false);
      }
      if (!isSrs && event.code === 'ArrowLeft') {
        setIndex((value) => Math.max(value - 1, 0));
        setFlipped(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cards.length, isSrs]);

  if (status === 'loading') return <div className="shell page-pad">Loading the deck…</div>;
  if (status === 'error') return <div className="shell page-pad">That course does not exist.</div>;

  return (
    <section className="shell page-pad drill">
      <BackLink to={'/course/' + course.id} label="Course" />
      <header className="drill__head">
        <span className="mono section__kicker">Active recall{isSrs ? ' · spaced repetition' : ''}</span>
        <h1 className="drill__title">Flashcards</h1>
        <p className="drill__lede">
          {isSrs
            ? 'Rate each card after you flip. The scheduler decides when you see it next.'
            : 'Say your answer out loud, then flip. Space flips the card, arrow keys move through the deck.'}
        </p>
      </header>

      <div className="drill__controls">
        <div className="switch" role="group" aria-label="Deck scope">
          {SCOPES.map((option) => (
            <button
              key={option.id}
              type="button"
              className={'switch__option' + (scope === option.id ? ' is-on' : '')}
              onClick={() => setScope(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {!isSrs && (
          <div className="switch" role="group" aria-label="Card order">
            {[
              { id: 'course', label: 'Course order' },
              { id: 'shuffled', label: 'Shuffled' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                className={'switch__option' + (order === option.id ? ' is-on' : '')}
                onClick={() => setOrder(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!card ? (
        <div className="drill__empty card">
          <h2>{isSrs ? 'All caught up' : 'Nothing in this deck yet'}</h2>
          <p>
            {isSrs ? (
              <>
                No cards are due right now{reviewed.length ? '. You cleared today’s deck' : ''}. Come back
                tomorrow, or switch to the whole course to get ahead.{' '}
              </>
            ) : (
              <>Flag a few lessons while you read, or switch the scope back to the whole course. </>
            )}
            <Link to={'/course/' + course.id}>Open the syllabus</Link>
          </p>
        </div>
      ) : (
        <>
          <div className="drill__progress mono">
            {isSrs ? cards.length + ' card' + (cards.length === 1 ? '' : 's') + ' due' : 'Card ' + (index + 1) + ' / ' + cards.length}
            <span className="drill__progress-bar" aria-hidden="true">
              <span style={{ width: (isSrs ? 100 / Math.max(cards.length, 1) : ((index + 1) / cards.length) * 100) + '%' }} />
            </span>
          </div>

          <button
            type="button"
            className={'flashcard' + (flipped ? ' is-flipped' : '')}
            onClick={() => setFlipped((value) => !value)}
            aria-live="polite"
          >
            <span className="mono flashcard__kind">
              {card.kind === 'core' ? 'Core question' : 'Follow-up'} · {findModule(course, card.moduleId)?.title}
            </span>
            <span className="flashcard__text">{flipped ? card.answer : card.question}</span>
            <span className="mono flashcard__hint">
              {flipped ? 'Click to see the question' : 'Click to reveal the answer'}
            </span>
          </button>

          {isSrs ? (
            flipped ? (
              <div className="grades">
                {GRADES.map((g) => (
                  <button key={g.id} type="button" className={'grade grade--' + g.tone} onClick={() => grade(g.q)}>
                    <span className="grade__label">{g.label}</span>
                    <span className="grade__hint mono">{g.hint}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="drill__actions">
                <button type="button" className="btn btn--primary" onClick={() => setFlipped(true)}>
                  Reveal answer to rate
                </button>
                <Link className="btn btn--outline" to={'/course/' + course.id + '/topic/' + card.topicId}>
                  Read the lesson
                </Link>
              </div>
            )
          ) : (
            <div className="drill__actions">
              <button type="button" className="btn btn--outline" onClick={() => step(-1)} disabled={index === 0}>
                <Icon name="arrow-left" size={16} /> Previous
              </button>
              <button type="button" className="btn btn--primary" onClick={() => setFlipped((v) => !v)}>
                Flip card
              </button>
              <button type="button" className="btn btn--outline" onClick={() => step(1)} disabled={index >= cards.length - 1}>
                Next <Icon name="arrow-right" size={16} />
              </button>
              <Link className="btn btn--outline" to={'/course/' + course.id + '/topic/' + card.topicId}>
                Read the lesson
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}
