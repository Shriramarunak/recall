import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import BackLink from '../components/BackLink';
import { useCourse } from '../hooks/useCourse';
import { useProgress } from '../hooks/useProgress';
import { buildFlashcards } from '../lib/course';
import { summarise } from '../lib/srs';
import { currentStreak, longestStreak, studiedThisWeek, heatmapWeeks } from '../lib/study';

const DAY_LABELS = ['', 'M', '', 'W', '', 'F', ''];

export default function DashboardPage() {
  const { courseId } = useParams();
  const { status, course } = useCourse(courseId);
  const progress = useProgress(courseId);

  if (status === 'loading') return <div className="shell page-pad">Loading your dashboard…</div>;
  if (status === 'error') return <div className="shell page-pad">That course does not exist.</div>;

  const streak = currentStreak(progress.activity);
  const best = longestStreak(progress.activity);
  const week = studiedThisWeek(progress.activity);
  const goal = progress.goals.weekly || 12;
  const grid = heatmapWeeks(progress.activity);

  const cards = buildFlashcards(course);
  const srs = summarise(cards, progress.srs);

  const weakTopics = course.topics.filter(
    (t) => progress.getDifficulty(t.id) === 'hard' || progress.isFlagged(t.id),
  );

  const level = (count) => (count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3);

  return (
    <section className="shell page-pad dash">
      <BackLink to={'/course/' + course.id} label="Course" />
      <header className="dash__head">
        <span className="mono section__kicker">Your study dashboard</span>
        <h1 className="dash__title">Keep the loop going.</h1>
      </header>

      <div className="dash__grid">
        <article className="stat card">
          <span className="mono stat__label">Current streak</span>
          <span className="stat__value">
            {streak}
            <span className="stat__unit">{streak === 1 ? 'day' : 'days'}</span>
          </span>
          <span className="stat__foot mono">Best {best}</span>
        </article>

        <article className="stat card">
          <span className="mono stat__label">This week</span>
          <span className="stat__value">
            {week}
            <span className="stat__unit">/ {goal}</span>
          </span>
          <div className="goalbar" aria-hidden="true">
            <span style={{ width: Math.min(100, (week / goal) * 100) + '%' }} />
          </div>
          <div className="stat__goal">
            <span className="mono">Weekly goal</span>
            <span className="goal-step">
              <button type="button" onClick={() => progress.setWeeklyGoal(Math.max(1, goal - 1))} aria-label="Lower goal">
                –
              </button>
              <strong>{goal}</strong>
              <button type="button" onClick={() => progress.setWeeklyGoal(goal + 1)} aria-label="Raise goal">
                +
              </button>
            </span>
          </div>
        </article>

        <article className="stat card">
          <span className="mono stat__label">Lessons studied</span>
          <span className="stat__value">
            {progress.studiedCount}
            <span className="stat__unit">/ {course.topics.length}</span>
          </span>
          <Link className="stat__link" to={'/course/' + course.id}>
            Open the syllabus <Icon name="arrow-right" size={14} />
          </Link>
        </article>

        <article className="stat card stat--accent">
          <span className="mono stat__label">Cards due today</span>
          <span className="stat__value">{srs.due + srs.fresh}</span>
          <span className="stat__foot mono">
            {srs.due} review · {srs.fresh} new
          </span>
          <Link className="stat__link" to={'/course/' + course.id + '/flashcards?deck=due'}>
            Review now <Icon name="arrow-right" size={14} />
          </Link>
        </article>
      </div>

      <div className="dash__panels">
        <article className="card dash__panel">
          <header className="dash__panel-head">
            <h2 className="dash__panel-title">Activity</h2>
            <span className="mono dash__panel-note">last {grid.length} weeks</span>
          </header>
          <div className="heatmap">
            <div className="heatmap__days" aria-hidden="true">
              {DAY_LABELS.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="heatmap__grid">
              {grid.map((col, ci) => (
                <div key={ci} className="heatmap__col">
                  {col.map((cell) => (
                    <span
                      key={cell.date}
                      className={'heatmap__cell' + (cell.future ? ' is-future' : ' lvl-' + level(cell.count))}
                      title={cell.count ? cell.date + ' · ' + cell.count + ' sessions' : cell.date}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="card dash__panel">
          <header className="dash__panel-head">
            <h2 className="dash__panel-title">Weak areas</h2>
            <span className="mono dash__panel-note">{weakTopics.length} to revisit</span>
          </header>
          {weakTopics.length === 0 ? (
            <p className="dash__empty">
              Nothing flagged yet. Mark a lesson <strong>Hard</strong> or flag it while you read and it will
              surface here.
            </p>
          ) : (
            <ul className="dash__weak">
              {weakTopics.slice(0, 8).map((topic) => (
                <li key={topic.id}>
                  <Link to={'/course/' + course.id + '/topic/' + topic.id}>
                    <span className="mono dash__weak-num">{String(topic.order).padStart(2, '0')}</span>
                    <span className="dash__weak-title">{topic.title}</span>
                    <span className={'chip chip--' + (progress.getDifficulty(topic.id) || 'flag')}>
                      {progress.getDifficulty(topic.id) === 'hard' ? 'Hard' : 'Flagged'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      <Backup progress={progress} />
    </section>
  );
}

function Backup({ progress }) {
  const fileRef = useRef(null);
  const [note, setNote] = useState('');

  const doExport = () => {
    const blob = new Blob([progress.exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recall-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        progress.importData(String(reader.result));
        setNote('Progress restored from backup.');
      } catch (error) {
        setNote(error.message || 'Could not read that file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <article className="card backup">
      <div className="backup__copy">
        <h2 className="backup__title">Back up your progress</h2>
        <p className="backup__note">
          Progress lives in this browser only. Export a file to keep it safe or move it to another
          device, then import it there. {note && <strong>{note}</strong>}
        </p>
      </div>
      <div className="backup__actions">
        <button type="button" className="btn btn--outline btn--sm" onClick={doExport}>
          Export
        </button>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => fileRef.current.click()}>
          Import
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={doImport} />
      </div>
    </article>
  );
}
