const STAGES = [
  { key: 'retrieve', label: 'Retrieve', note: 'BM25 + vector, top 50' },
  { key: 'fuse', label: 'Fuse', note: 'reciprocal rank fusion' },
  { key: 'rerank', label: 'Rerank', note: 'cross-encoder, top 8' },
  { key: 'compress', label: 'Compress', note: 'fit the context budget' },
  { key: 'ground', label: 'Ground', note: 'answer from passages only' },
];

/**
 * Hero visual: what actually happens between a question and a cited answer.
 * The one diagram every lesson in this course hangs off.
 */
export default function QueryPath() {
  return (
    <figure className="qpath" aria-labelledby="qpath-title">
      <figcaption className="qpath__head">
        <span className="mono qpath__kicker">The query path</span>
        <span id="qpath-title" className="qpath__title">
          Question in, evidence out
        </span>
      </figcaption>

      <div className="qpath__query">
        <span className="mono">Ask</span>
        <p>“How many carry-forward leave days are allowed?”</p>
      </div>

      <ol className="qpath__stages">
        {STAGES.map((stage, index) => (
          <li key={stage.key} className="qpath__stage" style={{ '--i': index }}>
            <span className="mono qpath__num">{String(index + 1).padStart(2, '0')}</span>
            <span className="qpath__label">{stage.label}</span>
            <span className="qpath__note mono">{stage.note}</span>
          </li>
        ))}
      </ol>

      <div className="qpath__answer">
        <span className="mono">Answer</span>
        <p>
          Up to 15 days carry forward.
          <span className="qpath__cite mono">hr-policy.pdf · §4.2</span>
        </p>
      </div>
    </figure>
  );
}
