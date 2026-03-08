// On-screen strip log preview using react-native-svg.
// Shares layout computation with generateStripLogSVG.
import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import Svg, {
  Defs, Pattern, Rect, Line, Path, Circle, Text as SvgText, G,
} from 'react-native-svg';
import {
  computeStripLayout, contactPathD, contactDash, majorMinorTicks,
  STRIP_HEADER_H, STRIP_COL_HEADER_H,
  GRAIN_WIDTH_MAP, grainColor, getIntervalValue,
} from '../utils/computeStripLayout';

// ─── Pattern defs (react-native-svg) ─────────────────────────────────────────

function SvgPatternDefs() {
  return (
    <Defs>
      <Pattern id="rp_brick" x={0} y={0} width={20} height={10} patternUnits="userSpaceOnUse">
        <Rect width={20} height={10} fill="#b8d4f0"/>
        <Line x1={0} y1={5} x2={20} y2={5} stroke="#4a90d9" strokeWidth={0.7}/>
        <Line x1={10} y1={0} x2={10} y2={5} stroke="#4a90d9" strokeWidth={0.7}/>
        <Line x1={5} y1={5} x2={5} y2={10} stroke="#4a90d9" strokeWidth={0.7}/>
        <Line x1={15} y1={5} x2={15} y2={10} stroke="#4a90d9" strokeWidth={0.7}/>
      </Pattern>
      <Pattern id="rp_rhombus" x={0} y={0} width={14} height={14} patternUnits="userSpaceOnUse">
        <Rect width={14} height={14} fill="#c8e0b0"/>
        <Path d="M7 0 L14 7 L7 14 L0 7 Z" stroke="#5a9e4a" strokeWidth={0.9} fill="none"/>
      </Pattern>
      <Pattern id="rp_stipple" x={0} y={0} width={8} height={8} patternUnits="userSpaceOnUse">
        <Rect width={8} height={8} fill="#f0d8a0"/>
        <Circle cx={2} cy={2} r={0.9} fill="#c09040"/>
        <Circle cx={6} cy={6} r={0.9} fill="#c09040"/>
        <Circle cx={4} cy={4} r={0.55} fill="#c09040"/>
      </Pattern>
      <Pattern id="rp_stipple_large" x={0} y={0} width={10} height={10} patternUnits="userSpaceOnUse">
        <Rect width={10} height={10} fill="#e0c898"/>
        <Circle cx={3} cy={3} r={1.5} fill="#a07840"/>
        <Circle cx={8} cy={8} r={1.5} fill="#a07840"/>
      </Pattern>
      <Pattern id="rp_large_dots" x={0} y={0} width={14} height={14} patternUnits="userSpaceOnUse">
        <Rect width={14} height={14} fill="#d4b896"/>
        <Circle cx={7} cy={7} r={4} stroke="#8B6040" strokeWidth={1.2} fill="none"/>
      </Pattern>
      <Pattern id="rp_hline" x={0} y={0} width={20} height={6} patternUnits="userSpaceOnUse">
        <Rect width={20} height={6} fill="#c8b8a8"/>
        <Line x1={0} y1={3} x2={20} y2={3} stroke="#806858" strokeWidth={0.7}/>
      </Pattern>
      <Pattern id="rp_hline_dense" x={0} y={0} width={20} height={4} patternUnits="userSpaceOnUse">
        <Rect width={20} height={4} fill="#b8a898"/>
        <Line x1={0} y1={1.3} x2={20} y2={1.3} stroke="#706858" strokeWidth={0.5}/>
        <Line x1={0} y1={3} x2={20} y2={3} stroke="#706858" strokeWidth={0.5}/>
      </Pattern>
      <Pattern id="rp_hline_solid" x={0} y={0} width={20} height={3} patternUnits="userSpaceOnUse">
        <Rect width={20} height={3} fill="#808080"/>
        <Line x1={0} y1={1.5} x2={20} y2={1.5} stroke="#404040" strokeWidth={1.3}/>
      </Pattern>
      <Pattern id="rp_solid" x={0} y={0} width={4} height={4} patternUnits="userSpaceOnUse">
        <Rect width={4} height={4} fill="#202020"/>
      </Pattern>
      <Pattern id="rp_hline_coal" x={0} y={0} width={20} height={5} patternUnits="userSpaceOnUse">
        <Rect width={20} height={5} fill="#484848"/>
        <Line x1={0} y1={2.5} x2={20} y2={2.5} stroke="#202020" strokeWidth={1}/>
      </Pattern>
      <Pattern id="rp_wavy" x={0} y={0} width={20} height={8} patternUnits="userSpaceOnUse">
        <Rect width={20} height={8} fill="#d8f0d0"/>
        <Path d="M0 4 Q2.5 1 5 4 Q7.5 7 10 4 Q12.5 1 15 4 Q17.5 7 20 4" stroke="#50a050" strokeWidth={0.9} fill="none"/>
      </Pattern>
      <Pattern id="rp_vhatch" x={0} y={0} width={8} height={8} patternUnits="userSpaceOnUse">
        <Rect width={8} height={8} fill="#f0e8d8"/>
        <Line x1={0} y1={0} x2={8} y2={8} stroke="#c0a060" strokeWidth={0.7}/>
        <Line x1={8} y1={0} x2={0} y2={8} stroke="#c0a060" strokeWidth={0.7}/>
      </Pattern>
      <Pattern id="rp_cross_hatch" x={0} y={0} width={8} height={8} patternUnits="userSpaceOnUse">
        <Rect width={8} height={8} fill="#f8f0f8"/>
        <Line x1={0} y1={0} x2={8} y2={8} stroke="#d0a0d0" strokeWidth={0.7}/>
        <Line x1={8} y1={0} x2={0} y2={8} stroke="#d0a0d0" strokeWidth={0.7}/>
      </Pattern>
      <Pattern id="rp_diagonal_loss" x={0} y={0} width={10} height={10} patternUnits="userSpaceOnUse">
        <Rect width={10} height={10} fill="#e0e0e0"/>
        <Line x1={0} y1={10} x2={10} y2={0} stroke="#888" strokeWidth={0.9}/>
      </Pattern>
      <Pattern id="rp_empty" x={0} y={0} width={8} height={8} patternUnits="userSpaceOnUse">
        <Rect width={8} height={8} fill="white"/>
        <Line x1={0} y1={0} x2={8} y2={8} stroke="#ccc" strokeWidth={0.5}/>
      </Pattern>
      <Pattern id="rp_vesicular" x={0} y={0} width={12} height={12} patternUnits="userSpaceOnUse">
        <Rect width={12} height={12} fill="#404040"/>
        <Circle cx={4} cy={4} r={2} stroke="#888" strokeWidth={0.7} fill="none"/>
        <Circle cx={9} cy={9} r={1.5} stroke="#888" strokeWidth={0.7} fill="none"/>
      </Pattern>
      <Pattern id="rp_foliation" x={0} y={0} width={20} height={6} patternUnits="userSpaceOnUse">
        <Rect width={20} height={6} fill="#d0d0c0"/>
        <Line x1={0} y1={1} x2={20} y2={3} stroke="#808070" strokeWidth={0.9}/>
        <Line x1={0} y1={4} x2={20} y2={6} stroke="#808070" strokeWidth={0.9}/>
      </Pattern>
      <Pattern id="rp_granite_speckle" x={0} y={0} width={8} height={8} patternUnits="userSpaceOnUse">
        <Rect width={8} height={8} fill="#f0e0e0"/>
        <Rect x={1.5} y={1.5} width={2} height={2} fill="#c08080"/>
        <Rect x={5} y={4.5} width={1.5} height={1.5} fill="#8080a0"/>
      </Pattern>
      <Pattern id="rp_default" x={0} y={0} width={4} height={4} patternUnits="userSpaceOnUse">
        <Rect width={4} height={4} fill="#eeeeee"/>
      </Pattern>
    </Defs>
  );
}

