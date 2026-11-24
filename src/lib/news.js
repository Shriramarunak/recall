/**
 * AI news from the Hacker News Algolia API (public, CORS-enabled, read-only).
 * https://hn.algolia.com/api
 */
const BASE = 'https://hn.algolia.com/api/v1';

export const TOPICS = [
  { id: 'ai', label: 'AI', query: 'artificial intelligence' },
  { id: 'llm', label: 'LLMs', query: 'LLM' },
  { id: 'genai', label: 'GenAI', query: 'generative AI' },
  { id: 'agents', label: 'Agents', query: 'AI agents' },
  { id: 'rag', label: 'RAG', query: 'RAG retrieval' },
  { id: 'langchain', label: 'LangChain', query: 'LangChain' },
  { id: 'openai', label: 'OpenAI', query: 'OpenAI' },
];

/**
 * Fetch stories, scoped to the last `windowDays` so results are current.
 * `sort` is 'top' (most relevant recent stories with some traction) or
 * 'recent' (newest first).
 */
export async function fetchNews({ query, sort = 'top', hitsPerPage = 30, windowDays = 30, signal } = {}) {
  const path = sort === 'recent' ? 'search_by_date' : 'search';
  const since = Math.floor(Date.now() / 1000) - windowDays * 86400;
  const filters = ['created_at_i>' + since];
  if (sort === 'top') filters.push('points>5');

  const params = new URLSearchParams({
    query: query || '',
    tags: 'story',
    hitsPerPage: String(hitsPerPage),
    numericFilters: filters.join(','),
  });

  const res = await fetch(`${BASE}/${path}?${params.toString()}`, { signal });
  if (!res.ok) throw new Error('News request failed (' + res.status + ')');
  const data = await res.json();
  return (data.hits || [])
    .filter((h) => h.title)
    .map((h) => ({
      id: h.objectID,
      title: h.title,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      hnUrl: `https://news.ycombinator.com/item?id=${h.objectID}`,
      domain: domainOf(h.url),
      points: h.points || 0,
      comments: h.num_comments || 0,
      author: h.author,
      createdAt: h.created_at_i ? h.created_at_i * 1000 : Date.parse(h.created_at),
    }));
}

function domainOf(url) {
  if (!url) return 'news.ycombinator.com';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function timeAgo(ms) {
  if (!ms) return '';
  const secs = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [name, size] of units) {
    const value = Math.floor(secs / size);
    if (value >= 1) return value + ' ' + name + (value > 1 ? 's' : '') + ' ago';
  }
  return 'just now';
}
