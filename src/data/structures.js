// Sedimentary structures and fossils
// Each has an id, name, abbreviation, and SVG symbol descriptor

export const STRUCTURES_COMMON = [
  { id: 'planar_lam', name: 'Planar Lamination', abbrev: 'Pl', category: 'physical', symbol: 'planar_lam' },
  { id: 'cross_bed', name: 'Cross-Bedding', abbrev: 'Xb', category: 'physical', symbol: 'cross_bed' },
  { id: 'ripple_xlam', name: 'Ripple Cross-Lam', abbrev: 'Rx', category: 'physical', symbol: 'ripple_xlam' },
  { id: 'trough_xbed', name: 'Trough Cross-Bed', abbrev: 'Tx', category: 'physical', symbol: 'trough_xbed' },
  { id: 'flaser', name: 'Flaser Bedding', abbrev: 'Fl', category: 'physical', symbol: 'flaser' },
  { id: 'wavy_bed', name: 'Wavy Bedding', abbrev: 'Wv', category: 'physical', symbol: 'wavy_bed' },
  { id: 'lenticular', name: 'Lenticular Bedding', abbrev: 'Le', category: 'physical', symbol: 'lenticular' },
  { id: 'graded_bed', name: 'Graded Bedding', abbrev: 'Gr', category: 'physical', symbol: 'graded_bed' },
  { id: 'bioturb_massive', name: 'Bioturbation (massive)', abbrev: 'Bi', category: 'bio', symbol: 'bioturb' },
  { id: 'load_struct', name: 'Load Structures', abbrev: 'Lo', category: 'physical', symbol: 'load' },
  { id: 'flame_struct', name: 'Flame Structures', abbrev: 'Fr', category: 'physical', symbol: 'flame' },
  { id: 'slumping', name: 'Slumping', abbrev: 'Sl', category: 'physical', symbol: 'slump' },
  { id: 'erosional_contact', name: 'Erosional Contact', abbrev: 'Er', category: 'physical', symbol: 'erosion' },
  { id: 'tool_marks', name: 'Tool Marks', abbrev: 'To', category: 'physical', symbol: 'tool_marks' },
  { id: 'trace_fossil', name: 'Trace Fossils', abbrev: 'Tr', category: 'bio', symbol: 'trace' },
  { id: 'body_fossil', name: 'Body Fossils', abbrev: 'Fo', category: 'bio', symbol: 'fossil' },
  { id: 'rootlets', name: 'Rootlets', abbrev: 'Ro', category: 'bio', symbol: 'rootlets' },
  { id: 'coal_streak', name: 'Coal Streaks', abbrev: 'Co', category: 'physical', symbol: 'coal_streak' },
  { id: 'stylolite', name: 'Stylolites', abbrev: 'St', category: 'diagenetic', symbol: 'stylolite' },
  { id: 'fracture', name: 'Fractures', abbrev: 'Fc', category: 'structural', symbol: 'fracture' },
  { id: 'vein', name: 'Veins', abbrev: 'Ve', category: 'structural', symbol: 'vein' },
  { id: 'nodule', name: 'Nodules', abbrev: 'No', category: 'diagenetic', symbol: 'nodule' },
  { id: 'concretion', name: 'Concretions', abbrev: 'Cn', category: 'diagenetic', symbol: 'concretion' },
];

export const STRUCTURES_ALTERNATE = [
  { id: 'hummocky_xstrat', name: 'Hummocky Cross-Strat', abbrev: 'Hx', category: 'physical', symbol: 'hummocky' },
  { id: 'swaley_xstrat', name: 'Swaley Cross-Strat', abbrev: 'Sx', category: 'physical', symbol: 'swaley' },
  { id: 'convolute', name: 'Convolute Lamination', abbrev: 'Cv', category: 'physical', symbol: 'convolute' },
  { id: 'dish_struct', name: 'Dish Structures', abbrev: 'Di', category: 'physical', symbol: 'dish' },
  { id: 'soft_sed_deform', name: 'Soft-Sed Deformation', abbrev: 'Sd', category: 'physical', symbol: 'soft_deform' },
  { id: 'water_escape', name: 'Water Escape', abbrev: 'We', category: 'physical', symbol: 'water_escape' },
  { id: 'burrows_vert', name: 'Vertical Burrows', abbrev: 'Bv', category: 'bio', symbol: 'burrow_vert' },
  { id: 'burrows_horiz', name: 'Horizontal Burrows', abbrev: 'Bh', category: 'bio', symbol: 'burrow_horiz' },
  { id: 'shell_hash', name: 'Shell Hash', abbrev: 'Sh', category: 'bio', symbol: 'shell_hash' },
  { id: 'plant_frag', name: 'Plant Fragments', abbrev: 'Pf', category: 'bio', symbol: 'plant_frag' },
  { id: 'desiccation', name: 'Desiccation Cracks', abbrev: 'De', category: 'physical', symbol: 'desiccation' },
  { id: 'rip_up_clasts', name: 'Rip-Up Clasts', abbrev: 'Ru', category: 'physical', symbol: 'rip_up' },
  { id: 'intraclasts', name: 'Intraclasts', abbrev: 'In', category: 'physical', symbol: 'intraclast' },
  { id: 'cement_calcite', name: 'Calcite Cement', abbrev: 'Cc', category: 'diagenetic', symbol: 'calcite_cem' },
  { id: 'pyrite_nodule', name: 'Pyrite Nodule', abbrev: 'Py', category: 'diagenetic', symbol: 'pyrite' },
  { id: 'dissolution', name: 'Dissolution', abbrev: 'Do', category: 'diagenetic', symbol: 'dissolution' },
];

export function getStructureById(id) {
  return (
    STRUCTURES_COMMON.find((s) => s.id === id) ||
    STRUCTURES_ALTERNATE.find((s) => s.id === id) ||
    null
  );
}
