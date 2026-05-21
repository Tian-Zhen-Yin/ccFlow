/**
 * SVG 视觉效果增强器
 *
 * 为 mmdc 生成的 SVG 注入暗黑科技风视觉元素：
 * - 赛博网格背景 (#0A0A0F + #161624 网格)
 * - 霓虹发光滤镜 (feGaussianBlur)
 * - 自定义字体栈
 */

const CYBER_DEFS = `<defs>
<pattern id="cyber-grid" width="24" height="24" patternUnits="userSpaceOnUse">
  <rect width="24" height="24" fill="#0A0A0F"/>
  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#161624" stroke-width="0.5"/>
</pattern>
<filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
  <feMerge>
    <feMergeNode in="blur"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
</defs>`;

export function enhanceSvg(svg) {
  // 1. Inject cyber defs after </style> (if present) or after opening <svg>
  const styleEnd = svg.match(/<\/style>/);
  const insertPos = styleEnd
    ? styleEnd.index + styleEnd[0].length
    : svg.indexOf('>') + 1;

  let result = svg.slice(0, insertPos) + CYBER_DEFS + svg.slice(insertPos);

  // 2. Inject dark background rect as first child inside root <g>
  const vbMatch = result.match(/viewBox="([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)"/);
  if (vbMatch) {
    const [, vx, vy, vw, vh] = vbMatch;
    const bgRect = `<rect width="${vw}" height="${vh}" fill="url(#cyber-grid)" style="pointer-events:none"/>`;
    const rootG = result.match(/<g[^>]*class="root"[^>]*>/);
    if (rootG) {
      const at = rootG.index + rootG[0].length;
      result = result.slice(0, at) + bgRect + result.slice(at);
    }
  }

  // 3. Upgrade font stack
  result = result.replace(
    '"trebuchet ms",verdana,arial,sans-serif',
    '"ui-sans-serif","system-ui",sans-serif',
  );

  return result;
}
