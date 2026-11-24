import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import BackLink from '../components/BackLink';
import { useCourse } from '../hooks/useCourse';
import { useProgress } from '../hooks/useProgress';
import { findModule } from '../lib/course';

const QUIZ_SIZE = 10;

const shuffle = (items) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Build MCQs: each follow-up question with its answer, plus 3 distractor answers. */
function buildQuiz(course) {
  const pool = [];
  course.topics.forEach((topic) => {
    topic.followUps.forEach((f, i) => {
      pool.push({ id: topic.id + '-' + i, topicId: topic.id, question: f.question, answer: f.answer });
    });
  });
  const chosen = shuffle(pool).slice(0, QUIZ_SIZE);
  return chosen.map((item) => {
    const distractors = shuffle(pool.filter((p) => p.topicId !== item.topicId && p.answer !== item.answer))
      .slice(0, 3)
      .map((p) => p.answer);
    return {
      ...item,
      options: shuffle([item.answer, ...distractors]),
    };
  });
}

export default function QuizPage() {
  const { courseId } = useParams();
  const { status, course } = useCourse(courseId);
  const progress = useProgress(courseId);

  const [quiz, setQuiz] = useState([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);

  const start = useCallback(() => {
    if (!course) return;
    setQuiz(buildQuiz(course));
    setIndex(0);
    setPicked(null);
    setAnswers([]);
    setDone(false);
  }, [course]);

  useEffect(() => {
    if (course && quiz.length === 0) start();
  }, [course, quiz.length, start]);

  const current = quiz[index];
  const score = useMemo(() => answers.filter((a) => a.correct).length, [answers]);

  if (status === 'loading') return <div className="shell page-pad">Loading the quiz…</div>;
  if (status === 'error') return <div className="shell page-pad">That course does not exist.</div>;
  if (!current && !done) return <div className="shell page-pad">Building questions…</div>;

  const choose = (option) => {
    if (picked !== null) return;
    const correct = option === current.answer;
    setPicked(option);
    setAnswers((a) => [...a, { ...current, chosen: option, correct }]);
  };

  const next = () => {
    if (index + 1 >= quiz.length) {
      setDone(true);
      progress.recordActivity();
    } else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  };

  if (done) {
    const pct = Math.round((score / quiz.length) * 100);
    return (
      <section className="shell page-pad quiz">
        <BackLink to={'/course/' + course.id} label="Course" />
        <header className="quiz__head">
          <span className="mono section__kicker">Quiz complete</span>
          <h1 className="quiz__title">
            You scored {score} / {quiz.length}
          </h1>
          <p className="quiz__lede">
            {pct >= 80 ? 'Strong recall. Keep the weak ones in your flashcard rotation.' : 'Worth another pass. The misses below point to lessons to revisit.'}
          </p>
          <div className="quiz__actions">
            <button type="button" className="btn btn--primary" onClick={start}>
              <Icon name="refresh" size={16} /> New quiz
            </button>
            <Link className="btn btn--outline" to={'/course/' + course.id + '/flashcards'}>
              Drill flashcards
            </Link>
          </div>
        </header>
        <ul className="quiz__review">
          {answers.map((a) => {
            const module = findModule(course, a.topicId);
            return (
              <li key={a.id} className={'quiz__result card' + (a.correct ? ' is-correct' : ' is-wrong')}>
                <span className="mono quiz__result-tag">
                  {a.correct ? 'Correct' : 'Missed'} · {module ? module.title : ''}
                </span>
                <p className="quiz__result-q">{a.question}</p>
                {!a.correct && <p className="quiz__result-a">{a.answer}</p>}
                <Link className="quiz__result-link" to={'/course/' + course.id + '/topic/' + a.topicId}>
                  Read the lesson <Icon name="arrow-right" size={14} />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return (
    <section className="shell page-pad quiz">
      <BackLink to={'/course/' + course.id} label="Course" />
      <header className="quiz__head">
        <span className="mono section__kicker">Self-check · multiple choice</span>
        <h1 className="quiz__title">Quiz</h1>
        <p className="quiz__lede">Pick the answer an interviewer would accept. Immediate feedback, score at the end.</p>
      </header>

      <div className="quiz__progress mono">
        Question {index + 1} / {quiz.length}
        <span className="quiz__progress-bar" aria-hidden="true">
          <span style={{ width: ((index + (picked !== null ? 1 : 0)) / quiz.length) * 100 + '%' }} />
        </span>
        <span className="quiz__score">Score {score}</span>
      </div>

      <div className="quiz__card card">
        <p className="quiz__question">{current.question}</p>
        <ul className="quiz__options">
          {current.options.map((option) => {
            const isCorrect = option === current.answer;
            const chosen = picked === option;
            const state =
              picked === null ? '' : isCorrect ? ' is-correct' : chosen ? ' is-wrong' : ' is-dim';
            return (
              <li key={option}>
                <button type="button" className={'quiz__option' + state} onClick={() => choose(option)} disabled={picked !== null}>
                  <span className="quiz__option-mark" aria-hidden="true">
                    {picked !== null && isCorrect ? <Icon name="check" size={15} /> : null}
                  </span>
                  <span>{option}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {picked !== null && (
        <div className="quiz__next">
          <Link className="btn btn--outline btn--sm" to={'/course/' + course.id + '/topic/' + current.topicId}>
            Read the lesson
          </Link>
          <button type="button" className="btn btn--primary" onClick={next}>
            {index + 1 >= quiz.length ? 'See results' : 'Next question'} <Icon name="arrow-right" size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
