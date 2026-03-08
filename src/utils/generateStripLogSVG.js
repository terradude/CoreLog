// Generates an HTML document with an embedded, depth-scaled SVG strip log.
// Pure JS — no React Native imports. Safe for use with expo-print.

import {
  computeStripLayout, contactPathD, contactDash, majorMinorTicks,
  STRIP_HEADER_H, STRIP_COL_HEADER_H,
  GRAIN_WIDTH_MAP, grainColor, getIntervalValue,
} from './computeStripLayout';

// ─── SVG Lithology pattern defs ─────────────────────────────────────────────

function patternDefs() {
  return `<defs>
<pattern id="pp_brick" x="0" y="0" width="20" height="10" patternUnits="userSpaceOnUse">
  <rect width="20" height="10" fill="#b8d4f0"/>
  <line x1="0" y1="5" x2="20" y2="5" stroke="#4a90d9" stroke-width="0.7"/>
  <line x1="0" y1="0" x2="0" y2="5" stroke="#4a90d9" stroke-width="0.7"/>
  <line x1="10" y1="0" x2="10" y2="5" stroke="#4a90d9" stroke-width="0.7"/>
  <line x1="5" y1="5" x2="5" y2="10" stroke="#4a90d9" stroke-width="0.7"/>
  <line x1="15" y1="5" x2="15" y2="10" stroke="#4a90d9" stroke-width="0.7"/>
</pattern>
<pattern id="pp_rhombus" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
  <rect width="14" height="14" fill="#c8e0b0"/>
  <path d="M7 0 L14 7 L7 14 L0 7 Z" fill="none" stroke="#5a9e4a" stroke-width="0.9"/>
</pattern>
<pattern id="pp_stipple" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
  <rect width="8" height="8" fill="#f0d8a0"/>
  <circle cx="2" cy="2" r="0.9" fill="#c09040"/>
  <circle cx="6" cy="6" r="0.9" fill="#c09040"/>
  <circle cx="4" cy="4" r="0.55" fill="#c09040"/>
</pattern>
<pattern id="pp_stipple_large" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
  <rect width="10" height="10" fill="#e0c898"/>
  <circle cx="3" cy="3" r="1.5" fill="#a07840"/>
  <circle cx="8" cy="8" r="1.5" fill="#a07840"/>
</pattern>
<pattern id="pp_large_dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
  <rect width="14" height="14" fill="#d4b896"/>
  <circle cx="7" cy="7" r="4" fill="none" stroke="#8B6040" stroke-width="1.2"/>
</pattern>
<pattern id="pp_hline" x="0" y="0" width="20" height="6" patternUnits="userSpaceOnUse">
  <rect width="20" height="6" fill="#c8b8a8"/>
  <line x1="0" y1="3" x2="20" y2="3" stroke="#806858" stroke-width="0.7"/>
</pattern>
<pattern id="pp_hline_dense" x="0" y="0" width="20" height="4" patternUnits="userSpaceOnUse">
  <rect width="20" height="4" fill="#b8a898"/>
  <line x1="0" y1="1.3" x2="20" y2="1.3" stroke="#706858" stroke-width="0.5"/>
  <line x1="0" y1="3" x2="20" y2="3" stroke="#706858" stroke-width="0.5"/>
</pattern>
<pattern id="pp_hline_solid" x="0" y="0" width="20" height="3" patternUnits="userSpaceOnUse">
  <rect width="20" height="3" fill="#808080"/>
  <line x1="0" y1="1.5" x2="20" y2="1.5" stroke="#404040" stroke-width="1.3"/>
</pattern>
<pattern id="pp_solid" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
  <rect width="4" height="4" fill="#202020"/>
</pattern>
<pattern id="pp_hline_coal" x="0" y="0" width="20" height="5" patternUnits="userSpaceOnUse">
  <rect width="20" height="5" fill="#484848"/>
  <line x1="0" y1="2.5" x2="20" y2="2.5" stroke="#202020" stroke-width="1"/>
</pattern>
<pattern id="pp_wavy" x="0" y="0" width="20" height="8" patternUnits="userSpaceOnUse">
  <rect width="20" height="8" fill="#d8f0d0"/>
  <path d="M0 4 Q2.5 1 5 4 Q7.5 7 10 4 Q12.5 1 15 4 Q17.5 7 20 4" fill="none" stroke="#50a050" stroke-width="0.9"/>
</pattern>
<pattern id="pp_vhatch" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
  <rect width="8" height="8" fill="#f0e8d8"/>
  <line x1="0" y1="0" x2="8" y2="8" stroke="#c0a060" stroke-width="0.7"/>
  <line x1="8" y1="0" x2="0" y2="8" stroke="#c0a060" stroke-width="0.7"/>
</pattern>
<pattern id="pp_cross_hatch" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
  <rect width="8" height="8" fill="#f8f0f8"/>
  <line x1="0" y1="0" x2="8" y2="8" stroke="#d0a0d0" stroke-width="0.7"/>
  <line x1="8" y1="0" x2="0" y2="8" stroke="#d0a0d0" stroke-width="0.7"/>
</pattern>
<pattern id="pp_diagonal_loss" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
  <rect width="10" height="10" fill="#e0e0e0"/>
  <line x1="0" y1="10" x2="10" y2="0" stroke="#888" stroke-width="0.9"/>
</pattern>
<pattern id="pp_empty" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
  <rect width="8" height="8" fill="white"/>
  <line x1="0" y1="0" x2="8" y2="8" stroke="#ccc" stroke-width="0.5"/>
</pattern>
<pattern id="pp_vesicular" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
  <rect width="12" height="12" fill="#404040"/>
  <circle cx="4" cy="4" r="2" fill="none" stroke="#888" stroke-width="0.7"/>
  <circle cx="9" cy="9" r="1.5" fill="none" stroke="#888" stroke-width="0.7"/>
</pattern>
<pattern id="pp_foliation" x="0" y="0" width="20" height="6" patternUnits="userSpaceOnUse">
  <rect width="20" height="6" fill="#d0d0c0"/>
  <line x1="0" y1="1" x2="20" y2="3" stroke="#808070" stroke-width="0.9"/>
  <line x1="0" y1="4" x2="20" y2="6" stroke="#808070" stroke-width="0.9"/>
</pattern>
<pattern id="pp_schistosity" x="0" y="0" width="16" height="8" patternUnits="userSpaceOnUse">
  <rect width="16" height="8" fill="#c8c8b8"/>
  <line x1="0" y1="4" x2="8" y2="0" stroke="#707068" stroke-width="0.8"/>
  <line x1="8" y1="8" x2="16" y2="4" stroke="#707068" stroke-width="0.8"/>
</pattern>
<pattern id="pp_granite_speckle" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
  <rect width="8" height="8" fill="#f0e0e0"/>
  <rect x="1.5" y="1.5" width="2" height="2" fill="#c08080"/>
  <rect x="5" y="4.5" width="1.5" height="1.5" fill="#8080a0"/>
</pattern>
<pattern id="pp_mosaic" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
  <rect width="10" height="10" fill="#f0f0e8"/>
  <rect x="0" y="0" width="5" height="5" fill="none" stroke="#c0c0a8" stroke-width="0.8"/>
  <rect x="5" y="5" width="5" height="5" fill="none" stroke="#c0c0a8" stroke-width="0.8"/>
</pattern>
<pattern id="pp_default" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
  <rect width="4" height="4" fill="#eeeeee"/>
</pattern>
<clipPath id="clip_data">
  <rect x="0" y="0" width="99999" height="99999"/>
</clipPath>
</defs>`;
}

