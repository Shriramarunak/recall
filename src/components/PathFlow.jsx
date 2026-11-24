import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, { Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';

/* ---- custom nodes ---------------------------------------------------- */

function CourseNode({ data }) {
  return (
    <div className={'rfn rfn--course ' + (data.state || '')} onClick={() => data.onOpen(data.to)}>
      <Handle type="target" position={Position.Top} id="t" className="rfh" />
      <span className="rfn__num mono">{data.num}</span>
      <span className="rfn__body">
        <span className="rfn__title">{data.title}</span>
        <span className="rfn__meta mono">
          {data.done}/{data.total} lessons{data.state === 'is-current' ? ' · current' : ''}
        </span>
      </span>
      {data.complete && (
        <span className="rfn__check" aria-hidden="true">
          ✓
        </span>
      )}
      <Handle type="source" position={Position.Bottom} id="spine" className="rfh" />
    </div>
  );
}

function ModuleNode({ data }) {
  const branch = data.side === 'right' ? Position.Right : Position.Left;
  return (
    <div
      className={'rfn rfn--module ' + (data.complete ? 'is-complete' : '')}
      onClick={() => data.onOpen(data.to)}
    >
      <Handle type="target" position={Position.Top} id="t" className="rfh" />
      <span className="rfn__title">{data.title}</span>
      <span className="rfn__meta mono">
        {data.done}/{data.total}
      </span>
      <Handle type="source" position={Position.Bottom} id="spine" className="rfh" />
      <Handle type="source" position={branch} id="branch" className="rfh" />
    </div>
  );
}

/** A grouped cluster of lesson chips, the way roadmap.sh groups sub-topics. */
function ClusterNode({ data }) {
  const inPos = data.side === 'right' ? Position.Left : Position.Right;
  return (
    <div className="rfn rfn--cluster">
      <Handle type="target" position={inPos} id="t" className="rfh" />
      <ul className="rfcl">
        {data.topics.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              className={'rfchip' + (t.studied ? ' is-studied' : '')}
              onClick={(e) => {
                e.stopPropagation();
                data.onOpen(t.to);
              }}
            >
              <span className="rfchip__tick" aria-hidden="true" />
              <span className="rfchip__text">{t.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const nodeTypes = { course: CourseNode, module: ModuleNode, cluster: ClusterNode };

/* ---- layout ---------------------------------------------------------- */

const COURSE_W = 320;
const COURSE_H = 74;
const MODULE_W = 250;
const MODULE_H = 54;
const CLUSTER_W = 260;
const CHIP_H = 30;
const CHIP_GAP = 6;
const CLUSTER_PAD = 12;
const BRANCH_GAP = 86;
const ROW_GAP = 30;
const COURSE_GAP = 46;

const clusterHeight = (n) => CLUSTER_PAD * 2 + n * CHIP_H + (n - 1) * CHIP_GAP;

function buildGraph(steps, byCourse, currentIndex, onOpen) {
  const nodes = [];
  const edges = [];
  let y = 0;
  let prev = null;

  const edge = (source, sourceHandle, target, strong) =>
    edges.push({
      id: source + '->' + target,
      source,
      sourceHandle,
      target,
      targetHandle: 't',
      type: 'smoothstep',
      style: {
        stroke: strong ? 'rgba(19,19,19,0.42)' : 'rgba(19,19,19,0.2)',
        strokeWidth: 1.5,
      },
    });

  steps.forEach((step, ci) => {
    const courseId = 'c-' + step.course.id;
    const state = step.complete ? 'is-complete' : ci === currentIndex ? 'is-current' : 'is-upcoming';
    nodes.push({
      id: courseId,
      type: 'course',
      position: { x: -COURSE_W / 2, y },
      data: {
        num: String(ci + 1).padStart(2, '0'),
        title: step.course.title,
        done: step.done,
        total: step.total,
        complete: step.complete,
        state,
        to: '/course/' + step.course.id,
        onOpen,
      },
    });
    if (prev) edge(prev, 'spine', courseId, true);
    prev = courseId;
    y += COURSE_H + ROW_GAP;

    const studiedMap = byCourse[step.course.id] || {};
    step.modules.forEach((mod, mi) => {
      const modId = 'm-' + step.course.id + '-' + mod.id;
      const side = mi % 2 === 0 ? 'right' : 'left';
      const done = mod.topics.filter((t) => studiedMap[t.id]).length;
      const cH = clusterHeight(mod.topics.length);
      const rowH = Math.max(MODULE_H, cH);

      nodes.push({
        id: modId,
        type: 'module',
        position: { x: -MODULE_W / 2, y: y + (rowH - MODULE_H) / 2 },
        data: {
          title: mod.title,
          done,
          total: mod.topics.length,
          complete: done >= mod.topics.length,
          side,
          to: '/course/' + step.course.id + '/topic/' + mod.topics[0].id,
          onOpen,
        },
      });
      edge(prev, 'spine', modId, true);
      prev = modId;

      const clusterId = 'g-' + step.course.id + '-' + mod.id;
      const cx =
        side === 'right' ? MODULE_W / 2 + BRANCH_GAP : -MODULE_W / 2 - BRANCH_GAP - CLUSTER_W;
      nodes.push({
        id: clusterId,
        type: 'cluster',
        position: { x: cx, y: y + (rowH - cH) / 2 },
        data: {
          side,
          onOpen,
          topics: mod.topics.map((t) => ({
            id: t.id,
            title: t.title,
            studied: Boolean(studiedMap[t.id]),
            to: '/course/' + step.course.id + '/topic/' + t.id,
          })),
        },
      });
      edge(modId, 'branch', clusterId, false);

      y += rowH + ROW_GAP;
    });

    y += COURSE_GAP;
  });

  const halfWidth = MODULE_W / 2 + BRANCH_GAP + CLUSTER_W;
  return { nodes, edges, graphWidth: halfWidth * 2, graphHeight: Math.max(y - ROW_GAP, 200), minX: -halfWidth };
}

/* ---- component ------------------------------------------------------- */

export default function PathFlow({ steps, byCourse, currentIndex }) {
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  // State, not a ref: the viewport effect must re-run once React Flow is ready.
  const [instance, setInstance] = useState(null);
  const [width, setWidth] = useState(0);

  const graph = useMemo(
    () => buildGraph(steps, byCourse, currentIndex, (to) => navigate(to)),
    [steps, byCourse, currentIndex, navigate],
  );

  // Track the container width so the roadmap always fits it.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const zoom = width ? Math.min(1, Math.max(0.42, (width - 24) / graph.graphWidth)) : 1;
  const height = graph.graphHeight * zoom + 48;

  // Fit to width, pinned to the top: the page scrolls, the canvas never does.
  useEffect(() => {
    if (!instance || !width) return;
    instance.setViewport({
      x: (width - graph.graphWidth * zoom) / 2 - graph.minX * zoom,
      y: 24,
      zoom,
    });
  }, [instance, width, zoom, graph]);

  return (
    <div className="pathflow" ref={wrapRef} style={{ height }}>
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        onInit={setInstance}
        /* Fully static: the page owns scrolling, not the canvas. */
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnScroll={false}
        panOnDrag={false}
        preventScrolling={false}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}