const KNOWN_RP = new Set([
  'brick','rhombus','stipple','stipple_large','large_dots','hline','hline_dense',
  'hline_solid','solid','hline_coal','wavy','vhatch','cross_hatch','diagonal_loss',
  'empty','vesicular','foliation','granite_speckle',
]);

function patFill(pattern) {
  if (!pattern) return '#eeeeee';
  const t = pattern.type;
  return KNOWN_RP.has(t) ? `url(#rp_${t})` : (pattern.bgColor || '#eeeeee');
}

// ─── Column renderers (react-native-svg components) ───────────────────────────

function DepthColumn({ col, depthMin, depthMax, scalePixPerM, totalW }) {
  const { major, minor } = majorMinorTicks(depthMin, depthMax, scalePixPerM);
  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;
  const cx = col.x + col.width;
  const ticks = [];

  let d = Math.ceil(depthMin / minor) * minor;
  while (d <= depthMax) {
    const y = dataY0 + (d - depthMin) * scalePixPerM;
    const isMajor = Math.abs(d % major) < 0.001;
    const tickLen = isMajor ? 8 : 4;
    ticks.push(
      <Line key={`t${d}`} x1={cx - tickLen} y1={y} x2={cx} y2={y}
        stroke="#888" strokeWidth={isMajor ? 1.2 : 0.6} />,
    );
    if (isMajor) {
      ticks.push(
        <SvgText key={`l${d}`} x={cx - 10} y={y + 3.5}
          fontSize={9} fill="#444" textAnchor="end">{d}</SvgText>,
      );
      ticks.push(
        <Line key={`g${d}`} x1={cx} y1={y} x2={totalW} y2={y}
          stroke="#ddd" strokeWidth={0.5} strokeDasharray="3,3" />,
      );
    }
    d = Math.round((d + minor) * 1000) / 1000;
  }

  return (
    <G>
      <Rect x={col.x} y={dataY0} width={col.width}
        height={(depthMax - depthMin) * scalePixPerM} fill="#f4f5f7" />
      {ticks}
      <Line x1={cx} y1={dataY0} x2={cx} y2={dataY0 + (depthMax - depthMin) * scalePixPerM}
        stroke="#555" strokeWidth={1.2} />
    </G>
  );
}