const KNOWN_PATTERNS = new Set([
  'brick','rhombus','stipple','stipple_large','large_dots','hline','hline_dense',
  'hline_solid','solid','hline_coal','wavy','vhatch','cross_hatch','diagonal_loss',
  'empty','vesicular','foliation','schistosity','granite_speckle','mosaic',
]);

function patFill(pattern) {
  if (!pattern) return '#eeeeee';
  const t = pattern.type;
  return KNOWN_PATTERNS.has(t) ? `url(#pp_${t})` : (pattern.bgColor || '#eeeeee');
}

// ─── Header ──────────────────────────────────────────────────────────────────

function renderHeader(project, core, svgW) {
  const h = project.header || {};
  const du = h.depthUnits || 'metres';

  let line1, line2, line3;
  if (project.type === 'western_canada') {
    line1 = h.wellName || 'Unnamed Well';
    const loc = [h.lsd,h.sec,h.twp,h.rng].filter(Boolean).join('-') + (h.mer ? `W${h.mer}` : '');
    line2 = loc || 'Western Canada';
    line3 = `Logged by: ${h.loggedBy || '—'}   Date: ${h.dateLogged ? new Date(h.dateLogged).toLocaleDateString('en-CA') : '—'}   GE: ${h.groundElevation||'—'} ${du}   KB: ${h.kbElevation||'—'} ${du}`;
  } else {
    line1 = h.coreName || 'Unnamed Core';
    line2 = `${h.latDeg||''}° ${h.latMin||''}' N   ${h.lonDeg||''}° ${h.lonMin||''}' W`;
    line3 = `Described by: ${h.describedBy||'—'}   Water Depth: ${h.waterDepth||'—'} ${du}`;
  }

  return `
<rect x="0" y="0" width="${svgW}" height="${STRIP_HEADER_H}" fill="#1a2744"/>
<text x="12" y="22" font-family="Arial,sans-serif" font-size="15" font-weight="bold" fill="white">${esc(line1)}</text>
<text x="12" y="40" font-family="Arial,sans-serif" font-size="10" fill="#a0c0e0">${esc(line2)}</text>
<text x="12" y="56" font-family="Arial,sans-serif" font-size="9"  fill="#7090b0">${esc(line3)}</text>
<text x="12" y="72" font-family="Arial,sans-serif" font-size="9"  fill="#7090b0">Core: ${core.coreNumber}   Depth units: ${du}   Intervals: ${(core.intervals||[]).length}</text>
<text x="${svgW - 12}" y="22" font-family="Arial,sans-serif" font-size="9" fill="#506080" text-anchor="end">CoreLog Strip Log</text>`;
}

