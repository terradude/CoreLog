import { getLithologyById } from '../data/lithologies';

export const STRIP_HEADER_H = 82;
export const STRIP_COL_HEADER_H = 34;

export const GRAIN_WIDTH_MAP = {
  clay: 0.05, silt: 0.11, vf_sand: 0.21, f_sand: 0.32,
  m_sand: 0.46, c_sand: 0.61, vc_sand: 0.76,
  granule: 0.86, pebble: 0.93, cobble: 1.0,
};

// Grain size colour: fine → coarse
export function grainColor(grainId) {
  const i = GRAIN_ORDER.indexOf(grainId);
  if (i < 0) return '#e0e0e0';
  const t = i / (GRAIN_ORDER.length - 1);
  // blend: clay gray (#b0a898) → sand tan (#e8c87a) → gravel brown (#b08040)
  if (t < 0.5) {
    const u = t * 2;
    return blendHex('#b0a898', '#e8c87a', u);
  }
  const u = (t - 0.5) * 2;
  return blendHex('#e8c87a', '#b08040', u);
}

const GRAIN_ORDER = ['clay','silt','vf_sand','f_sand','m_sand','c_sand','vc_sand','granule','pebble','cobble'];

function blendHex(a, b, t) {
  const ra = parseInt(a.slice(1,3),16), ga = parseInt(a.slice(3,5),16), ba2 = parseInt(a.slice(5,7),16);
  const rb = parseInt(b.slice(1,3),16), gb = parseInt(b.slice(3,5),16), bb2 = parseInt(b.slice(5,7),16);
  const r = Math.round(ra + (rb-ra)*t);
  const g = Math.round(ga + (gb-ga)*t);
  const bl = Math.round(ba2 + (bb2-ba2)*t);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bl.toString(16).padStart(2,'0')}`;
}

export const SCALE_OPTIONS = [
  { label: '1:50',  pxPerM: 20 },
  { label: '1:100', pxPerM: 10 },
  { label: '1:200', pxPerM: 5 },
  { label: '1:500', pxPerM: 2 },
];

export const COLUMN_DEFS = [
  { id: 'depth',        label: 'Depth',       width: 50,  enabled: true,  locked: true, type: 'depth' },
  { id: 'lithology',    label: 'Lithology',   width: 80,  enabled: true,  type: 'lithology' },
  { id: 'grain_size',   label: 'Grain Size',  width: 62,  enabled: true,  type: 'grain_size' },
  { id: 'clay_pct',     label: 'Clay %',      width: 42,  enabled: true,  type: 'bar',  dataKey: 'clayPercent',          maxVal: 100, barColor: '#a89880' },
  { id: 'bioturbation', label: 'BI',          width: 36,  enabled: true,  type: 'bi' },
  { id: 'structures',   label: 'Struct.',     width: 50,  enabled: true,  type: 'structures' },
  { id: 'porosity_est', label: 'Por. %',      width: 48,  enabled: true,  type: 'bar',  dataKey: 'porosityEstimate',     maxVal: 35,  barColor: '#2563eb' },
  { id: 'stain',        label: 'Stain',       width: 48,  enabled: true,  type: 'text', dataKey: 'hcStain' },
  { id: 'shows',        label: 'Shows',       width: 62,  enabled: true,  type: 'text', dataKey: 'shows' },
  { id: 'sorting',      label: 'Sorting',     width: 50,  enabled: true,  type: 'text', dataKey: 'sorting' },
  { id: 'colour',       label: 'Colour',      width: 50,  enabled: true,  type: 'text', dataKey: 'colour' },
  { id: 'lithofacies',  label: 'Facies',      width: 42,  enabled: true,  type: 'text', dataKey: 'lithofaciesCode' },
  { id: 'facies_assoc', label: 'Facies A.',   width: 65,  enabled: true,  type: 'text', dataKey: 'lithofaciesAssoc' },
  { id: 'dep_env',      label: 'Dep. Env.',   width: 100, enabled: true,  type: 'text', dataKey: 'depositionalEnvironment' },
  { id: 'dep_complex',       label: 'Dep. Cx.',    width: 100, enabled: false, type: 'text',              dataKey: 'depositionalComplex' },
  { id: 'remarks',           label: 'Remarks',     width: 130, enabled: false, type: 'text',              dataKey: 'remarks' },
  { id: 'porosity_measured', label: 'Por. Meas.',  width: 60,  enabled: false, type: 'porosity_measured' },
];

export function getIntervalValue(iv, col) {
  if (!col.dataKey) return '';
  const v = iv[col.dataKey];
  if (v == null || v === '' || v === 'none') return '';
  return String(v);
}

export function majorMinorTicks(depthMin, depthMax, scalePixPerM) {
  const range = depthMax - depthMin;
  let major, minor;
  if (scalePixPerM >= 15)      { major = 2;  minor = 0.5; }
  else if (scalePixPerM >= 8)  { major = 5;  minor = 1;   }
  else if (scalePixPerM >= 4)  { major = 10; minor = 2;   }
  else                          { major = 25; minor = 5;   }
  return { major, minor };
}

export function contactDash(type) {
  const map = {
    sharp:        { dash: '',          sw: 1.5 },
    gradational:  { dash: '5,3',       sw: 1.0 },
    scoured:      { dash: '',          sw: 1.5 },   // drawn as wavy
    faulted:      { dash: '',          sw: 1.5 },   // drawn as zigzag
    bioturbated:  { dash: '2,2',       sw: 1.0 },
    uncertain:    { dash: '6,2,2,2',   sw: 1.0 },
    undulating:   { dash: '4,2',       sw: 1.0 },
    inclined:     { dash: '',          sw: 1.5 },
  };
  return map[type] || { dash: '', sw: 1.0 };
}

// Returns an SVG path d-string for a contact line from x1→x2 at y
export function contactPathD(type, x1, x2, y) {
  if (type === 'scoured') {
    let d = `M ${x1} ${y}`;
    for (let x = x1; x < x2; x += 8) {
      const nx = Math.min(x + 8, x2);
      const mx = (x + nx) / 2;
      d += ` Q ${x + 2} ${y - 3} ${mx} ${y} Q ${mx + 2} ${y + 3} ${nx} ${y}`;
    }
    return d;
  }
  if (type === 'faulted') {
    let d = `M ${x1} ${y}`;
    let up = true;
    for (let x = x1 + 6; x <= x2; x += 6) {
      d += ` L ${x} ${y + (up ? -4 : 4)}`;
      up = !up;
    }
    return d + ` L ${x2} ${y}`;
  }
  if (type === 'inclined') {
    return `M ${x1} ${y - 3} L ${x2} ${y + 3}`;
  }
  return `M ${x1} ${y} L ${x2} ${y}`;
}

export function computeStripLayout(core, columns, scalePixPerM, customLithologies = []) {
  const raw = core?.intervals || [];
  const intervals = [...raw]
    .filter(iv => iv.topDepth !== '' && iv.baseDepth !== '' &&
                  !isNaN(parseFloat(iv.topDepth)) && !isNaN(parseFloat(iv.baseDepth)))
    .sort((a, b) => parseFloat(a.topDepth) - parseFloat(b.topDepth));

  const allD = intervals.flatMap(iv =>
    [parseFloat(iv.topDepth), parseFloat(iv.baseDepth)]
  ).filter(isFinite);

  const depthMin = allD.length ? Math.min(...allD) : 0;
  const depthMax = allD.length ? Math.max(...allD) : 10;
  const depthRange = (depthMax - depthMin) || 1;
  const dataH = depthRange * scalePixPerM;

  const enabledCols = columns.filter(c => c.enabled);
  let xOff = 0;
  const colPositions = enabledCols.map(c => {
    const p = { ...c, x: xOff };
    xOff += c.width;
    return p;
  });
  const totalW = xOff;

  function yForDepth(d) {
    return STRIP_HEADER_H + STRIP_COL_HEADER_H + (parseFloat(d) - depthMin) * scalePixPerM;
  }

  const richIntervals = intervals.map(iv => {
    const lith = getLithologyById(iv.lithologyId, customLithologies);
    const y1 = yForDepth(iv.topDepth);
    const y2 = yForDepth(iv.baseDepth);
    return { ...iv, lith, y1, y2, h: Math.max(y2 - y1, 3) };
  });

  const allStructureObs = intervals.flatMap(iv =>
    (iv.structures || []).map(s => ({ ...s, y: yForDepth(s.depth) }))
  );

  const measuredPorosity = (core?.measuredPorosity || [])
    .filter(p => isFinite(p.depth) && isFinite(p.value));

  return {
    intervals: richIntervals,
    allStructureObs,
    measuredPorosity,
    depthMin, depthMax, depthRange, dataH,
    totalW, colPositions, yForDepth,
    svgH: STRIP_HEADER_H + STRIP_COL_HEADER_H + dataH,
    svgW: totalW,
    scalePixPerM,
  };
}
