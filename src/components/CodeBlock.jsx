import { useMemo, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';

hljs.registerLanguage('python', python);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);

const LANG_LABEL = { python: 'Python', json: 'JSON', bash: 'Shell' };

/**
 * A VS Code-style code block: window chrome with a language label and copy
 * button, a line-number gutter, and syntax highlighting (highlight.js). The
 * gutter aligns because code lines do not wrap; the block scrolls horizontally.
 */
export default function CodeBlock({ code, language = 'python', filename }) {
  const [copied, setCopied] = useState(false);
  const source = code.replace(/\n+$/, '');

  const html = useMemo(() => {
    try {
      return hljs.highlight(source, { language }).value;
    } catch {
      return hljs.highlightAuto(source).value;
    }
  }, [source, language]);

  const lineCount = source.split('\n').length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked; ignore */
    }
  };

  return (
    <div className="codeblock">
      <div className="codeblock__bar">
        <span className="codeblock__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="codeblock__name mono">{filename || LANG_LABEL[language] || language}</span>
        <button type="button" className="codeblock__copy" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="codeblock__body">
        <ol className="codeblock__gutter" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <li key={i}>{i + 1}</li>
          ))}
        </ol>
        <pre className="codeblock__pre">
          <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      </div>
    </div>
  );
}