// ─── Column headers ───────────────────────────────────────────────────────────

function renderColHeaders(colPositions) {
  const y0 = STRIP_HEADER_H;
  const h = STRIP_COL_HEADER_H;
  let out = `<rect x="0" y="${y0}" width="9999" height="${h}" fill="#e8eaed"/>`;

  for (const col of colPositions) {
    const cx = col.x + col.width / 2;
    const cy = y0 + h / 2;

    // Column border
    out += `<line x1="${col.x}" y1="${y0}" x2="${col.x}" y2="${y0 + h}" stroke="#bbb" stroke-width="0.8"/>`;

    if (col.type === 'grain_size') {
      // Sub-labels: Clay | Silt | Sand | Gravel
      out += `<text x="${cx}" y="${y0 + 10}" font-family="Arial" font-size="8" fill="#555" text-anchor="middle" font-weight="bold">Grain Size</text>`;
      const ticks = [
        { label: 'Cl', prop: 0.05 }, { label: 'Si', prop: 0.11 },
        { label: 'Sd', prop: 0.46 }, { label: 'Gr', prop: 0.86 },
      ];
      for (const t of ticks) {
        const tx = col.x + t.prop * col.width;
        out += `<line x1="${tx}" y1="${y0 + 15}" x2="${tx}" y2="${y0 + h}" stroke="#aaa" stroke-width="0.6"/>`;
        out += `<text x="${tx}" y="${y0 + 26}" font-family="Arial" font-size="7" fill="#777" text-anchor="middle">${t.label}</text>`;
      }
    } else if (col.type === 'bar' || col.type === 'bi' || col.type === 'porosity_measured') {
      out += `<text x="${cx}" y="${y0 + 12}" font-family="Arial" font-size="8" fill="#555" text-anchor="middle" font-weight="bold">${esc(col.label)}</text>`;
      if (col.type === 'bar') {
        out += `<text x="${col.x + col.width - 2}" y="${y0 + h - 4}" font-family="Arial" font-size="7" fill="#888" text-anchor="end">${col.maxVal}</text>`;
        out += `<text x="${col.x + 2}" y="${y0 + h - 4}" font-family="Arial" font-size="7" fill="#888">0</text>`;
      } else if (col.type === 'porosity_measured') {
        out += `<text x="${col.x + col.width - 2}" y="${y0 + h - 4}" font-family="Arial" font-size="7" fill="#888" text-anchor="end">40%</text>`;
        out += `<text x="${col.x + 2}" y="${y0 + h - 4}" font-family="Arial" font-size="7" fill="#888">0</text>`;
      }
    } else {
      out += `<text x="${cx}" y="${cy + 3}" font-family="Arial" font-size="8" fill="#555" text-anchor="middle" font-weight="bold">${esc(col.label)}</text>`;
    }
  }
  return out;
}

