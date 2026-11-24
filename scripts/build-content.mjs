/**
 * Content build step.
 *
 * Reads the original single-file study lab and writes normalized course JSON
 * into src/data. Run it again whenever the source lab changes:
 *
 *   npm run data:build
 *
 * The output shape is the same shape a future API will return, so the app
 * never has to change when the data moves to a server.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE = process.argv[2] || 'C:/Users/HP/Downloads/GenAI_Engineering_Interview_Lab_V2.html';
const BACKSLASH = String.fromCharCode(92);

/** Pull the `const DATA=[...]` literal out of the source file. */
function readSourceTopics(file) {
  const html = fs.readFileSync(file, 'utf8');
  const start = html.indexOf('const DATA=') + 'const DATA='.length;
  let depth = 0;
  let end = -1;
  let inString = false;
  let escaped = false;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === BACKSLASH) escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  if (end === -1) throw new Error('Could not find the DATA array in ' + file);
  return JSON.parse(html.slice(start, end));
}

const slug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Reading time, rounded to a believable number of minutes. */
function minutesFor(topic) {
  const words = [topic.concept, topic.example, topic.answer]
    .concat(topic.steps, topic.tradeoffs, topic.followups.flat())
    .join(' ')
    .split(/\s+/).length;
  return Math.max(6, Math.round(words / 90) * 2);
}

/** Editorial notes for each track. Keyed by the group name in the source. */
const MODULE_NOTES = {
  'Foundations': 'Where retrieval fits, and the problems it does not solve.',
  'Ingestion': 'Turning source documents into units a retriever can actually find.',
  'Retrieval': 'Embeddings, indexes, filters and the two ways to match a query.',
  'Optimization': 'Everything that happens between a first-pass hit list and a usable context.',
  'Architectures': 'Composed pipelines: hybrid fusion and agentic retrieval loops.',
  'Quality & evaluation': 'Separating retrieval failure from generation failure.',
  'Enterprise Architecture': 'Permissions, caching, scale and the ingestion/serving split.',
  'Transformers': 'The machinery under the model: attention, position, and the KV cache.',
  'Fine-tuning': 'Choosing between prompting, retrieval and weight updates — then doing it safely.',
  'Evals & RAGAS': 'Metrics, judges, golden sets and the gates that keep a release honest.',
  'Red Teaming': 'Injection, poisoning, exfiltration, and how you regression-test defenses.',
  'Context Engineering': 'Budgeting the window and ranking instructions by provenance.',
  'Agents': 'When a loop beats a workflow, and how tool calling is actually wired.',
  'Sub-agents': 'Supervisors, specialists, handoffs and shared state.',
  'Agent Memory': 'Four memory types, how they are retrieved, and how they go wrong.',
  'Loop Engineering': 'Stop conditions, verification, critique and recovery.',
  'Harness Engineering': 'The runtime around the model: sandboxes, hooks, replay.',
  'Hallucinations': 'A taxonomy of wrong answers and the defenses per class.',
  'LLMOps': 'Serving, batching, routing and fallbacks in production.',
  'System Design': 'Two long-form scenarios to talk through end to end.',
  'Coding Lab': 'Write the retrieval and evaluation code yourself.',
};

const source = readSourceTopics(SOURCE);

const moduleOrder = [...new Set(source.map((t) => t.group))];
const modules = moduleOrder.map((name, index) => ({
  id: slug(name),
  title: name,
  order: index + 1,
  note: MODULE_NOTES[name] || '',
}));

const topics = source.map((topic, index) => ({
  id: slug(topic.name),
  moduleId: slug(topic.group),
  order: index + 1,
  title: topic.name,
  minutes: minutesFor(topic),
  concept: topic.concept,
  example: topic.example,
  interviewAnswer: topic.answer,
  steps: topic.steps || [],
  tradeoffs: topic.tradeoffs || [],
  followUps: (topic.followups || []).map(([question, answer]) => ({ question, answer })),
  code: (topic.code || '').trim() || null,
}));

const course = {
  id: 'genai-engineering',
  schemaVersion: 1,
  title: 'GenAI Engineering',
  subtitle: 'Retrieval, transformers, agents and the evaluation work that keeps them honest.',
  level: 'Mid to senior',
  updatedAt: new Date().toISOString().slice(0, 10),
  modules,
  topics,
};

const outDir = path.join(ROOT, 'src', 'data', 'courses');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, course.id + '.json'), JSON.stringify(course, null, 2) + '\n');

const catalog = {
  schemaVersion: 1,
  courses: [
    {
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      level: course.level,
      updatedAt: course.updatedAt,
      moduleCount: modules.length,
      topicCount: topics.length,
      minutes: topics.reduce((sum, t) => sum + t.minutes, 0),
      tags: ['RAG', 'Transformers', 'Agents', 'Evals', 'Red teaming'],
      status: 'published',
    },
  ],
};
fs.writeFileSync(path.join(ROOT, 'src', 'data', 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');

console.log(
  'Wrote ' + topics.length + ' topics across ' + modules.length + ' modules to src/data/courses/' + course.id + '.json',
);
