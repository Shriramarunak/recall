/**
 * Concept diagrams — small, authored inline SVGs keyed by topic id. Rendered in
 * the lesson reader when one exists for the topic. Sharp corners, theme palette,
 * dark strokes on the light reader background.
 */
const INK = '#131313';
const ACCENT = '#131313';
const LINE = '#dcdcdc';
const SOFT = '#8a8a8a';

function Box({ x, y, w, h, label, sub, accent }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="3"
        fill={accent ? '#ededed' : '#ffffff'}
        stroke={accent ? ACCENT : LINE}
        strokeWidth={accent ? 1.6 : 1}
      />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 4 : h / 2 + 4)} textAnchor="middle" fontSize="12.5" fontWeight="600" fill={INK}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" fontSize="10" fill={SOFT}>
          {sub}
        </text>
      )}
    </g>
  );
}

const Arrow = ({ x1, y1, x2, y2 }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={SOFT} strokeWidth="1.5" markerEnd="url(#cd-arrow)" />
);

function Frame({ label, viewBox, children }) {
  return (
    <svg className="diagram" viewBox={viewBox} role="img" aria-label={label} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="cd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={SOFT} />
        </marker>
      </defs>
      {children}
    </svg>
  );
}

const DIAGRAMS = {
  'rag-pipeline': () => (
    <Frame label="RAG pipeline: offline ingestion feeds an index that online query answering reads from." viewBox="0 0 640 260">
      <text x="16" y="24" fontSize="10.5" letterSpacing="1.4" fill={SOFT}>OFFLINE · INGESTION</text>
      <Box x={16} y={36} w={120} h={46} label="Documents" sub="parse · clean" />
      <Arrow x1={136} y1={59} x2={168} y2={59} />
      <Box x={168} y={36} w={120} h={46} label="Chunk" sub="coherent units" />
      <Arrow x1={288} y1={59} x2={320} y2={59} />
      <Box x={320} y={36} w={120} h={46} label="Embed" sub="vectors" />
      <Arrow x1={440} y1={59} x2={472} y2={59} />
      <Box x={472} y={36} w={152} h={46} label="Index" sub="vector + lexical" accent />

      <line x1={548} y1={82} x2={548} y2={150} stroke={SOFT} strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#cd-arrow)" />

      <text x="16" y="150" fontSize="10.5" letterSpacing="1.4" fill={SOFT}>ONLINE · QUERY ANSWERING</text>
      <Box x={16} y={164} w={120} h={46} label="Question" />
      <Arrow x1={136} y1={187} x2={168} y2={187} />
      <Box x={168} y={164} w={120} h={46} label="Retrieve" sub="BM25 + vector" />
      <Arrow x1={288} y1={187} x2={320} y2={187} />
      <Box x={320} y={164} w={120} h={46} label="Rerank" sub="+ compress" />
      <Arrow x1={440} y1={187} x2={472} y2={187} />
      <Box x={472} y={164} w={152} h={46} label="Grounded answer" sub="with citations" accent />
    </Frame>
  ),

  'hybrid-fusion': () => (
    <Frame label="Hybrid search runs lexical and vector retrieval in parallel and fuses the two ranked lists." viewBox="0 0 560 230">
      <Box x={16} y={92} w={110} h={46} label="Query" />
      <Arrow x1={126} y1={108} x2={170} y2={60} />
      <Arrow x1={126} y1={128} x2={170} y2={176} />
      <Box x={170} y={36} w={150} h={46} label="BM25" sub="lexical, top 50" />
      <Box x={170} y={152} w={150} h={46} label="Vector" sub="dense, top 50" />
      <Arrow x1={320} y1={60} x2={372} y2={100} />
      <Arrow x1={320} y1={176} x2={372} y2={120} />
      <Box x={372} y={92} w={80} h={46} label="RRF" sub="fuse" accent />
      <Arrow x1={452} y1={115} x2={490} y2={115} />
      <Box x={490} y={92} w={60} h={46} label="Top k" accent />
    </Frame>
  ),

  attention: () => (
    <Frame label="Scaled dot-product attention: a token's query is matched against keys to weight the values." viewBox="0 0 560 230">
      <Box x={16} y={92} w={120} h={46} label="Token" sub="embedding" />
      <Arrow x1={136} y1={100} x2={180} y2={52} />
      <Arrow x1={136} y1={115} x2={180} y2={115} />
      <Arrow x1={136} y1={130} x2={180} y2={178} />
      <Box x={180} y={32} w={96} h={40} label="Query" accent />
      <Box x={180} y={95} w={96} h={40} label="Key" />
      <Box x={180} y={158} w={96} h={40} label="Value" />
      <Arrow x1={276} y1={52} x2={330} y2={96} />
      <Arrow x1={276} y1={115} x2={330} y2={110} />
      <Box x={330} y={88} w={120} h={46} label="softmax(QKᵀ/√d)" sub="weights" />
      <Arrow x1={276} y1={178} x2={388} y2={140} />
      <Arrow x1={450} y1={111} x2={488} y2={111} />
      <Box x={488} y={88} w={64} h={46} label="Output" accent />
    </Frame>
  ),

  'agent-loop': () => (
    <Frame label="An agent loop: reason, act with a tool, observe the result, and repeat until the goal is met." viewBox="0 0 560 220">
      <Box x={40} y={30} w={130} h={46} label="Reason" sub="plan next step" />
      <Arrow x1={170} y1={53} x2={250} y2={53} />
      <Box x={250} y={30} w={130} h={46} label="Act" sub="call a tool" accent />
      <Arrow x1={380} y1={53} x2={430} y2={53} />
      <Box x={430} y={30} w={110} h={46} label="Observe" sub="read result" />
      <line x1={485} y1={76} x2={485} y2={150} stroke={SOFT} strokeWidth="1.5" />
      <line x1={485} y1={150} x2={105} y2={150} stroke={SOFT} strokeWidth="1.5" />
      <line x1={105} y1={150} x2={105} y2={76} stroke={SOFT} strokeWidth="1.5" markerEnd="url(#cd-arrow)" />
      <text x="295" y="145" textAnchor="middle" fontSize="11" fill={SOFT}>repeat until the stop condition is met</text>
      <Arrow x1={540} y1={40} x2={548} y2={40} />
      <text x="548" y="30" fontSize="11" fill={SOFT}>done</text>
    </Frame>
  ),
};

/** Topic id → diagram key. */
const TOPIC_DIAGRAM = {
  'why-rag': 'rag-pipeline',
  'enterprise-rag-ingestion-vs-serving': 'rag-pipeline',
  'hybrid-search': 'hybrid-fusion',
  'hybrid-rag': 'hybrid-fusion',
  'scaled-dot-product-attention-and-qkv': 'attention',
  'transformer-architecture-end-to-end': 'attention',
  'react-plan-execute-and-tool-calling': 'agent-loop',
  'agent-vs-deterministic-workflow': 'agent-loop',
};

export function hasDiagram(topicId) {
  return Boolean(TOPIC_DIAGRAM[topicId]);
}

export default function ConceptDiagram({ topicId }) {
  const key = TOPIC_DIAGRAM[topicId];
  const Render = key && DIAGRAMS[key];
  if (!Render) return null;
  return (
    <div className="diagram-wrap">
      <Render />
    </div>
  );
}