// ─── Depth scale column ───────────────────────────────────────────────────────

function renderDepthColumn(col, depthMin, depthMax, scalePixPerM) {
  const { major, minor } = majorMinorTicks(depthMin, depthMax, scalePixPerM);
  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;
  const cx = col.x + col.width;
  let out = '';

  // Background
  out += `<rect x="${col.x}" y="${dataY0}" width="${col.width}" height="${(depthMax - depthMin) * scalePixPerM}" fill="#f4f5f7"/>`;

  // Minor ticks
  let d = Math.ceil(depthMin / minor) * minor;
  while (d <= depthMax) {
    const y = dataY0 + (d - depthMin) * scalePixPerM;
    const isMajor = Math.abs(d % major) < 0.001;
    const tickLen = isMajor ? 8 : 4;
    out += `<line x1="${cx - tickLen}" y1="${y}" x2="${cx}" y2="${y}" stroke="#888" stroke-width="${isMajor ? 1.2 : 0.6}"/>`;
    if (isMajor) {
      out += `<text x="${cx - 10}" y="${y + 3.5}" font-family="Arial" font-size="9" fill="#444" text-anchor="end">${d}</text>`;
      // Guide line across entire strip
      out += `<line x1="${cx}" y1="${y}" x2="99999" y2="${y}" stroke="#ddd" stroke-width="0.5" stroke-dasharray="3,3"/>`;
    }
    d = Math.round((d + minor) * 1000) / 1000;
  }

  // Right border
  out += `<line x1="${cx}" y1="${dataY0}" x2="${cx}" y2="${dataY0 + (depthMax - depthMin) * scalePixPerM}" stroke="#555" stroke-width="1.2"/>`;
  return out;
}

// ─── Lithology column ─────────────────────────────────────────────────────────

function renderLithologyColumn(col, intervals) {
  let out = '';
  for (const iv of intervals) {
    const fill = patFill(iv.lith?.pattern);
    // Interval fill
    out += `<rect x="${col.x}" y="${iv.y1}" width="${col.width}" height="${iv.h}" fill="${fill}"/>`;

    // Top contact
    const { dash: topDash, sw: topSW } = contactDash(iv.topContact || 'sharp');
    const topPath = contactPathD(iv.topContact || 'sharp', col.x, col.x + col.width, iv.y1);
    out += `<path d="${topPath}" stroke="#222" stroke-width="${topSW}" fill="none"${topDash ? ` stroke-dasharray="${topDash}"` : ''}/>`;

    // Base contact
    const { dash: baseDash, sw: baseSW } = contactDash(iv.baseContact || 'sharp');
    const basePath = contactPathD(iv.baseContact || 'sharp', col.x, col.x + col.width, iv.y2);
    out += `<path d="${basePath}" stroke="#444" stroke-width="${baseSW}" fill="none"${baseDash ? ` stroke-dasharray="${baseDash}"` : ''}/>`;

    // Lith name (only if tall enough)
    if (iv.h > 14 && iv.lith) {
      const fs = Math.min(9, Math.max(7, iv.h / 4));
      const cy = iv.y1 + iv.h / 2;
      out += `<text x="${col.x + col.width / 2}" y="${cy + fs / 3}" font-family="Arial" font-size="${fs}" fill="#333" text-anchor="middle">${esc(iv.lith.abbrev || '')}</text>`;
    }
  }
  // Column border
  out += `<rect x="${col.x}" y="${STRIP_HEADER_H + STRIP_COL_HEADER_H}" width="${col.width}" height="9999" fill="none" stroke="#888" stroke-width="0.7"/>`;
  return out;
}

// ─── Grain size column ────────────────────────────────────────────────────────

