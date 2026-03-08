import { getLithologyById } from '../data/lithologies';
import { STRUCTURES_COMMON, STRUCTURES_ALTERNATE } from '../data/structures';

const ALL_STRUCTURES = [...STRUCTURES_COMMON, ...STRUCTURES_ALTERNATE];

function structureName(id) {
  return ALL_STRUCTURES.find(s => s.id === id)?.name || id;
}

function csvCell(val) {
  if (val == null || val === '') return '';
  const s = String(val);
  // Quote if contains comma, quote, or newline
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function row(cells) {
  return cells.map(csvCell).join(',');
}

const HEADERS = [
  'Top Depth', 'Base Depth',
  'Lithology', 'Lithology Abbrev',
  'Interbedded', 'Secondary Lithology', 'Interbedded %',
  'Top Contact', 'Base Contact',
  'Bedding Style', 'Grain Size', 'Clay %',
  'Sorting', 'Bioturbation Index', 'Colour',
  'Porosity Type', 'Porosity %',
  'HC Stain', 'Stain Colour', 'Shows',
  'Fluorescence', 'Fluorescence Colour',
  'Lithofacies Code', 'Lithofacies Assoc',
  'Depositional Environment', 'Depositional Complex',
  'Remarks',
  'Structures',
];

export function exportIntervalsCsv(core, customLithologies = []) {
  const intervals = [...(core?.intervals || [])]
    .filter(iv => iv.topDepth !== '' && iv.baseDepth !== '')
    .sort((a, b) => parseFloat(a.topDepth) - parseFloat(b.topDepth));

  const lines = [row(HEADERS)];

  for (const iv of intervals) {
    const lith = getLithologyById(iv.lithologyId, customLithologies);
    const secLith = iv.isInterbedded && iv.secondaryLithologyId
      ? getLithologyById(iv.secondaryLithologyId, customLithologies)
      : null;

    const structures = (iv.structures || [])
      .map(s => `${structureName(s.structureId)}@${s.depth}`)
      .join('; ');

    lines.push(row([
      iv.topDepth,
      iv.baseDepth,
      lith?.name || iv.lithologyId || '',
      lith?.abbrev || '',
      iv.isInterbedded ? 'Yes' : 'No',
      secLith?.name || '',
      iv.isInterbedded ? (iv.interbeddedPercent ?? '') : '',
      iv.topContact || '',
      iv.baseContact || '',
      iv.beddingStyle || '',
      iv.grainSize || '',
      iv.clayPercent ?? '',
      iv.sorting || '',
      iv.bioturbationIndex ?? '',
      iv.colour || '',
      iv.porosityType || '',
      iv.porosityEstimate ?? '',
      iv.hcStain || '',
      iv.stainColour || '',
      iv.shows || '',
      iv.fluorescence || '',
      iv.fluorescenceColour || '',
      iv.lithofaciesCode || '',
      iv.lithofaciesAssoc || '',
      iv.depositionalEnvironment || '',
      iv.depositionalComplex || '',
      iv.remarks || '',
      structures,
    ]));
  }

  return lines.join('\n');
}

export function csvFilename(project, core) {
  const well = project?.header?.wellName || project?.header?.coreName || 'CoreLog';
  const coreNum = core?.coreNumber || 1;
  const safe = well.replace(/[^a-zA-Z0-9_\-]/g, '_');
  return `${safe}_Core${coreNum}.csv`;
}
