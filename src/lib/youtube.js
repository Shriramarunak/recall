/**
 * Playlist contents without an API key, via public Piped instances (CORS-enabled,
 * read-only). Thumbnails come straight from YouTube's image host so they never
 * depend on the proxy. If every instance is unreachable, the caller falls back
 * to the embedded playlist player.
 */
const INSTANCES = [
  'https://api.piped.private.coffee',
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://pipedapi.reallyaweso.me',
];

// Race each instance against a timeout so a hanging host can't block the rest.
function fetchWithTimeout(url, signal, ms = 7000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  if (signal) signal.addEventListener('abort', () => ctrl.abort(), { once: true });
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

const videoIdFromUrl = (url) => {
  if (!url) return null;
  const match = url.match(/[?&]v=([^&]+)/) || url.match(/\/watch\/([^?&]+)/);
  return match ? match[1] : null;
};

export async function fetchPlaylistVideos(playlistId, signal) {
  let lastError;
  for (const base of INSTANCES) {
    try {
      const res = await fetchWithTimeout(`${base}/playlists/${playlistId}`, signal);
      if (!res.ok) throw new Error('status ' + res.status);
      const data = await res.json();
      const streams = data.relatedStreams || [];
      const videos = streams
        .map((s) => ({
          id: videoIdFromUrl(s.url),
          title: s.title,
          uploader: s.uploaderName,
          duration: s.duration, // seconds; -1 for live
        }))
        .filter((v) => v.id);
      if (videos.length) return { title: data.name, videos };
      throw new Error('empty playlist');
    } catch (error) {
      // Stop only if the CALLER aborted (unmount); a per-instance timeout just
      // means move on to the next instance.
      if (signal && signal.aborted) throw error;
      lastError = error;
    }
  }
  throw lastError || new Error('Could not load the playlist');
}

export const thumbnailUrl = (id) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

export function formatClip(secs) {
  if (!secs || secs < 0) return 'live';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
