/**
 * Inline SVG icons. One stroke-based set so every glyph shares weight, caps and
 * scale and inherits colour from `currentColor` — no icon font, no emoji.
 */
const PATHS = {
  'arrow-right': <path d="M4 12h15m0 0-6-6m6 6-6 6" />,
  'arrow-left': <path d="M20 12H5m0 0 6-6m-6 6 6 6" />,
  refresh: (
    <>
      <path d="M20 11a8 8 0 1 0-.9 4.6" />
      <path d="M20 5v6h-6" />
    </>
  ),
  check: <path d="m4.5 12.5 4.5 4.5 10.5-11" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.6-3.6" />
    </>
  ),
  flag: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h11l-2.2 3.6L16 11H5" />
    </>
  ),
  book: (
    <>
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z" />
      <path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19" />
    </>
  ),
  cards: (
    <>
      <rect x="3" y="7.5" width="13" height="13" rx="2" />
      <path d="M7.5 4.2 18 6.6a2 2 0 0 1 1.5 2.4l-2 9" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <path d="M12 17v4m-3 0h6" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.4" />
    </>
  ),
};

export default function Icon({ name, size = 18, className }) {
  const glyph = PATHS[name];
  if (!glyph) return null;
  return (
    <svg
      className={'icon' + (className ? ' ' + className : '')}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {glyph}
    </svg>
  );
}
