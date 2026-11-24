/**
 * Hero image: a stylised screenshot of the lesson reader, framed in a window.
 * Pure inline SVG so it stays crisp at any size and needs no asset request.
 * Monochrome, to match the calm reading theme.
 */
export default function HeroImage() {
  return (
    <svg
      className="hero-img"
      viewBox="0 0 580 452"
      role="img"
      aria-label="Preview of a Recall lesson, showing the concept, the spoken interview answer and follow-up questions."
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* depth panels behind the window */}
      <rect x="40" y="56" width="520" height="372" rx="4" fill="#646464" opacity="0.22" />
      <rect x="24" y="40" width="520" height="372" rx="4" fill="#ffffff" opacity="0.08" />

      {/* window */}
      <g>
        <rect x="12" y="24" width="520" height="404" rx="4" fill="#ffffff" stroke="#e2e2e2" />
        {/* title bar */}
        <rect x="12" y="24" width="520" height="40" rx="4" fill="#f3f3f3" />
        <rect x="12" y="60" width="520" height="1" fill="#e2e2e2" />
        <rect x="30" y="40" width="9" height="9" rx="1.5" fill="#646464" />
        <rect x="46" y="40" width="9" height="9" rx="1.5" fill="#cfcfcf" />
        <rect x="62" y="40" width="9" height="9" rx="1.5" fill="#cfcfcf" />
        <rect x="210" y="37" width="140" height="15" rx="2" fill="#e6e6e6" />

        {/* sidebar */}
        <rect x="12" y="61" width="150" height="367" fill="#fafafa" />
        <rect x="12" y="61" width="150" height="367" fill="none" stroke="#ececec" />
        <rect x="28" y="82" width="118" height="20" rx="2" fill="#ffffff" stroke="#e2e2e2" />
        <rect x="36" y="89" width="9" height="6" rx="1" fill="#a8a8a8" />
        <rect x="52" y="89" width="60" height="6" rx="3" fill="#cfcfcf" />
        {[124, 150, 176].map((y) => (
          <g key={y}>
            <rect x="28" y={y} width="14" height="8" rx="1" fill="#ececec" />
            <rect x="50" y={y + 1} width="86" height="6" rx="3" fill="#e0e0e0" />
          </g>
        ))}
        {/* active sidebar row */}
        <rect x="20" y="200" width="134" height="26" rx="2" fill="#131313" />
        <rect x="30" y="209" width="14" height="8" rx="1" fill="#f3f3f3" />
        <rect x="52" y="210" width="78" height="6" rx="3" fill="#cfcfcf" />
        {[244, 270, 296, 322, 348].map((y) => (
          <g key={y}>
            <rect x="28" y={y} width="14" height="8" rx="1" fill="#ececec" />
            <rect x="50" y={y + 1} width={y % 3 ? 72 : 90} height="6" rx="3" fill="#e0e0e0" />
          </g>
        ))}

        {/* reader content */}
        <rect x="186" y="84" width="46" height="13" rx="2" fill="#e4e4e4" />
        <rect x="186" y="106" width="150" height="20" rx="2" fill="#131313" />
        <rect x="346" y="109" width="30" height="14" rx="2" fill="none" stroke="#e2e2e2" />

        {/* concept lines */}
        <rect x="186" y="150" width="56" height="6" rx="3" fill="#131313" />
        <rect x="186" y="168" width="316" height="7" rx="3.5" fill="#e0e0e0" />
        <rect x="186" y="183" width="316" height="7" rx="3.5" fill="#e0e0e0" />
        <rect x="186" y="198" width="232" height="7" rx="3.5" fill="#e0e0e0" />

        {/* "say this in the room" answer block */}
        <rect x="186" y="228" width="316" height="104" rx="3" fill="#131313" />
        <rect x="186" y="228" width="4" height="104" fill="#b5b5b5" />
        <rect x="206" y="248" width="70" height="6" rx="3" fill="#b5b5b5" />
        <rect x="206" y="268" width="276" height="7" rx="3.5" fill="#4a4a4a" />
        <rect x="206" y="284" width="276" height="7" rx="3.5" fill="#4a4a4a" />
        <rect x="206" y="300" width="214" height="7" rx="3.5" fill="#4a4a4a" />

        {/* follow-ups */}
        <rect x="186" y="356" width="316" height="1" fill="#e2e2e2" />
        <rect x="186" y="372" width="180" height="7" rx="3.5" fill="#c4c4c4" />
        <rect x="492" y="371" width="10" height="9" rx="1" fill="#c4c4c4" />
        <rect x="186" y="392" width="316" height="1" fill="#efefef" />
        <rect x="186" y="404" width="150" height="7" rx="3.5" fill="#d4d4d4" />
      </g>
    </svg>
  );
}
