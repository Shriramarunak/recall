import { useEffect, useState } from 'react';
import BackLink from '../components/BackLink';
import Icon from '../components/Icon';
import { fetchPlaylistVideos, thumbnailUrl, formatClip } from '../lib/youtube';

const PLAYLIST_ID = 'PLMq8QIzlRHYdPxa2JDjOYKKrpamSPk7yi';
const PLAYLIST_URL = 'https://youtube.com/playlist?list=' + PLAYLIST_ID;
const NOCOOKIE = 'https://www.youtube-nocookie.com/embed/';

export default function VideosPage() {
  const [state, setState] = useState({ status: 'loading', videos: [], error: null });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchPlaylistVideos(PLAYLIST_ID, controller.signal)
      .then(({ videos }) => {
        setState({ status: 'ready', videos, error: null });
        setSelected(videos[0] ? videos[0].id : null);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', videos: [], error });
      });
    return () => controller.abort();
  }, []);

  // Selected video keeps the playlist context so the player's own list still works.
  const playerSrc =
    state.status === 'ready' && selected
      ? `${NOCOOKIE}${selected}?rel=0&list=${PLAYLIST_ID}`
      : `${NOCOOKIE}videoseries?list=${PLAYLIST_ID}&rel=0`;

  return (
    <section className="shell page-pad videos">
      <BackLink to="/" label="Home" />
      <header className="videos__head">
        <span className="mono section__kicker">Watch</span>
        <h1 className="videos__title">Video course</h1>
        <p className="videos__lede">
          A curated YouTube playlist to pair with the lessons. Pick a video from the list, or open the
          full playlist on YouTube.
        </p>
      </header>

      <div className="videos__layout">
        <div className="videos__main">
          <div className="videos__player">
            <iframe
              key={selected || 'series'}
              src={playerSrc}
              title="Recall video playlist"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="videos__foot">
            <a className="btn btn--outline btn--sm" href={PLAYLIST_URL} target="_blank" rel="noopener noreferrer">
              Open on YouTube <Icon name="arrow-right" size={15} />
            </a>
            <span className="mono videos__note">Plays from YouTube. Nothing you do here is sent elsewhere.</span>
          </div>
        </div>

        <aside className="videos__list" aria-label="Playlist">
          {state.status === 'loading' && <p className="videos__status">Loading the playlist…</p>}

          {state.status === 'error' && (
            <p className="videos__status">
              The video list could not load, so the embedded playlist player is shown instead. Use its
              own list control to move between videos.
            </p>
          )}

          {state.status === 'ready' && (
            <>
              <p className="mono videos__count">{state.videos.length} videos</p>
              <ol className="vlist">
                {state.videos.map((video, i) => (
                  <li key={video.id}>
                    <button
                      type="button"
                      className={'vitem' + (video.id === selected ? ' is-active' : '')}
                      onClick={() => setSelected(video.id)}
                    >
                      <span className="vitem__thumb">
                        <img src={thumbnailUrl(video.id)} alt="" loading="lazy" />
                        <span className="mono vitem__dur">{formatClip(video.duration)}</span>
                        {video.id === selected && <span className="vitem__playing" aria-hidden="true" />}
                      </span>
                      <span className="vitem__body">
                        <span className="mono vitem__num">{String(i + 1).padStart(2, '0')}</span>
                        <span className="vitem__title">{video.title}</span>
                        {video.uploader && <span className="vitem__by">{video.uploader}</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
