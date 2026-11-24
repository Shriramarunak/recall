import { useEffect, useRef, useState } from 'react';
import BackLink from '../components/BackLink';
import Icon from '../components/Icon';
import { TOPICS, fetchNews, timeAgo } from '../lib/news';

export default function NewsPage() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [customQuery, setCustomQuery] = useState('');
  const [sort, setSort] = useState('top');
  const [state, setState] = useState({ status: 'loading', stories: [], error: null });
  const debounce = useRef(null);

  const query = customQuery.trim() || topic.query;

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, status: 'loading' }));
    fetchNews({ query, sort, signal: controller.signal })
      .then((stories) => setState({ status: 'ready', stories, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', stories: [], error });
      });
    return () => controller.abort();
  }, [query, sort]);

  const onSearch = (value) => {
    setCustomQuery(value);
    clearTimeout(debounce.current);
  };

  return (
    <section className="shell page-pad news">
      <BackLink to="/" label="Home" />
      <header className="news__head">
        <span className="mono section__kicker">Hacker News · AI</span>
        <h1 className="news__title">AI in the news</h1>
        <p className="news__lede">
          Live AI, LLM and GenAI stories from Hacker News. Pick a topic or search, and sort by top or
          most recent.
        </p>
      </header>

      <div className="news__controls">
        <div className="news__topics" role="group" aria-label="Topic">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={'news__chip' + (!customQuery && topic.id === t.id ? ' is-on' : '')}
              onClick={() => {
                setCustomQuery('');
                setTopic(t);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="news__tools">
          <label className="news__search">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="Search stories"
              value={customQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
          </label>
          <div className="switch" role="group" aria-label="Sort">
            {[
              { id: 'top', label: 'Top' },
              { id: 'recent', label: 'Recent' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                className={'switch__option' + (sort === option.id ? ' is-on' : '')}
                onClick={() => setSort(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {state.status === 'loading' && <p className="news__status">Loading stories…</p>}
      {state.status === 'error' && (
        <div className="news__status card">
          <p>Could not reach Hacker News right now.</p>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => setSort((s) => s)}>
            Try again
          </button>
        </div>
      )}
      {state.status === 'ready' && state.stories.length === 0 && (
        <p className="news__status">No stories for “{query}”. Try another topic.</p>
      )}

      {state.status === 'ready' && state.stories.length > 0 && (
        <ol className="news__list">
          {state.stories.map((story, i) => (
            <li key={story.id} className="story card">
              <span className="mono story__rank">{String(i + 1).padStart(2, '0')}</span>
              <div className="story__body">
                <a className="story__title" href={story.url} target="_blank" rel="noopener noreferrer">
                  {story.title}
                </a>
                <div className="story__meta mono">
                  <span className="story__domain">{story.domain}</span>
                  <span>{story.points} points</span>
                  <a href={story.hnUrl} target="_blank" rel="noopener noreferrer">
                    {story.comments} comments
                  </a>
                  <span>{story.author}</span>
                  <span>{timeAgo(story.createdAt)}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <p className="news__attr mono">Stories via the Hacker News Algolia API. Links open on the source site.</p>
    </section>
  );
}