function LithologyColumn({ col, intervals }) {
  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;
  return (
    <G>
      {intervals.map((iv) => {
        const fill = patFill(iv.lith?.pattern);
        const { dash: topDash, sw: topSW } = contactDash(iv.topContact || 'sharp');
        const { dash: baseDash, sw: baseSW } = contactDash(iv.baseContact || 'sharp');
        const topPath = contactPathD(iv.topContact || 'sharp', col.x, col.x + col.width, iv.y1);
        const basePath = contactPathD(iv.baseContact || 'sharp', col.x, col.x + col.width, iv.y2);
        const showText = iv.h > 14 && iv.lith;
        const fs = showText ? Math.min(9, Math.max(7, iv.h / 4)) : 0;

        return (
          <G key={iv.id}>
            <Rect x={col.x} y={iv.y1} width={col.width} height={iv.h} fill={fill} />
            <Path d={topPath} stroke="#222" strokeWidth={topSW} fill="none"
              strokeDasharray={topDash || undefined} />
            <Path d={basePath} stroke="#444" strokeWidth={baseSW} fill="none"
              strokeDasharray={baseDash || undefined} />
            {showText && (
              <SvgText x={col.x + col.width / 2} y={iv.y1 + iv.h / 2 + fs / 3}
                fontSize={fs} fill="#333" textAnchor="middle">
                {iv.lith.abbrev || ''}
              </SvgText>
            )}
          </G>
        );
      })}
      <Rect x={col.x} y={dataY0} width={col.width} height={9999}
        fill="none" stroke="#888" strokeWidth={0.7} />
    </G>
  );
}

function GrainSizeColumn({ col, intervals }) {
  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;
  return (
    <G>
      <Rect x={col.x} y={dataY0} width={col.width} height={9999} fill="white" />
      {intervals.map((iv) => {
        const prop = iv.grainSize ? (GRAIN_WIDTH_MAP[iv.grainSize] || 0) : 0;
        if (!prop) return null;
        const barW = prop * col.width;
        const gc = grainColor(iv.grainSize);
        return (
          <G key={iv.id}>
            <Rect x={col.x} y={iv.y1} width={barW} height={iv.h} fill={gc} />
            <Line x1={col.x + barW} y1={iv.y1} x2={col.x + barW} y2={iv.y2}
              stroke="#888" strokeWidth={0.8} />
          </G>
        );
      })}
      <Rect x={col.x} y={dataY0} width={col.width} height={9999}
        fill="none" stroke="#bbb" strokeWidth={0.7} />
    </G>
  );
}

