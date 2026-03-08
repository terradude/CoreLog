export const CONTACT_TYPES = [
  { id: 'sharp', label: 'Sharp' },
  { id: 'scoured', label: 'Scoured' },
  { id: 'bioturbated', label: 'Bioturbated' },
  { id: 'uncertain', label: 'Uncertain' },
  { id: 'gradational', label: 'Gradational' },
  { id: 'undulating', label: 'Undulating' },
  { id: 'faulted', label: 'Faulted' },
  { id: 'inclined', label: 'Inclined' },
];

export const BEDDING_STYLES = [
  { id: 'massive', label: 'Massive' },
  { id: 'planar_lam', label: 'Planar Laminated' },
  { id: 'cross_bedded', label: 'Cross-Bedded' },
  { id: 'ripple_lam', label: 'Ripple Laminated' },
  { id: 'graded', label: 'Graded' },
  { id: 'disturbed', label: 'Disturbed' },
  { id: 'not_observed', label: 'Not Observed' },
];

export const GRAIN_SIZES = [
  { id: 'clay', label: 'Clay', width: 0.05 },
  { id: 'silt', label: 'Silt', width: 0.10 },
  { id: 'vf_sand', label: 'VF Sand', width: 0.20 },
  { id: 'f_sand', label: 'F Sand', width: 0.30 },
  { id: 'm_sand', label: 'M Sand', width: 0.45 },
  { id: 'c_sand', label: 'C Sand', width: 0.60 },
  { id: 'vc_sand', label: 'VC Sand', width: 0.75 },
  { id: 'granule', label: 'Granule', width: 0.85 },
  { id: 'pebble', label: 'Pebble', width: 0.93 },
  { id: 'cobble', label: 'Cobble', width: 1.0 },
];

export const SORTING = [
  { id: 'vw', label: 'Very Well' },
  { id: 'well', label: 'Well' },
  { id: 'mod', label: 'Moderate' },
  { id: 'poor', label: 'Poor' },
  { id: 'vp', label: 'Very Poor' },
];

export const COLOURS = [
  { id: 'lt_gy', label: 'lt GY', hex: '#d0d0d0' },
  { id: 'med_gy', label: 'med GY', hex: '#909090' },
  { id: 'dk_gy', label: 'dk GY', hex: '#505050' },
  { id: 'lt_br', label: 'lt BR', hex: '#c8a870' },
  { id: 'med_br', label: 'med BR', hex: '#906030' },
  { id: 'dk_br', label: 'dk BR', hex: '#503010' },
  { id: 'lt_ye', label: 'lt YE', hex: '#f0e080' },
  { id: 'dk_ye', label: 'dk YE', hex: '#c0b020' },
  { id: 'bk', label: 'BK', hex: '#202020' },
  { id: 'gn', label: 'GN', hex: '#50a050' },
  { id: 'lt_gn', label: 'lt GN', hex: '#90d090' },
  { id: 'dk_gn', label: 'dk GN', hex: '#206020' },
  { id: 'rd', label: 'RD', hex: '#c04040' },
  { id: 'lt_rd', label: 'lt RD', hex: '#e09090' },
  { id: 'wh', label: 'WH', hex: '#f8f8f8' },
  { id: 'pk', label: 'PK', hex: '#e8b0b0' },
  { id: 'buff', label: 'BUFF', hex: '#e8d8a0' },
  { id: 'bl', label: 'BL', hex: '#6080c0' },
  { id: 'pur', label: 'PUR', hex: '#9060b0' },
];

export const POROSITY_TYPES = [
  { id: 'none', label: 'None' },
  { id: 'intergranular', label: 'Intergranular' },
  { id: 'intercrystalline', label: 'Intercrystalline' },
  { id: 'vuggy', label: 'Vuggy' },
  { id: 'moldic', label: 'Moldic' },
  { id: 'fracture', label: 'Fracture' },
  { id: 'shelter', label: 'Shelter' },
  { id: 'mixed', label: 'Mixed' },
];

export const HC_STAINS = [
  { id: 'none', label: 'None' },
  { id: 'residual', label: 'Residual' },
  { id: 'light', label: 'Light' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'heavy', label: 'Heavy' },
  { id: 'solid', label: 'Solid' },
];

export const STAIN_COLOURS = [
  { id: 'none', label: 'None' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'brown', label: 'Brown' },
  { id: 'black', label: 'Black' },
  { id: 'iridescent', label: 'Iridescent' },
];

export const SHOWS = [
  { id: 'none', label: 'None' },
  { id: 'gas', label: 'Gas' },
  { id: 'condensate', label: 'Condensate' },
  { id: 'light_oil', label: 'Light Oil' },
  { id: 'medium_oil', label: 'Medium Oil' },
  { id: 'heavy_oil', label: 'Heavy Oil' },
  { id: 'tar', label: 'Tar' },
];

export const FLUORESCENCE = [
  { id: 'none', label: 'None' },
  { id: 'weak', label: 'Weak' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'strong', label: 'Strong' },
];

export const FLUORESCENCE_COLOURS = [
  { id: 'none', label: 'None' },
  { id: 'white', label: 'White' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'blue', label: 'Blue' },
  { id: 'orange', label: 'Orange' },
  { id: 'green', label: 'Green' },
];

export const BIOTURBATION_INDEX = [0, 1, 2, 3, 4, 5, 6];

export const BIOTURBATION_LABELS = {
  0: 'BI-0 No bioturbation',
  1: 'BI-1 Sparse (~1-10%)',
  2: 'BI-2 Low (~10-30%)',
  3: 'BI-3 Moderate (~30-60%)',
  4: 'BI-4 Abundant (~60-90%)',
  5: 'BI-5 Complete (>90%)',
  6: 'BI-6 Soupy/Fluid',
};
