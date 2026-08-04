/* ==========================================================================
   season-art.js — a small hand-drawn scene for each of the 13 units.

   Not photographs, on purpose. A hotlinked photo is a network request that
   can fail or crawl on bad data, and a bundled one is the opposite of "low
   data". These are inline vector line-art in the same stroke style as the
   rest of the site's icons — a few hundred bytes each, thirteen of them
   together still under 5KB, and they render instantly with no request at
   all. currentColor is used throughout so the card CSS controls the tint:
   gold when a unit is open, dim grey when it is locked.
   ========================================================================== */

const WRAP_OPEN =
  '<svg viewBox="0 0 240 150" fill="none" stroke="currentColor" ' +
  'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">';
const WRAP_CLOSE = '</svg>';

const scene = (inner) => WRAP_OPEN + inner + WRAP_CLOSE;

/* 1 — Concepts of ICT: a small network, the idea of things connected */
const s1 = scene(`
  <circle cx="120" cy="75" r="46"/>
  <ellipse cx="120" cy="75" rx="46" ry="17"/>
  <path d="M74 75h92M120 29v92"/>
  <path d="M120 75 70 40M120 75 176 48M120 75 190 106"/>
  <circle cx="120" cy="75" r="3" fill="currentColor" stroke="none"/>
  <circle cx="70" cy="40" r="3" fill="currentColor" stroke="none"/>
  <circle cx="176" cy="48" r="3" fill="currentColor" stroke="none"/>
  <circle cx="190" cy="106" r="3" fill="currentColor" stroke="none"/>`);

/* 2 — Evolution of Computers: monitor to chip, along a timeline */
const s2 = scene(`
  <rect x="18" y="34" width="48" height="38" rx="3"/>
  <path d="M32 72h20M42 72v10"/>
  <path d="M14 118h212" stroke-dasharray="2 8"/>
  <path d="M96 58h44v24H96z"/><path d="M88 82h60l6 10H82z"/>
  <rect x="176" y="44" width="36" height="36" rx="6"/>
  <path d="M186 44v-9M200 44v-9M186 80v9M200 80v9M176 55h-9M176 69h-9M212 55h9M212 69h9"/>`);

/* 3 — Data Representation: binary rows, and the hex it becomes */
const s3 = scene(`
  <text x="24" y="44" font-family="ui-monospace,monospace" font-size="15" fill="currentColor" stroke="none">01001</text>
  <text x="24" y="66" font-family="ui-monospace,monospace" font-size="15" fill="currentColor" stroke="none">11010</text>
  <text x="24" y="88" font-family="ui-monospace,monospace" font-size="15" fill="currentColor" stroke="none">00110</text>
  <text x="24" y="110" font-family="ui-monospace,monospace" font-size="15" fill="currentColor" stroke="none">10101</text>
  <path d="M138 76h20"/>
  <rect x="160" y="54" width="60" height="36" rx="6"/>
  <text x="172" y="78" font-family="ui-monospace,monospace" font-size="17" fill="currentColor" stroke="none">1A3F</text>`);

/* 4 — Digital Circuits: a logic gate, signal in and out */
const s4 = scene(`
  <path d="M30 55h30M30 85h30"/>
  <path d="M60 40h28a30 30 0 0 1 0 60H60z"/>
  <path d="M122 70h26"/>
  <circle cx="156" cy="70" r="4"/>
  <path d="M170 40l42 30-42 30z"/>
  <path d="M212 70h20"/>
  <circle cx="60" cy="55" r="2.4" fill="currentColor" stroke="none"/>
  <circle cx="60" cy="85" r="2.4" fill="currentColor" stroke="none"/>`);

/* 5 — Operating Systems: layers stacked, kernel up through apps */
const s5 = scene(`
  <rect x="38" y="28" width="164" height="27" rx="6"/>
  <rect x="38" y="62" width="164" height="27" rx="6"/>
  <rect x="38" y="96" width="164" height="27" rx="6"/>
  <circle cx="54" cy="41.5" r="2.6" fill="currentColor" stroke="none"/>
  <circle cx="54" cy="75.5" r="2.6" fill="currentColor" stroke="none"/>
  <circle cx="54" cy="109.5" r="2.6" fill="currentColor" stroke="none"/>`);