function BarColumn({ col, intervals }) {
  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;
  return (
    <G>
      <Rect x={col.x} y={dataY0} width={col.width} height={9999} fill="white" />
      {intervals.map((iv) => {
        const raw = parseFloat(iv[col.dataKey]);
        if (isNaN(raw) || raw <= 0) return null;
        const prop = Math.min(raw, col.maxVal) / col.maxVal;
        const barW = prop * col.width;
        const midY = iv.y1 + iv.h / 2;
        const barH = Math.min(iv.h * 0.7, 10);
        return (
          <G key={iv.id}>
            <Rect x={col.x} y={midY - barH / 2} width={barW} height={barH}
              fill={col.barColor} opacity={0.75} />
            {iv.h > 16 && (
              <SvgText x={col.x + col.width / 2} y={midY + 3.5}
                fontSize={7} fill="#333" textAnchor="middle">
                {Math.round(raw)}
              </SvgText>
            )}
          </G>
        );
      })}
      <Rect x={col.x} y={dataY0} width={col.width} height={9999}
        fill="none" stroke="#bbb" strokeWidth={0.7} />
    </G>
  );
}

function BIColumn({ col, intervals }) {
  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;
  return (
    <G>
      <Rect x={col.x} y={dataY0} width={col.width} height={9999} fill="white" />
      {intervals.map((iv) => {
        const bi = iv.bioturbationIndex;
        if (bi == null) return null;
        const opacity = (bi / 6) * 0.35;
        const midY = iv.y1 + iv.h / 2;
        return (
          <G key={iv.id}>
            {opacity > 0 && (
              <Rect x={col.x} y={iv.y1} width={col.width} height={iv.h}
                fill="#50a050" opacity={opacity} />
            )}
            {iv.h > 10 && (
              <SvgText x={col.x + col.width / 2} y={midY + 3.5}
                fontSize={9} fill="#225522" textAnchor="middle" fontWeight="bold">
                {bi}
              </SvgText>
            )}
          </G>
        );
      })}
      <Rect x={col.x} y={dataY0} width={col.width} height={9999}
        fill="none" stroke="#bbb" strokeWidth={0.7} />
    </G>
  );
}

function StructuresColumn({ col, allStructureObs }) {
  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;
  const cx = col.x + col.width / 2;
  const s = 5;
  return (
    <G>
      <Rect x={col.x} y={dataY0} width={col.width} height={9999} fill="#fafafa" />
      {allStructureObs.map((obs, i) => {
        const y = obs.y;
        const id = obs.structureId || '';
        return (
          <G key={i}>
            {id === 'planar_lam' && <Line x1={cx-s} y1={y} x2={cx+s} y2={y} stroke="#444" strokeWidth={1}/>}
            {id === 'cross_bed' && <>
              <Line x1={cx-s} y1={y+s} x2={cx+s} y2={y-s} stroke="#444" strokeWidth={1}/>
              <Line x1={cx-s} y1={y} x2={cx+s} y2={y} stroke="#444" strokeWidth={0.6}/>
            </>}
            {(id === 'bioturb_massive' || id === 'bioturbation') &&
              <Circle cx={cx} cy={y} r={s*0.7} stroke="#444" strokeWidth={0.8} fill="none"/>}
            {id === 'fracture' &&
              <Line x1={cx-2} y1={y-s} x2={cx+2} y2={y+s} stroke="#444" strokeWidth={1} strokeDasharray="2,1"/>}
            {id === 'vein' &&
              <Line x1={cx-2} y1={y-s} x2={cx+2} y2={y+s} stroke="#999" strokeWidth={2.5}/>}
            {id === 'nodule' &&
              <Circle cx={cx} cy={y} r={s*0.65} fill="#ccc" stroke="#888" strokeWidth={0.8}/>}
            {id === 'body_fossil' &&
              <Circle cx={cx} cy={y} r={s*0.65} stroke="#444" strokeWidth={1.2} fill="none"/>}
            {id === 'trace_fossil' &&
              <Circle cx={cx} cy={y} r={s*0.65} stroke="#444" strokeWidth={0.8} fill="none" strokeDasharray="2,2"/>}
            {!['planar_lam','cross_bed','bioturb_massive','bioturbation','fracture','vein','nodule','body_fossil','trace_fossil'].includes(id) && (
              <Line x1={cx-s} y1={y} x2={cx+s} y2={y} stroke="#999" strokeWidth={0.8} strokeDasharray="3,2"/>
            )}
          </G>
        );
      })}
      <Rect x={col.x} y={dataY0} width={col.width} height={9999}
        fill="none" stroke="#bbb" strokeWidth={0.7} />
    </G>
  );
}

