import { useMemo } from 'react';
import glossary from '../data/glossary.json';

/**
 * Renders a string, auto-linking the first mention of any glossary term with a
 * hover/focus definition. Case-insensitive, whole-word, longest-match-first so
 * "vector database" wins over "vector". Each term is linked once per passage to
 * avoid a sea of underlines.
 */
const ENTRIES = glossary.terms
  .flatMap((entry) => [entry.term, ...(entry.aliases || [])].map((label) => ({ label, def: entry.definition, term: entry.term })))
  .sort((a, b) => b.label.length - a.label.length);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PATTERN = new RegExp('\\b(' + ENTRIES.map((e) => escapeRe(e.label)).join('|') + ')\\b', 'gi');

function findDef(label) {
  const lower = label.toLowerCase();
  return ENTRIES.find((e) => e.label.toLowerCase() === lower);
}

export default function GlossaryText({ children }) {
  const text = typeof children === 'string' ? children : '';
  const parts = useMemo(() => {
    if (!text) return [];
    const seen = new Set();
    const out = [];
    let last = 0;
    let match;
    PATTERN.lastIndex = 0;
    while ((match = PATTERN.exec(text)) !== null) {
      const entry = findDef(match[0]);
      const key = entry && entry.term.toLowerCase();
      if (!entry || seen.has(key)) continue;
      seen.add(key);
      if (match.index > last) out.push(text.slice(last, match.index));
      out.push(
        <span key={match.index} className="gloss" tabIndex={0}>
          {match[0]}
          <span className="gloss__pop" role="tooltip">
            <strong>{entry.term}</strong>
            {entry.def}
          </span>
        </span>,
      );
      last = match.index + match[0].length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }, [text]);

  if (!text) return children;
  return <>{parts}</>;
}
