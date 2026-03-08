/**
 * Parses a depth/porosity text file.
 * Returns a sorted array of { depth: number, value: number (fraction 0-1) }.
 *
 * Accepts: comma, tab, or semicolon delimiters.
 * Recognises column headers containing any of:
 *   depth keywords : depth, dep, md, tvd, z
 *   porosity keywords: phi, por, porosity, phie, phit
 * Falls back to columns [0, 1] if no recognised headers.
 * Values > 1 are treated as percent and divided by 100.
 */
export function parsePorosityCsv(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith('#'));
  if (lines.length === 0) throw new Error('File is empty');

  // Detect separator
  const first = lines[0];
  const sep = first.includes('\t') ? '\t' : first.includes(';') ? ';' : ',';

  const split = (line) => line.split(sep).map(s => s.trim().replace(/^["']|["']$/g, ''));

  const headers = split(first).map(h => h.toLowerCase());

  // Identify depth and porosity column indices
  const DEPTH_KW = ['depth', 'dep', 'md', 'tvd', 'z', 'measured_depth', 'true_depth'];
  const PHI_KW   = ['phi', 'por', 'porosity', 'phie', 'phit', 'nphi', 'dphi', 'core_phi', 'corephi'];

  let depCol = headers.findIndex(h => DEPTH_KW.some(k => h.includes(k)));
  let phiCol = headers.findIndex(h => PHI_KW.some(k => h.includes(k)));

  // Check if first line is truly a header (any cell is non-numeric)
  const firstIsHeader = headers.some(h => isNaN(parseFloat(h)));

  let dataLines = firstIsHeader ? lines.slice(1) : lines;
  if (!firstIsHeader) {
    depCol = 0;
    phiCol = 1;
  }
  if (depCol < 0) depCol = 0;
  if (phiCol < 0) phiCol = depCol === 0 ? 1 : 0;

  const points = [];
  for (const line of dataLines) {
    const cells = split(line);
    if (cells.length <= Math.max(depCol, phiCol)) continue;
    const depth = parseFloat(cells[depCol]);
    let value  = parseFloat(cells[phiCol]);
    if (isNaN(depth) || isNaN(value)) continue;
    // Convert percent → fraction
    if (value > 1) value = value / 100;
    // Clamp to [0, 1]
    value = Math.max(0, Math.min(1, value));
    points.push({ depth, value });
  }

  if (points.length === 0) throw new Error('No valid depth/porosity pairs found');

  // Sort by depth ascending
  points.sort((a, b) => a.depth - b.depth);
  return points;
}
