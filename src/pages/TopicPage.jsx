import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TopicRail from '../components/TopicRail';
import Icon from '../components/Icon';
import BackLink from '../components/BackLink';
import CodeBlock from '../components/CodeBlock';
import GlossaryText from '../components/GlossaryText';
import ConceptDiagram, { hasDiagram } from '../components/ConceptDiagram';
import { useCourse } from '../hooks/useCourse';
import { useProgress } from '../hooks/useProgress';
import { findModule, findTopic, neighbours } from '../lib/course';

const DIFFICULTY = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

function Block({ label, title, children, variant = '' }) {
  return (
    <section className={'block' + (variant ? ' block--' + variant : '')}>
      <header className="block__head">
        <span className="mono block__label">{label}</span>
        {title && <h2 className="block__title">{title}</h2>}
      </header>
      <div className="block__body">{children}</div>
    </section>
  );
}

function Notes({ topic, progress }) {
  const [text, setText] = useState(progress.getNote(topic.id));

  // Reset when switching lessons.
  useEffect(() => setText(progress.getNote(topic.id)), [topic.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = (value) => {
    setText(value);
    progress.setNote(topic.id, value);
  };

  const exportMarkdown = () => {
    const body = '# ' + topic.title + '\n\n' + (text || '_No notes yet._') + '\n';
    const blob = new Blob([body], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = topic.id + '.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Block label="My notes">
      <textarea
        className="notes"
        placeholder="Jot your own phrasing, a mnemonic, or a question to raise…"
        value={text}
        onChange={(e) => save(e.target.value)}
      />
      <div className="notes__foot">
        <span className="mono notes__status">{text ? 'Saved to this browser' : 'Private to you'}</span>
        <button type="button" className="btn btn--sm btn--outline" onClick={exportMarkdown} disabled={!text}>
          Export as Markdown
        </button>
      </div>
    </Block>
  );
}

export default function TopicPage() {
  const { courseId, topicId } = useParams();
  const { status, course } = useCourse(courseId);
  const progress = useProgress(courseId);
  const navigate = useNavigate();
  const [answerHidden, setAnswerHidden] = useState(false);

  useEffect(() => {
    if (topicId) progress.markVisited(topicId);
    setAnswerHidden(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [topicId]); // eslint-disable-line react-hooks/exhaustive-deps

  const topic = status === 'ready' ? findTopic(course, topicId) : null;
  const nav = topic ? neighbours(course, topic.id) : { previous: null, next: null };

  // Keyboard shortcuts: j/k move, f flag, m mark studied.
  useEffect(() => {
    if (!topic) return undefined;
    const onKey = (event) => {
      const tag = event.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.metaKey || event.ctrlKey) return;
      if (event.key === 'j' && nav.next) navigate('/course/' + course.id + '/topic/' + nav.next.id);
      else if (event.key === 'k' && nav.previous) navigate('/course/' + course.id + '/topic/' + nav.previous.id);
      else if (event.key === 'f') progress.toggleFlagged(topic.id);
      else if (event.key === 'm') progress.toggleStudied(topic.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [topic, nav.next, nav.previous, course, navigate, progress]);

  if (status === 'loading') return <div className="shell page-pad">Loading…</div>;
  if (status === 'error') return <div className="shell page-pad">That course does not exist.</div>;

  if (!topic) {
    return (
      <div className="shell page-pad">
        <h1>Lesson not found</h1>
        <p>
          <Link to={'/course/' + course.id}>Back to the syllabus</Link>
        </p>
      </div>
    );
  }

  const module = findModule(course, topic.moduleId);
  const { previous, next } = nav;
  const studied = progress.isStudied(topic.id);
  const flagged = progress.isFlagged(topic.id);
  const difficulty = progress.getDifficulty(topic.id);

  return (
    <div className="study">
      <aside className="study__rail">
        <TopicRail course={course} progress={progress} activeTopicId={topic.id} />
      </aside>

      <main className="study__main">
        <article className="reader">
          <header className="reader__head">
            <BackLink to={'/course/' + course.id} label="All lessons" />
            <p className="mono reader__crumb">
              <Link to={'/course/' + course.id}>{course.title}</Link>
              <span aria-hidden="true">/</span>
              <span>{module ? module.title : ''}</span>
            </p>
            <h1 className="reader__title">
              <span className="mono reader__num">{String(topic.order).padStart(2, '0')}</span>
              {topic.title}
            </h1>
            <div className="reader__meta">
              <span className="tag">{topic.minutes} min read</span>
              <span className="tag">{topic.followUps.length} follow-ups</span>
              {topic.code && <span className="tag">code example</span>}
              {hasDiagram(topic.id) && <span className="tag">diagram</span>}
            </div>

            <div className="reader__actions">
              <button
                type="button"
                className={'btn btn--sm ' + (studied ? 'btn--outline' : 'btn--primary')}
                onClick={() => progress.toggleStudied(topic.id)}
              >
                <Icon name="check" size={16} /> {studied ? 'Marked studied' : 'Mark studied'}
              </button>
              <button
                type="button"
                className={'btn btn--sm btn--outline' + (flagged ? ' is-on' : '')}
                onClick={() => progress.toggleFlagged(topic.id)}
              >
                <Icon name="flag" size={16} /> {flagged ? 'Flagged to revisit' : 'Flag to revisit'}
              </button>
              <button
                type="button"
                className="btn btn--sm btn--outline"
                onClick={() => setAnswerHidden((value) => !value)}
              >
                {answerHidden ? 'Show interview answer' : 'Hide interview answer'}
              </button>
            </div>

            <div className="reader__difficulty">
              <span className="mono">How hard was this?</span>
              <div className="diffpick">
                {DIFFICULTY.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={'diffpick__btn diffpick__btn--' + d.id + (difficulty === d.id ? ' is-on' : '')}
                    onClick={() => progress.setDifficulty(topic.id, d.id)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <Block label="Concept">
            <p>
              <GlossaryText>{topic.concept}</GlossaryText>
            </p>
          </Block>

          {hasDiagram(topic.id) && (
            <Block label="How it fits together">
              <ConceptDiagram topicId={topic.id} />
            </Block>
          )}

          <Block label="Worked example" variant="example">
            <p>{topic.example}</p>
          </Block>

          <Block label="Say this in the room" variant="answer">
            {answerHidden ? (
              <button type="button" className="block__reveal" onClick={() => setAnswerHidden(false)}>
                Answer out loud first, then reveal.
              </button>
            ) : (
              <p>{topic.interviewAnswer}</p>
            )}
          </Block>

          {topic.steps.length > 0 && (
            <Block label="Build order">
              <ol className="steps">
                {topic.steps.map((step, index) => (
                  <li key={index}>
                    <span className="mono steps__num">{String(index + 1).padStart(2, '0')}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Block>
          )}

          {topic.tradeoffs.length > 0 && (
            <Block label="Tradeoffs they will push on">
              <ul className="bullets">
                {topic.tradeoffs.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </Block>
          )}

          {topic.followUps.length > 0 && (
            <Block label={'Follow-ups (' + topic.followUps.length + ')'}>
              <div className="qa">
                {topic.followUps.map((followUp, index) => (
                  <details key={index} className="qa__item">
                    <summary>
                      <span className="mono qa__num">{String(index + 1).padStart(2, '0')}</span>
                      {followUp.question}
                    </summary>
                    <p>{followUp.answer}</p>
                  </details>
                ))}
              </div>
            </Block>
          )}

          {topic.code && (
            <Block label="Code example">
              <CodeBlock code={topic.code} language={topic.codeLang || 'python'} />
            </Block>
          )}

          <Notes topic={topic} progress={progress} />

          <nav className="reader__pager" aria-label="Lesson navigation">
            {previous ? (
              <Link className="pager pager--prev" to={'/course/' + course.id + '/topic/' + previous.id}>
                <span className="mono">Previous · k</span>
                <strong>{previous.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link className="pager pager--next" to={'/course/' + course.id + '/topic/' + next.id}>
                <span className="mono">Next · j</span>
                <strong>{next.title}</strong>
              </Link>
            )}
          </nav>
        </article>
      </main>
    </div>
  );
}
