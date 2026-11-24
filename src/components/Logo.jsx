/** Mark: a ranked hit list, three bars descending by score. */
export default function Logo({ tone = 'dark' }) {
  return (
    <span className={'logo logo--' + tone} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22" role="presentation">
        <rect x="3" y="4.5" width="18" height="3.6" rx="1.8" />
        <rect x="3" y="10.2" width="12" height="3.6" rx="1.8" />
        <rect x="3" y="15.9" width="6.5" height="3.6" rx="1.8" />
      </svg>
    </span>
  );
}
