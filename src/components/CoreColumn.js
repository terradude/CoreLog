import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Svg, {
  Rect, Line, Text as SvgText, Path, Circle, G,
} from 'react-native-svg';
import { colors } from '../theme/colors';
import { getLithologyById } from '../data/lithologies';
import { getStructureById } from '../data/structures';

const COLUMN_WIDTH = 80; // px — the lithology pattern column
const SCALE_WIDTH = 44;  // depth scale on left
const STRUCT_WIDTH = 24; // structure symbol column on right
const TOTAL_WIDTH = SCALE_WIDTH + COLUMN_WIDTH + STRUCT_WIDTH;

const CONTACT_DASH = {
  sharp: null,
  gradational: '4,3',
  scoured: null, // drawn as wavy
  faulted: null, // drawn as zigzag
  bioturbated: '2,2',
  uncertain: '6,2,2,2',
  undulating: null,
  inclined: null,
};

function contactLinePath(type, x1, x2, y) {
  switch (type) {
    case 'scoured': {
      // Wavy line
      let d = `M ${x1} ${y}`;
      for (let x = x1; x < x2; x += 8) {
        d += ` Q ${x + 2} ${y - 3} ${x + 4} ${y} Q ${x + 6} ${y + 3} ${x + 8} ${y}`;
      }
      return { d, dash: null };
    }
    case 'faulted': {
      // Zigzag
      let d = `M ${x1} ${y}`;
      let up = true;
      for (let x = x1; x < x2; x += 6) {
        d += ` L ${x + 6} ${y + (up ? -3 : 3)}`;
        up = !up;
      }
      return { d, dash: null };
    }
    case 'inclined': {
      return { d: `M ${x1} ${y - 4} L ${x2} ${y + 4}`, dash: null };
    }
    default:
      return { d: `M ${x1} ${y} L ${x2} ${y}`, dash: CONTACT_DASH[type] || null };
  }
}

// Simple structure symbols drawn in SVG
function StructureSymbol({ id, cx, cy, size = 8 }) {
  const s = size;
  switch (id) {
    case 'planar_lam':
      return <Line x1={cx - s} y1={cy} x2={cx + s} y2={cy} stroke="#444" strokeWidth={1} />;
    case 'cross_bed':
      return (
        <G>
          <Line x1={cx - s} y1={cy + s} x2={cx + s} y2={cy - s} stroke="#444" strokeWidth={1} />
          <Line x1={cx - s} y1={cy} x2={cx + s} y2={cy} stroke="#444" strokeWidth={0.7} />
        </G>
      );
    case 'ripple_xlam': {
      const d = `M ${cx - s} ${cy} Q ${cx} ${cy - s} ${cx + s} ${cy}`;
      return <Path d={d} stroke="#444" strokeWidth={1} fill="none" />;
    }
    case 'graded_bed':
      return (
        <G>
          <Line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy - s} stroke="#444" strokeWidth={1.5} />
          <Line x1={cx - s} y1={cy} x2={cx + s} y2={cy} stroke="#444" strokeWidth={1} />
          <Line x1={cx - s} y1={cy + s} x2={cx + s} y2={cy + s} stroke="#444" strokeWidth={0.5} />
        </G>
      );
    case 'bioturbation':
    case 'bioturb_massive':
      return (
        <G>
          <Circle cx={cx} cy={cy} r={s * 0.6} stroke="#444" strokeWidth={0.8} fill="none" />
          <Line x1={cx - s * 0.4} y1={cy - s * 0.4} x2={cx + s * 0.4} y2={cy + s * 0.4} stroke="#444" strokeWidth={0.7} />
        </G>
      );
    case 'fracture':
      return (
        <G>
          <Line x1={cx - s * 0.5} y1={cy - s} x2={cx + s * 0.5} y2={cy + s} stroke="#444" strokeWidth={1} strokeDasharray="2,1" />
        </G>
      );
    case 'vein':
      return (
        <G>
          <Line x1={cx - s * 0.5} y1={cy - s} x2={cx + s * 0.5} y2={cy + s} stroke="#888" strokeWidth={2} />
        </G>
      );
    case 'stylolite': {
      const d = `M ${cx - s} ${cy} L ${cx - s / 2} ${cy - s / 2} L ${cx} ${cy} L ${cx + s / 2} ${cy - s / 2} L ${cx + s} ${cy}`;
      return <Path d={d} stroke="#444" strokeWidth={1} fill="none" />;
    }
    case 'trace_fossil':
      return <Circle cx={cx} cy={cy} r={s * 0.7} stroke="#444" strokeWidth={0.8} fill="none" strokeDasharray="2,2" />;
    case 'body_fossil':
      return <Circle cx={cx} cy={cy} r={s * 0.7} stroke="#444" strokeWidth={1.2} fill="none" />;
    case 'nodule':
    case 'concretion':
      return <Circle cx={cx} cy={cy} r={s * 0.6} fill="#ccc" stroke="#888" strokeWidth={0.8} />;
    default:
      return <Circle cx={cx} cy={cy} r={3} fill="#999" />;
  }
}

