import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import BackLink from '../components/BackLink';
import { useCourse } from '../hooks/useCourse';
import { findModule, mockPrompt } from '../lib/course';

const ROUND_SECONDS = 90;

const RUBRIC = [
  'Defined the concept in one sentence, without jargon padding.',
  'Gave a concrete example from a system you have built or read about.',
  'Named the tradeoff and what you would give up.',
  'Named the metric you would track, with a number.',
  'Said what you would do when the evidence is not there.',
];

export default function InterviewPage() {
  const { courseId } = useParams();
  const { status, course } = useCourse(courseId);

  const [topic, setTopic] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [seconds, setSeconds] = useState(ROUND_SECONDS);
  const [running, setRunning] = useState(false);
  const [checked, setChecked] = useState([]);
  const timer = useRef(null);

  const draw = useCallback(
    (fromCourse) => {
      const source = fromCourse || course;
      if (!source) return;
      const next = source.topics[Math.floor(Math.random() * source.topics.length)];
      setTopic(next);
      setRevealed(false);
      setChecked([]);
      setSeconds(ROUND_SECONDS);
      setRunning(false);
    },
    [course],
  );

  useEffect(() => {
    if (course && !topic) draw(course);
  }, [course, topic, draw]);

  useEffect(() => {
    if (!running) return undefined;
    timer.current = window.setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(timer.current);
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer.current);
  }, [running]);

  if (status === 'loading') return <div className="shell page-pad">Loading questions…</div>;
  if (status === 'error') return <div className="shell page-pad">That course does not exist.</div>;
  if (!topic) return <div className="shell page-pad">Drawing a question…</div>;

  const module = findModule(course, topic.moduleId);
  const minutes = String(Math.floor(seconds / 60));
  const remainder = String(seconds % 60).padStart(2, '0');

  const toggleRubric = (item) =>
    setChecked((current) =>
      current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item],
    );

  return (
    <section className="shell page-pad mock">
      <BackLink to={'/course/' + course.id} label="Course" />
      <header className="mock__head">
        <span className="mono section__kicker">Mock round · no notes</span>
        <h1 className="mock__title">One question, ninety seconds.</h1>
        <p className="mock__lede">
          Start the clock, answer out loud as if someone is listening, then score yourself before you
          read the model answer.
        </p>
      </header>

      <div className="mock__board">
        <article className="mock__question card">
          <span className="mono mock__track">{module ? module.title : course.title}</span>
          <h2 className="mock__prompt">{mockPrompt(topic)}</h2>
          <div className={'mock__timer' + (seconds === 0 ? ' is-done' : '')}>
            <span className="mock__clock mono">
              {minutes}:{remainder}
            </span>
            <div className="mock__actions">
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => setRunning((value) => !value)}
                disabled={seconds === 0}
              >
                {running ? 'Pause' : seconds === ROUND_SECONDS ? 'Start the clock' : 'Resume'}
              </button>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => {
                  setSeconds(ROUND_SECONDS);
                  setRunning(false);
                }}
              >
                Reset
              </button>
            </div>
          </div>
          {seconds === 0 && <p className="mock__timeup mono">Time. Wrap up your answer.</p>}
        </article>

        <aside className="mock__rubric card">
          <span className="mono mock__rubric-label">Score yourself</span>
          <ul>
            {RUBRIC.map((item) => (
              <li key={item}>
                <label className={'check' + (checked.includes(item) ? ' is-on' : '')}>
                  <input
                    type="checkbox"
                    checked={checked.includes(item)}
                    onChange={() => toggleRubric(item)}
                  />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>
          <p className="mono mock__score">
            {checked.length} / {RUBRIC.length} covered
          </p>
        </aside>
      </div>

      <div className="mock__reveal">
        <button type="button" className="btn btn--ink" onClick={() => setRevealed((value) => !value)}>
          {revealed ? 'Hide the model answer' : 'Reveal the model answer'}
        </button>
        <button type="button" className="btn btn--outline" onClick={() => draw()}>
          <Icon name="refresh" size={16} /> New question
        </button>
        <Link className="btn btn--outline" to={'/course/' + course.id + '/topic/' + topic.id}>
          Read the lesson
        </Link>
      </div>

      {revealed && (
        <div className="mock__answer card">
          <span className="mono">Model answer</span>
          <p>{topic.interviewAnswer}</p>
          {topic.tradeoffs.length > 0 && (
            <>
              <span className="mono">Tradeoffs worth naming</span>
              <ul className="bullets">
                {topic.tradeoffs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
}