function renderGrainSizeColumn(col, intervals) {
  let out = '';
  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;

  // White background
  out += `<rect x="${col.x}" y="${dataY0}" width="${col.width}" height="99999" fill="white"/>`;

  for (const iv of intervals) {
    const prop = iv.grainSize ? (GRAIN_WIDTH_MAP[iv.grainSize] || 0) : 0;
    if (prop === 0) continue;
    const barW = prop * col.width;
    const gc = grainColor(iv.grainSize);
    out += `<rect x="${col.x}" y="${iv.y1}" width="${barW}" height="${iv.h}" fill="${gc}"/>`;
    // Right edge line (step boundary)
    out += `<line x1="${col.x + barW}" y1="${iv.y1}" x2="${col.x + barW}" y2="${iv.y2}" stroke="#888" stroke-width="0.8"/>`;
  }

  // Column border
  out += `<rect x="${col.x}" y="${dataY0}" width="${col.width}" height="9999" fill="none" stroke="#bbb" stroke-width="0.7"/>`;
  return out;
}

// ─── Horizontal bar column (clay%, porosity) ──────────────────────────────────

function renderBarColumn(col, intervals) {
  let out = '';
  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;
  out += `<rect x="${col.x}" y="${dataY0}" width="${col.width}" height="9999" fill="white"/>`;

  for (const iv of intervals) {
    const raw = parseFloat(iv[col.dataKey]);
    if (isNaN(raw) || raw <= 0) continue;
    const prop = Math.min(raw, col.maxVal) / col.maxVal;
    const barW = prop * col.width;
    const midY = iv.y1 + iv.h / 2;
    const barH = Math.min(iv.h * 0.7, 10);
    out += `<rect x="${col.x}" y="${midY - barH / 2}" width="${barW}" height="${barH}" fill="${col.barColor}" opacity="0.75"/>`;
    if (iv.h > 16) {
      out += `<text x="${col.x + col.width / 2}" y="${midY + 3.5}" font-family="Arial" font-size="7" fill="#333" text-anchor="middle">${Math.round(raw)}</text>`;
    }
  }
  out += `<rect x="${col.x}" y="${dataY0}" width="${col.width}" height="9999" fill="none" stroke="#bbb" stroke-width="0.7"/>`;
  return out;
}

// ─── Bioturbation column ──────────────────────────────────────────────────────

function renderBIColumn(col, intervals) {
  let out = '';
  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;
  out += `<rect x="${col.x}" y="${dataY0}" width="${col.width}" height="9999" fill="white"/>`;

  for (const iv of intervals) {
    const bi = iv.bioturbationIndex;
    if (bi == null) continue;
    const opacity = bi / 6;
    if (opacity > 0) {
      out += `<rect x="${col.x}" y="${iv.y1}" width="${col.width}" height="${iv.h}" fill="#50a050" opacity="${(opacity * 0.35).toFixed(2)}"/>`;
    }
    if (iv.h > 10) {
      const midY = iv.y1 + iv.h / 2;
      out += `<text x="${col.x + col.width / 2}" y="${midY + 3.5}" font-family="Arial" font-size="9" fill="#225522" text-anchor="middle" font-weight="bold">${bi}</text>`;
    }
  }
  out += `<rect x="${col.x}" y="${dataY0}" width="${col.width}" height="9999" fill="none" stroke="#bbb" stroke-width="0.7"/>`;
  return out;
}

// ─── Structures column ────────────────────────────────────────────────────────

function renderStructuresColumn(col, allStructureObs) {
  let out = '';
  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;
  out += `<rect x="${col.x}" y="${dataY0}" width="${col.width}" height="9999" fill="#fafafa"/>`;
  const cx = col.x + col.width / 2;

  for (const obs of allStructureObs) {
    const y = obs.y;
    const id = obs.structureId || '';
    // Simple abbreviated symbol: small horizontal dash + label
    out += structureSymbolSvg(id, cx, y);
  }
  out += `<rect x="${col.x}" y="${dataY0}" width="${col.width}" height="9999" fill="none" stroke="#bbb" stroke-width="0.7"/>`;
  return out;
}

