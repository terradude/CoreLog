import React from 'react';
import Svg, {
  Rect, Line, Circle, Path, Defs, Pattern, Use,
} from 'react-native-svg';

// Renders a lithology pattern swatch or fill in the core column.
// Props: pattern (object), width, height, forColumn (bool)
export default function LithologyPattern({ pattern, width = 48, height = 32, forColumn = false }) {
  if (!pattern) return null;

  const { type, color, bgColor } = pattern;
  const w = width;
  const h = height;

  // Background
  const bg = <Rect x={0} y={0} width={w} height={h} fill={bgColor} />;

  switch (type) {
    case 'brick': {
      const lines = [];
      for (let y = 0; y <= h; y += 6) {
        lines.push(<Line key={`h${y}`} x1={0} y1={y} x2={w} y2={y} stroke={color} strokeWidth={0.8} />);
      }
      for (let row = 0; row * 6 < h; row++) {
        const offset = row % 2 === 0 ? 0 : 10;
        for (let x = offset; x <= w + 10; x += 20) {
          lines.push(
            <Line key={`v${row}_${x}`} x1={x} y1={row * 6} x2={x} y2={(row + 1) * 6}
              stroke={color} strokeWidth={0.8} />
          );
        }
      }
      return <Svg width={w} height={h}>{bg}{lines}</Svg>;
    }

    case 'rhombus': {
      const shapes = [];
      const size = 9;
      for (let row = 0; row * size < h + size; row++) {
        for (let col = 0; col * size < w + size; col++) {
          const cx = col * size + (row % 2 === 0 ? 0 : size / 2);
          const cy = row * size;
          shapes.push(
            <Path key={`r${row}_${col}`}
              d={`M ${cx} ${cy - size / 2} L ${cx + size / 2} ${cy} L ${cx} ${cy + size / 2} L ${cx - size / 2} ${cy} Z`}
              stroke={color} strokeWidth={0.8} fill="none" />
          );
        }
      }
      return <Svg width={w} height={h}>{bg}{shapes}</Svg>;
    }

    case 'stipple': {
      const dots = [];
      for (let y = 3; y < h; y += 6) {
        for (let x = 3; x < w; x += 6) {
          const jx = (x + y * 0.3) % w;
          dots.push(<Circle key={`d${x}_${y}`} cx={jx} cy={y} r={0.8} fill={color} />);
        }
      }
      return <Svg width={w} height={h}>{bg}{dots}</Svg>;
    }

    case 'stipple_large':
    case 'large_dots': {
      const dots = [];
      for (let y = 4; y < h; y += 8) {
        for (let x = 4; x < w; x += 8) {
          dots.push(<Circle key={`d${x}_${y}`} cx={x} cy={y} r={type === 'large_dots' ? 3 : 2} fill={color} />);
        }
      }
      return <Svg width={w} height={h}>{bg}{dots}</Svg>;
    }

    case 'hline':
    case 'hline_dense':
    case 'hline_solid': {
      const spacing = type === 'hline_dense' ? 3 : type === 'hline_solid' ? 2 : 5;
      const lines = [];
      for (let y = spacing; y < h; y += spacing) {
        lines.push(<Line key={`l${y}`} x1={0} y1={y} x2={w} y2={y} stroke={color} strokeWidth={type === 'hline_solid' ? 1.2 : 0.7} />);
      }
      return <Svg width={w} height={h}>{bg}{lines}</Svg>;
    }

    case 'solid':
      return <Svg width={w} height={h}><Rect x={0} y={0} width={w} height={h} fill={bgColor} /></Svg>;

    case 'empty':
      return (
        <Svg width={w} height={h}>
          <Rect x={0} y={0} width={w} height={h} fill={bgColor} />
          <Rect x={0} y={0} width={w} height={h} fill="none" stroke={color} strokeWidth={1} strokeDasharray="4,4" />
        </Svg>
      );

    case 'diagonal_loss': {
      const lines = [];
      for (let i = -h; i < w + h; i += 8) {
        lines.push(
          <Line key={`dl${i}`} x1={i} y1={0} x2={i + h} y2={h} stroke={color} strokeWidth={1} />
        );
      }
      return <Svg width={w} height={h}>{bg}{lines}</Svg>;
    }

    case 'vhatch': {
      const lines = [];
      for (let x = 0; x < w; x += 5) {
        lines.push(<Line key={`vl${x}`} x1={x} y1={0} x2={x} y2={h} stroke={color} strokeWidth={0.7} />);
      }
      for (let y = 0; y < h; y += 5) {
        lines.push(<Line key={`hl${y}`} x1={0} y1={y} x2={w} y2={y} stroke={color} strokeWidth={0.7} />);
      }
      return <Svg width={w} height={h}>{bg}{lines}</Svg>;
    }

    case 'cross_hatch': {
      const lines = [];
      for (let i = -h; i < w + h; i += 7) {
        lines.push(<Line key={`d1${i}`} x1={i} y1={0} x2={i + h} y2={h} stroke={color} strokeWidth={0.7} />);
        lines.push(<Line key={`d2${i}`} x1={i + h} y1={0} x2={i} y2={h} stroke={color} strokeWidth={0.7} />);
      }
      return <Svg width={w} height={h}>{bg}{lines}</Svg>;
    }

    case 'wavy': {
      const paths = [];
      for (let y = 6; y < h; y += 8) {
        let d = `M 0 ${y}`;
        for (let x = 0; x <= w; x += 8) {
          d += ` Q ${x + 2} ${y - 3} ${x + 4} ${y} Q ${x + 6} ${y + 3} ${x + 8} ${y}`;
        }
        paths.push(<Path key={`w${y}`} d={d} stroke={color} strokeWidth={0.8} fill="none" />);
      }
      return <Svg width={w} height={h}>{bg}{paths}</Svg>;
    }

    case 'vesicular': {
      const circles = [];
      for (let y = 4; y < h; y += 7) {
        for (let x = 4; x < w; x += 7) {
          circles.push(<Circle key={`c${x}_${y}`} cx={x} cy={y} r={2} stroke={color} strokeWidth={0.6} fill="none" />);
        }
      }
      return <Svg width={w} height={h}>{bg}{circles}</Svg>;
    }

    case 'foliation':
    case 'schistosity': {
      const lines = [];
      const angle = type === 'schistosity' ? 30 : 0;
      for (let y = 5; y < h; y += 5) {
        const dy = angle === 0 ? 0 : 2;
        lines.push(<Line key={`f${y}`} x1={0} y1={y} x2={w} y2={y + dy} stroke={color} strokeWidth={0.8} />);
      }
      return <Svg width={w} height={h}>{bg}{lines}</Svg>;
    }

    case 'granite_speckle': {
      const specks = [];
      for (let y = 3; y < h; y += 5) {
        for (let x = 3; x < w; x += 5) {
          specks.push(<Rect key={`s${x}_${y}`} x={x} y={y} width={1.5} height={1.5} fill={color} />);
        }
      }
      return <Svg width={w} height={h}>{bg}{specks}</Svg>;
    }

    default:
      return (
        <Svg width={w} height={h}>
          <Rect x={0} y={0} width={w} height={h} fill={bgColor} />
        </Svg>
      );
  }
}