function TextColumn({ col, intervals }) {
  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;
  const fs = 8;
  return (
    <G>
      <Rect x={col.x} y={dataY0} width={col.width} height={9999} fill="white" />
      {intervals.map((iv) => {
        const v = getIntervalValue(iv, col);
        if (!v || iv.h < 6) return null;
        // Single line, clipped to cell
        return (
          <SvgText key={iv.id} x={col.x + 3} y={iv.y1 + iv.h / 2 + fs / 3}
            fontSize={fs} fill="#333">
            {String(v).slice(0, Math.floor((col.width - 6) / (fs * 0.55)))}
          </SvgText>
        );
      })}
      <Rect x={col.x} y={dataY0} width={col.width} height={9999}
        fill="none" stroke="#bbb" strokeWidth={0.7} />
    </G>
  );
}

// ─── Measured porosity curve column ───────────────────────────────────────────

const MAX_PHI = 0.40;

function PorosityMeasuredColumn({ col, measuredPorosity, yForDepth }) {
  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;

  if (!measuredPorosity || measuredPorosity.length === 0) {
    return (
      <G>
        <Rect x={col.x} y={dataY0} width={col.width} height={9999} fill="white" />
        <Rect x={col.x} y={dataY0} width={col.width} height={9999} fill="none" stroke="#bbb" strokeWidth={0.7} />
      </G>
    );
  }

  const pts = measuredPorosity.map(p => ({
    x: col.x + Math.min(p.value, MAX_PHI) / MAX_PHI * col.width,
    y: yForDepth(p.depth),
  }));

  let areaD = '';
  let lineD = '';
  if (pts.length >= 2) {
    const y0 = pts[0].y;
    const y1 = pts[pts.length - 1].y;
    areaD = `M ${col.x} ${y0} ` + pts.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${col.x} ${y1} Z`;
    lineD = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  }

  // Grid lines at 0.1 phi steps
  const gridLines = [0.1, 0.2, 0.3].map(phi => {
    const gx = col.x + (phi / MAX_PHI) * col.width;
    return <Line key={phi} x1={gx} y1={dataY0} x2={gx} y2={dataY0 + 99999} stroke="#e0e0e0" strokeWidth={0.5} />;
  });

  return (
    <G>
      <Rect x={col.x} y={dataY0} width={col.width} height={9999} fill="white" />
      {gridLines}
      {areaD !== '' && <Path d={areaD} fill="#2563eb" opacity={0.18} />}
      {lineD !== '' && <Path d={lineD} stroke="#2563eb" strokeWidth={1.2} fill="none" />}
      <Rect x={col.x} y={dataY0} width={col.width} height={9999} fill="none" stroke="#bbb" strokeWidth={0.7} />
    </G>
  );
}

// ─── Column headers ───────────────────────────────────────────────────────────

function ColHeaders({ colPositions }) {
  const y0 = STRIP_HEADER_H;
  const h = STRIP_COL_HEADER_H;
  return (
    <G>
      <Rect x={0} y={y0} width={99999} height={h} fill="#e8eaed" />
      {colPositions.map((col) => {
        const cx = col.x + col.width / 2;
        const cy = y0 + h / 2;
        return (
          <G key={col.id}>
            <Line x1={col.x} y1={y0} x2={col.x} y2={y0 + h} stroke="#bbb" strokeWidth={0.8} />
            {col.type === 'porosity_measured' ? (
              <>
                <SvgText x={cx} y={y0 + 12} fontSize={8} fill="#555" textAnchor="middle" fontWeight="bold">
                  Por. Meas.
                </SvgText>
                <SvgText x={col.x + 2} y={y0 + h - 4} fontSize={7} fill="#888">0</SvgText>
                <SvgText x={col.x + col.width - 2} y={y0 + h - 4} fontSize={7} fill="#888" textAnchor="end">40%</SvgText>
              </>
            ) : col.type === 'grain_size' ? (
              <>
                <SvgText x={cx} y={y0 + 11} fontSize={8} fill="#555" textAnchor="middle" fontWeight="bold">
                  Grain Size
                </SvgText>
                {[{l:'Cl',p:0.05},{l:'Si',p:0.11},{l:'Sd',p:0.46},{l:'Gr',p:0.86}].map(t => (
                  <G key={t.l}>
                    <Line x1={col.x + t.p * col.width} y1={y0 + 16} x2={col.x + t.p * col.width} y2={y0 + h} stroke="#aaa" strokeWidth={0.6}/>
                    <SvgText x={col.x + t.p * col.width} y={y0 + 27} fontSize={7} fill="#777" textAnchor="middle">{t.l}</SvgText>
                  </G>
                ))}
              </>
            ) : (
              <SvgText x={cx} y={cy + 3} fontSize={8} fill="#555" textAnchor="middle" fontWeight="bold">
                {col.label}
              </SvgText>
            )}
          </G>
        );
      })}
    </G>
  );
}

// ─── Strip log header ─────────────────────────────────────────────────────────

function StripHeader({ project, core, svgW }) {
  const h = project?.header || {};
  const du = h.depthUnits || 'metres';
  const line1 = project?.type === 'western_canada'
    ? (h.wellName || 'Unnamed Well')
    : (h.coreName || 'Unnamed Core');
  const line2 = project?.type === 'western_canada'
    ? ([h.lsd,h.sec,h.twp,h.rng].filter(Boolean).join('-') + (h.mer ? `W${h.mer}` : '') || 'Western Canada')
    : `${h.latDeg||''}° ${h.latMin||''}' N  ${h.lonDeg||''}° ${h.lonMin||''}' W`;
  const line3 = project?.type === 'western_canada'
    ? `Logged by: ${h.loggedBy||'—'}   Date: ${h.dateLogged ? new Date(h.dateLogged).toLocaleDateString('en-CA') : '—'}`
    : `Described by: ${h.describedBy||'—'}`;

  return (
    <G>
      <Rect x={0} y={0} width={svgW} height={STRIP_HEADER_H} fill="#1a2744" />
      <SvgText x={12} y={22} fontSize={15} fontWeight="bold" fill="white">{line1}</SvgText>
      <SvgText x={12} y={40} fontSize={10} fill="#a0c0e0">{line2}</SvgText>
      <SvgText x={12} y={56} fontSize={9} fill="#7090b0">{line3}</SvgText>
      <SvgText x={12} y={72} fontSize={9} fill="#7090b0">
        {`Core: ${core?.coreNumber}   Depth units: ${du}   Intervals: ${(core?.intervals||[]).length}`}
      </SvgText>
      <SvgText x={svgW - 12} y={22} fontSize={9} fill="#506080" textAnchor="end">CoreLog</SvgText>
    </G>
  );
}

// ─── Main canvas component ────────────────────────────────────────────────────

export default function StripLogCanvas({ project, core, columns, scalePixPerM, customLithologies = [] }) {
  const layout = useMemo(
    () => computeStripLayout(core, columns, scalePixPerM, customLithologies),
    [core, columns, scalePixPerM, customLithologies],
  );

  const { intervals, allStructureObs, measuredPorosity, depthMin, depthMax, colPositions, svgW, svgH, totalW, yForDepth } = layout;

  const dataY0 = STRIP_HEADER_H + STRIP_COL_HEADER_H;

  return (
    <ScrollView horizontal>
      <ScrollView>
        <Svg width={svgW} height={svgH}>
          <SvgPatternDefs />

          <StripHeader project={project} core={core} svgW={svgW} />
          <ColHeaders colPositions={colPositions} />

          {/* Data area white background */}
          <Rect x={0} y={dataY0} width={svgW} height={svgH - dataY0} fill="white" />

          {/* Columns */}
          {colPositions.map((col) => {
            switch (col.type) {
              case 'depth':
                return <DepthColumn key={col.id} col={col} depthMin={depthMin} depthMax={depthMax}
                  scalePixPerM={scalePixPerM} totalW={totalW} />;
              case 'lithology':
                return <LithologyColumn key={col.id} col={col} intervals={intervals} />;
              case 'grain_size':
                return <GrainSizeColumn key={col.id} col={col} intervals={intervals} />;
              case 'bar':
                return <BarColumn key={col.id} col={col} intervals={intervals} />;
              case 'bi':
                return <BIColumn key={col.id} col={col} intervals={intervals} />;
              case 'structures':
                return <StructuresColumn key={col.id} col={col} allStructureObs={allStructureObs} />;
              case 'text':
                return <TextColumn key={col.id} col={col} intervals={intervals} />;
              case 'porosity_measured':
                return <PorosityMeasuredColumn key={col.id} col={col}
                  measuredPorosity={measuredPorosity} yForDepth={yForDepth} />;
              default:
                return null;
            }
          })}

          {/* Outer border */}
          <Rect x={0} y={dataY0} width={svgW} height={svgH - dataY0}
            fill="none" stroke="#555" strokeWidth={1.5} />
        </Svg>
      </ScrollView>
    </ScrollView>
  );
}