function structureSymbolSvg(id, cx, y) {
  const s = 5;
  switch (id) {
    case 'planar_lam':
      return `<line x1="${cx-s}" y1="${y}" x2="${cx+s}" y2="${y}" stroke="#444" stroke-width="1"/>`;
    case 'cross_bed':
      return `<line x1="${cx-s}" y1="${y+s}" x2="${cx+s}" y2="${y-s}" stroke="#444" stroke-width="1"/>
              <line x1="${cx-s}" y1="${y}" x2="${cx+s}" y2="${y}" stroke="#444" stroke-width="0.6"/>`;
    case 'graded_bed':
      return `<line x1="${cx-s}" y1="${y-s}" x2="${cx+s}" y2="${y-s}" stroke="#444" stroke-width="1.4"/>
              <line x1="${cx-s}" y1="${y}" x2="${cx+s}" y2="${y}" stroke="#444" stroke-width="0.9"/>
              <line x1="${cx-s}" y1="${y+s}" x2="${cx+s}" y2="${y+s}" stroke="#444" stroke-width="0.5"/>`;
    case 'bioturbation': case 'bioturb_massive':
      return `<circle cx="${cx}" cy="${y}" r="${s*0.7}" stroke="#444" stroke-width="0.8" fill="none"/>`;
    case 'fracture':
      return `<line x1="${cx-2}" y1="${y-s}" x2="${cx+2}" y2="${y+s}" stroke="#444" stroke-width="1" stroke-dasharray="2,1"/>`;
    case 'vein':
      return `<line x1="${cx-2}" y1="${y-s}" x2="${cx+2}" y2="${y+s}" stroke="#999" stroke-width="2.5"/>`;
    case 'stylolite':
      return `<path d="M${cx-s} ${y} L${cx-s/2} ${y-s/2} L${cx} ${y} L${cx+s/2} ${y-s/2} L${cx+s} ${y}" stroke="#444" stroke-width="1" fill="none"/>`;
    case 'nodule': case 'concretion':
      return `<circle cx="${cx}" cy="${y}" r="${s*0.65}" fill="#ccc" stroke="#888" stroke-width="0.8"/>`;
    case 'trace_fossil':
      return `<circle cx="${cx}" cy="${y}" r="${s*0.65}" stroke="#444" stroke-width="0.8" fill="none" stroke-dasharray="2,2"/>`;
    case 'body_fossil':
      return `<circle cx="${cx}" cy="${y}" r="${s*0.65}" stroke="#444" stroke-width="1.2" fill="none"/>`;
    default:
      return `<line x1="${cx-s}" y1="${y}" x2="${cx+s}" y2="${y}" stroke="#999" stroke-width="0.8" stroke-dasharray="3,2"/>`;
  }
}

// ─── Text column ──────────────────────────────────────────────────────────────

function renderTextColumn(col, intervals) {
  let out = '';
  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;
  out += `<rect x="${col.x}" y="${dataY0}" width="${col.width}" height="9999" fill="white"/>`;

  for (const iv of intervals) {
    const v = getIntervalValue(iv, col);
    if (!v || iv.h < 6) continue;

    const fs = 8;
    const maxW = col.width - 4;
    const charsPerLine = Math.floor(maxW / (fs * 0.55));
    const lines = wrapText(v, charsPerLine);
    const lineH = fs * 1.3;
    const totalH = lines.length * lineH;
    const startY = iv.y1 + Math.max(0, (iv.h - totalH) / 2) + fs;
    const maxLines = Math.floor(iv.h / lineH);

    lines.slice(0, maxLines).forEach((line, i) => {
      out += `<text x="${col.x + 3}" y="${startY + i * lineH}" font-family="Arial" font-size="${fs}" fill="#333">${esc(line)}</text>`;
    });
  }
  out += `<rect x="${col.x}" y="${dataY0}" width="${col.width}" height="9999" fill="none" stroke="#bbb" stroke-width="0.7"/>`;
  return out;
}

// ─── Measured porosity curve column ───────────────────────────────────────────

const MAX_PHI = 0.40; // 40% porosity full-scale

