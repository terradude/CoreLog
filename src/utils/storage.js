import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PROJECTS: '@corelog:projects',
  SETTINGS: '@corelog:settings',
  RECENT_ENVIRONMENTS: '@corelog:recent_environments',
  RECENT_COMPLEXES: '@corelog:recent_complexes',
  STRIP_TEMPLATES: '@corelog:strip_templates',
  CUSTOM_LITHOLOGIES: '@corelog:custom_lithologies',
};

// ─── Generic helpers ────────────────────────────────────────────────────────

async function getItem(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Storage getItem error', key, e);
    return null;
  }
}

async function setItem(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage setItem error', key, e);
  }
}

// ─── Projects ───────────────────────────────────────────────────────────────

export async function loadProjects() {
  return (await getItem(KEYS.PROJECTS)) || [];
}

export async function saveProjects(projects) {
  await setItem(KEYS.PROJECTS, projects);
}

export async function loadProject(projectId) {
  const projects = await loadProjects();
  return projects.find((p) => p.id === projectId) || null;
}

export async function saveProject(project) {
  const projects = await loadProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.push(project);
  }
  await saveProjects(projects);
}

export async function deleteProject(projectId) {
  const projects = await loadProjects();
  await saveProjects(projects.filter((p) => p.id !== projectId));
}

// ─── Settings ───────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  depthUnits: 'metres',
  defaultLoggedBy: '',
  stripColumns: null,
};

export async function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...(await getItem(KEYS.SETTINGS)) };
}

export async function saveSettings(settings) {
  await setItem(KEYS.SETTINGS, settings);
}

// ─── Recent dropdowns ────────────────────────────────────────────────────────

export async function loadRecentEnvironments() {
  return (await getItem(KEYS.RECENT_ENVIRONMENTS)) || [];
}

export async function addRecentEnvironment(env) {
  if (!env || !env.trim()) return;
  let list = await loadRecentEnvironments();
  list = [env, ...list.filter((e) => e !== env)].slice(0, 20);
  await setItem(KEYS.RECENT_ENVIRONMENTS, list);
}

export async function loadRecentComplexes() {
  return (await getItem(KEYS.RECENT_COMPLEXES)) || [];
}

export async function addRecentComplex(cx) {
  if (!cx || !cx.trim()) return;
  let list = await loadRecentComplexes();
  list = [cx, ...list.filter((e) => e !== cx)].slice(0, 20);
  await setItem(KEYS.RECENT_COMPLEXES, list);
}

// ─── Strip log templates ─────────────────────────────────────────────────────

export async function loadStripTemplates() {
  return (await getItem(KEYS.STRIP_TEMPLATES)) || [];
}

export async function saveStripTemplates(templates) {
  await setItem(KEYS.STRIP_TEMPLATES, templates);
}

// ─── Custom lithologies ──────────────────────────────────────────────────────

export async function loadCustomLithologies() {
  return (await getItem(KEYS.CUSTOM_LITHOLOGIES)) || [];
}

export async function saveCustomLithologies(list) {
  await setItem(KEYS.CUSTOM_LITHOLOGIES, list);
}

// ─── ID generator ────────────────────────────────────────────────────────────

export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── New project skeleton ─────────────────────────────────────────────────────

export function createEmptyProject(type = 'western_canada') {
  return {
    id: generateId(),
    type, // 'western_canada' | 'international'
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    header: type === 'western_canada' ? {
      wellName: '',
      lsd: '',
      sec: '',
      twp: '',
      rng: '',
      mer: '',
      other: '',
      dateLogged: new Date().toISOString(),
      loggedBy: '',
      remarks: '',
      depthUnits: 'metres',
      groundElevation: '',
      kbElevation: '',
    } : {
      coreName: '',
      latDeg: '',
      latMin: '',
      lonDeg: '',
      lonMin: '',
      date: new Date().toISOString(),
      describedBy: '',
      waterDepth: '',
      rigFloorToSeaLevel: '',
      depthUnits: 'metres',
    },
    cores: [],
  };
}

export function createEmptyCore(coreNumber) {
  return {
    id: generateId(),
    coreNumber,
    numberOfBoxes: 0,
    orientation: 'downhole',
    boxes: [],
    intervals: [],
    pointObservations: [],
  };
}

export function createEmptyBox(boxNumber) {
  return {
    id: generateId(),
    boxNumber,
    topDepth: '',
    bottomDepth: '',
  };
}

export function createEmptyInterval() {
  return {
    id: generateId(),
    topDepth: '',
    baseDepth: '',
    lithologyId: null,
    isInterbedded: false,
    secondaryLithologyId: null,
    interbeddedPercent: 50,
    topContact: 'sharp',
    baseContact: 'sharp',
    beddingStyle: 'massive',
    grainSize: null,
    clayPercent: '',
    sorting: null,
    bioturbationIndex: 0,
    colour: null,
    porosityType: 'none',
    porosityEstimate: '',
    hcStain: 'none',
    stainColour: 'none',
    shows: 'none',
    fluorescence: 'none',
    fluorescenceColour: 'none',
    lithofaciesCode: '',
    lithofaciesAssoc: '',
    depositionalEnvironment: '',
    depositionalComplex: '',
    remarks: '',
    structures: [], // array of { structureId, depth }
  };
}