export default function CoreColumn({
  intervals = [],
  structures = [],
  activeIntervalId,
  depthMin,
  depthMax,
  height,
  onDepthTap,
  customLithologies = [],
}) {
  const w = TOTAL_WIDTH;
  const h = height || 600;
  const padding = 20; // top and bottom padding in pixels
  const drawHeight = h - 2 * padding;

  function depthToY(depth) {
    if (depthMax === depthMin) return padding;
    return padding + ((depth - depthMin) / (depthMax - depthMin)) * drawHeight;
  }

  const sortedIntervals = useMemo(
    () => [...intervals].sort((a, b) => parseFloat(a.topDepth) - parseFloat(b.topDepth)),
    [intervals]
  );

  // Depth scale ticks
  const ticks = useMemo(() => {
    if (depthMax === depthMin) return [];
    const range = depthMax - depthMin;
    let step = 1;
    if (range > 50) step = 5;
    else if (range > 20) step = 2;
    const result = [];
    const start = Math.ceil(depthMin / step) * step;
    for (let d = start; d <= depthMax; d += step) {
      result.push(d);
    }
    return result;
  }, [depthMin, depthMax]);

  function handleTap(evt) {
    if (!onDepthTap) return;
    const tapY = evt.nativeEvent.locationY;
    const depth = depthMin + ((tapY - padding) / drawHeight) * (depthMax - depthMin);
    onDepthTap(Math.max(depthMin, Math.min(depthMax, depth)));
  }

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={{ width: w, height: h, backgroundColor: colors.columnBg }}>
        <Svg width={w} height={h}>
          {/* ── Depth scale ─────────────────────────────────── */}
          <Rect x={0} y={0} width={SCALE_WIDTH} height={h} fill="#f0f0f0" />
          <Line x1={SCALE_WIDTH} y1={0} x2={SCALE_WIDTH} y2={h} stroke={colors.columnBorder} strokeWidth={1} />

          {ticks.map((d) => {
            const y = depthToY(d);
            const major = d % (ticks.length > 20 ? 10 : 5) === 0;
            return (
              <G key={d}>
                <Line x1={SCALE_WIDTH - (major ? 8 : 4)} y1={y} x2={SCALE_WIDTH} y2={y}
                  stroke={colors.columnBorder} strokeWidth={major ? 1.2 : 0.7} />
                {major && (
                  <SvgText x={SCALE_WIDTH - 12} y={y + 4} fontSize={9} fill="#555" textAnchor="end">
                    {d}
                  </SvgText>
                )}
              </G>
            );
          })}

          {/* ── Lithology column background ──────────────────── */}
          <Rect
            x={SCALE_WIDTH}
            y={padding}
            width={COLUMN_WIDTH}
            height={drawHeight}
            fill="#fff"
            stroke={colors.columnBorder}
            strokeWidth={1}
          />

          {/* ── Intervals ────────────────────────────────────── */}
          {sortedIntervals.map((interval) => {
            const topD = parseFloat(interval.topDepth);
            const baseD = parseFloat(interval.baseDepth);
            if (isNaN(topD) || isNaN(baseD)) return null;
            const y1 = depthToY(topD);
            const y2 = depthToY(baseD);
            if (y2 <= y1) return null;

            const lith = getLithologyById(interval.lithologyId, customLithologies);
            const fillColor = lith?.fillColor || '#eeeeee';
            const isActive = interval.id === activeIntervalId;
            const colX = SCALE_WIDTH;
            const colW = COLUMN_WIDTH;

            // Top contact line
            const { d: topD2, dash: topDash } = contactLinePath(interval.topContact || 'sharp', colX, colX + colW, y1);
            // Base contact line
            const { d: baseD2, dash: baseDash } = contactLinePath(interval.baseContact || 'sharp', colX, colX + colW, y2);

            return (
              <G key={interval.id}>
                {/* Fill */}
                <Rect x={colX} y={y1} width={colW} height={y2 - y1} fill={fillColor} />

                {/* Active highlight */}
                {isActive && (
                  <Rect x={colX} y={y1} width={colW} height={y2 - y1}
                    fill={colors.cursorHighlight} />
                )}

                {/* Top contact */}
                <Path d={topD2} stroke="#222" strokeWidth={1.5}
                  strokeDasharray={topDash || undefined} fill="none" />

                {/* Base contact */}
                <Path d={baseD2} stroke="#222" strokeWidth={1}
                  strokeDasharray={baseDash || undefined} fill="none" />
              </G>
            );
          })}

          {/* ── Structure symbols ─────────────────────────────── */}
          <Rect
            x={SCALE_WIDTH + COLUMN_WIDTH}
            y={padding}
            width={STRUCT_WIDTH}
            height={drawHeight}
            fill="#fafafa"
            stroke={colors.columnBorder}
            strokeWidth={0.5}
          />

          {structures.map((obs, idx) => {
            const d = parseFloat(obs.depth);
            if (isNaN(d)) return null;
            const y = depthToY(d);
            const cx = SCALE_WIDTH + COLUMN_WIDTH + STRUCT_WIDTH / 2;
            return (
              <G key={`${obs.structureId}_${idx}`}>
                <StructureSymbol id={obs.structureId} cx={cx} cy={y} />
              </G>
            );
          })}

          {/* ── Labels ────────────────────────────────────────── */}
          <SvgText x={SCALE_WIDTH + COLUMN_WIDTH / 2} y={14} fontSize={8}
            fill="#666" textAnchor="middle">
            TOP
          </SvgText>
          <SvgText x={SCALE_WIDTH + COLUMN_WIDTH / 2} y={h - 5} fontSize={8}
            fill="#666" textAnchor="middle">
            BASE
          </SvgText>
        </Svg>
      </View>
    </TouchableWithoutFeedback>
  );
}