function renderPorosityMeasuredColumn(col, measuredPorosity, yForDepth) {
  if (!measuredPorosity || measuredPorosity.length === 0) {
    const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;
    return `<rect x="${col.x}" y="${dataY0}" width="${col.width}" height="9999" fill="white"/>
<rect x="${col.x}" y="${dataY0}" width="${col.width}" height="9999" fill="none" stroke="#bbb" stroke-width="0.7"/>`;
  }

  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;
  let out = `<rect x="${col.x}" y="${dataY0}" width="${col.width}" height="9999" fill="white"/>`;

  // Scale line at 0.10 phi steps
  for (let phi = 0.1; phi < MAX_PHI; phi += 0.1) {
    const gx = col.x + (phi / MAX_PHI) * col.width;
    out += `<line x1="${gx}" y1="${dataY0}" x2="${gx}" y2="${dataY0 + 99999}" stroke="#e0e0e0" stroke-width="0.5"/>`;
  }

  // Build area fill path: left edge down, then right (values) back up
  const pts = measuredPorosity.map(p => ({
    x: col.x + Math.min(p.value, MAX_PHI) / MAX_PHI * col.width,
    y: yForDepth(p.depth),
  }));

  if (pts.length >= 2) {
    const y0 = pts[0].y;
    const y1 = pts[pts.length - 1].y;
    let areaD = `M ${col.x} ${y0}`;
    for (const p of pts) areaD += ` L ${p.x} ${p.y}`;
    areaD += ` L ${col.x} ${y1} Z`;
    out += `<path d="${areaD}" fill="#2563eb" opacity="0.18"/>`;

    let lineD = `M ${pts[0].x} ${pts[0].y}`;
    for (const p of pts.slice(1)) lineD += ` L ${p.x} ${p.y}`;
    out += `<path d="${lineD}" stroke="#2563eb" stroke-width="1.2" fill="none"/>`;
  }

  out += `<rect x="${col.x}" y="${dataY0}" width="${col.width}" height="9999" fill="none" stroke="#bbb" stroke-width="0.7"/>`;
  return out;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function wrapText(text, maxChars) {
  if (!text) return [];
  if (text.length <= maxChars) return [text];
  const words = String(text).split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur ? cur + ' ' + w : w).length <= maxChars) {
      cur = cur ? cur + ' ' + w : w;
    } else {
      if (cur) lines.push(cur);
      cur = w.slice(0, maxChars);
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function generateStripLogHTML(project, core, columns, options = {}) {
  if (!project || !core) return '<html><body><p>No data</p></body></html>';
  const { scalePixPerM = 10, customLithologies = [] } = options;

  const layout = computeStripLayout(core, columns, scalePixPerM, customLithologies);
  const { intervals, allStructureObs, measuredPorosity, depthMin, depthMax, totalW, colPositions, svgH, svgW, yForDepth } = layout;

  const parts = [];
  parts.push(patternDefs());
  parts.push(renderHeader(project, core, svgW));
  parts.push(renderColHeaders(colPositions));

  // White data area background
  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;
  parts.push(`<rect x="0" y="${dataY0}" width="${svgW}" height="${svgH - dataY0}" fill="white"/>`);

  // Render each column
  for (const col of colPositions) {
    switch (col.type) {
      case 'depth':
        parts.push(renderDepthColumn(col, depthMin, depthMax, scalePixPerM));
        break;
      case 'lithology':
        parts.push(renderLithologyColumn(col, intervals));
        break;
      case 'grain_size':
        parts.push(renderGrainSizeColumn(col, intervals));
        break;
      case 'bar':
        parts.push(renderBarColumn(col, intervals));
        break;
      case 'bi':
        parts.push(renderBIColumn(col, intervals));
        break;
      case 'structures':
        parts.push(renderStructuresColumn(col, allStructureObs));
        break;
      case 'text':
        parts.push(renderTextColumn(col, intervals));
        break;
      case 'porosity_measured':
        parts.push(renderPorosityMeasuredColumn(col, measuredPorosity, yForDepth));
        break;
    }
  }

  // Outer border
  parts.push(`<rect x="0" y="${dataY0}" width="${svgW}" height="${svgH - dataY0}" fill="none" stroke="#555" stroke-width="1.5"/>`);

  const svg = `<svg width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: white; }
  @page { margin: 8mm; size: auto; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>${svg}</body>
</html>`;
}