/* 6 — Data Communication and Networks: a tower, signal, and devices */
const s6 = scene(`
  <path d="M120 128V68M104 68l16-40 16 40z"/>
  <circle cx="120" cy="18" r="5"/>
  <path d="M92 55a40 40 0 0 1 56 0M80 42a56 56 0 0 1 80 0"/>
  <circle cx="42" cy="112" r="11"/><circle cx="198" cy="112" r="11"/>
  <path d="M53 106 106 76M187 106 134 76"/>`);

/* 7 — System Analysis and Design: the flowchart the subject is named for */
const s7 = scene(`
  <rect x="18" y="20" width="60" height="28" rx="6"/>
  <path d="M78 34h24"/>
  <path d="M134 16l30 20-30 20-30-20z"/>
  <path d="M134 56v22"/>
  <rect x="102" y="82" width="64" height="28" rx="6"/>
  <path d="M166 96h26"/>
  <rect x="196" y="82" width="30" height="28" rx="6"/>`);

/* 8 — Database Management: the cylinder, and the table beside it */
const s8 = scene(`
  <ellipse cx="66" cy="32" rx="34" ry="11"/>
  <path d="M32 32v58a34 11 0 0 0 68 0V32"/>
  <path d="M32 53a34 11 0 0 0 68 0M32 75a34 11 0 0 0 68 0"/>
  <rect x="140" y="38" width="72" height="60" rx="4"/>
  <path d="M140 58h72M140 78h72M164 38v60M188 38v60"/>`);

/* 9 — Programming with Python: a terminal, mid-command */
const s9 = scene(`
  <rect x="26" y="24" width="188" height="102" rx="8"/>
  <path d="M26 46h188"/>
  <circle cx="42" cy="35" r="3" fill="currentColor" stroke="none"/>
  <circle cx="55" cy="35" r="3" fill="currentColor" stroke="none"/>
  <circle cx="68" cy="35" r="3" fill="currentColor" stroke="none"/>
  <path d="M50 70l18 14-18 14"/>
  <path d="M84 98h56"/>`);

/* 10 — Web Development: a browser, and the tags underneath */
const s10 = scene(`
  <rect x="22" y="26" width="196" height="100" rx="8"/>
  <path d="M22 48h196"/>
  <circle cx="40" cy="37" r="3" fill="currentColor" stroke="none"/>
  <circle cx="53" cy="37" r="3" fill="currentColor" stroke="none"/>
  <circle cx="66" cy="37" r="3" fill="currentColor" stroke="none"/>
  <path d="M76 92l-18-14 18-14M164 64l18 14-18 14M126 60l-14 48"/>`);

/* 11 — Internet of Things: one hub, everything talking to it */
const s11 = scene(`
  <circle cx="120" cy="75" r="15"/>
  <circle cx="120" cy="75" r="3" fill="currentColor" stroke="none"/>
  <path d="M120 60V30M120 90v30M105 75H34M135 75h71"/>
  <rect x="26" y="22" width="18" height="18" rx="3"/>
  <rect x="196" y="22" width="18" height="18" rx="3"/>
  <rect x="26" y="110" width="18" height="18" rx="3"/>
  <rect x="196" y="110" width="18" height="18" rx="3"/>`);

/* 12 — ICT in Business: the chart every proposal ends with */
const s12 = scene(`
  <path d="M28 122V38M28 122h188"/>
  <rect x="48" y="90" width="20" height="32"/>
  <rect x="88" y="68" width="20" height="54"/>
  <rect x="128" y="48" width="20" height="74"/>
  <rect x="168" y="28" width="20" height="94"/>
  <path d="M48 84 88 60 128 40 168 20" stroke-dasharray="2 7"/>`);

/* 13 — New Trends and Future Directions: what comes next */
const s13 = scene(`
  <ellipse cx="120" cy="82" rx="72" ry="24" transform="rotate(-16 120 82)"/>
  <path d="M120 34c15 11 21 27 21 44s-6 33-21 44c-15-11-21-27-21-44s6-33 21-44z"/>
  <circle cx="120" cy="58" r="7"/>
  <path d="M106 100l-15 15M134 100l15 15M110 122h20"/>
  <circle cx="182" cy="44" r="3" fill="currentColor" stroke="none"/>`);

const SCENES = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13];

/** The scene for unit n (1-13). Falls back to the network scene if n is
 * out of range, so a data mistake shows something rather than nothing. */
export function svgFor(n) {
  return SCENES[Number(n) - 1] || s1;
}
