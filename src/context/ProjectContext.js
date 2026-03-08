import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  loadProjects,
  saveProject,
  deleteProject,
  loadSettings,
  saveSettings,
  loadCustomLithologies,
  saveCustomLithologies,
  createEmptyProject,
  createEmptyCore,
  createEmptyBox,
  createEmptyInterval,
  generateId,
} from '../utils/storage';

// ─── State shape ─────────────────────────────────────────────────────────────
const initialState = {
  projects: [],
  activeProjectId: null,
  activeCoreId: null,
  activeIntervalId: null,
  settings: {
    depthUnits: 'metres',
    defaultLoggedBy: '',
  },
  customLithologies: [],
  loading: true,
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        projects: action.projects,
        settings: action.settings,
        customLithologies: action.customLithologies,
        loading: false,
      };

    case 'SET_PROJECTS':
      return { ...state, projects: action.projects };

    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProjectId: action.id, activeCoreId: null, activeIntervalId: null };

    case 'SET_ACTIVE_CORE':
      return { ...state, activeCoreId: action.id, activeIntervalId: null };

    case 'SET_ACTIVE_INTERVAL':
      return { ...state, activeIntervalId: action.id };

    case 'UPDATE_PROJECT': {
      const projects = state.projects.map((p) =>
        p.id === action.project.id ? { ...action.project, updatedAt: new Date().toISOString() } : p
      );
      return { ...state, projects };
    }

    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.project] };

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.id),
        activeProjectId: state.activeProjectId === action.id ? null : state.activeProjectId,
      };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case 'SET_CUSTOM_LITHOLOGIES':
      return { ...state, customLithologies: action.list };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load on mount
  useEffect(() => {
    async function init() {
      const [projects, settings, customLithologies] = await Promise.all([
        loadProjects(),
        loadSettings(),
        loadCustomLithologies(),
      ]);
      dispatch({ type: 'INIT', projects, settings, customLithologies });
    }
    init();
  }, []);

  // Derived helpers
  const activeProject = state.projects.find((p) => p.id === state.activeProjectId) || null;
  const activeCore = activeProject?.cores?.find((c) => c.id === state.activeCoreId) || null;
  const activeInterval = activeCore?.intervals?.find((i) => i.id === state.activeIntervalId) || null;

  // Actions
  const actions = {
    // Projects
    createProject: async (type) => {
      const project = createEmptyProject(type);
      dispatch({ type: 'ADD_PROJECT', project });
      await saveProject(project);
      dispatch({ type: 'SET_ACTIVE_PROJECT', id: project.id });
      return project;
    },

    updateProject: async (project) => {
      dispatch({ type: 'UPDATE_PROJECT', project });
      await saveProject(project);
    },

    deleteProject: async (id) => {
      dispatch({ type: 'DELETE_PROJECT', id });
      await deleteProject(id);
    },

    setActiveProject: (id) => dispatch({ type: 'SET_ACTIVE_PROJECT', id }),
    setActiveCore: (id) => dispatch({ type: 'SET_ACTIVE_CORE', id }),
    setActiveInterval: (id) => dispatch({ type: 'SET_ACTIVE_INTERVAL', id }),

    // Header
    updateHeader: async (headerFields) => {
      if (!activeProject) return;
      const updated = { ...activeProject, header: { ...activeProject.header, ...headerFields } };
      dispatch({ type: 'UPDATE_PROJECT', project: updated });
      await saveProject(updated);
    },

    // Cores
    addCore: async (coreNumber) => {
      if (!activeProject) return;
      const core = createEmptyCore(coreNumber);
      const updated = { ...activeProject, cores: [...activeProject.cores, core] };
      dispatch({ type: 'UPDATE_PROJECT', project: updated });
      await saveProject(updated);
      dispatch({ type: 'SET_ACTIVE_CORE', id: core.id });
      return core;
    },

    updateCore: async (coreData) => {
      if (!activeProject) return;
      const cores = activeProject.cores.map((c) => (c.id === coreData.id ? coreData : c));
      const updated = { ...activeProject, cores };
      dispatch({ type: 'UPDATE_PROJECT', project: updated });
      await saveProject(updated);
    },

    // Boxes
    updateBoxes: async (coreId, boxes) => {
      if (!activeProject) return;
      const cores = activeProject.cores.map((c) =>
        c.id === coreId ? { ...c, boxes } : c
      );
      const updated = { ...activeProject, cores };
      dispatch({ type: 'UPDATE_PROJECT', project: updated });
      await saveProject(updated);
    },

    // Intervals
    addInterval: async (coreId, intervalData = {}) => {
      if (!activeProject) return;
      const interval = { ...createEmptyInterval(), ...intervalData };
      const cores = activeProject.cores.map((c) =>
        c.id === coreId ? { ...c, intervals: [...c.intervals, interval] } : c
      );
      const updated = { ...activeProject, cores };
      dispatch({ type: 'UPDATE_PROJECT', project: updated });
      await saveProject(updated);
      dispatch({ type: 'SET_ACTIVE_INTERVAL', id: interval.id });
      return interval;
    },

    updateInterval: async (coreId, interval) => {
      if (!activeProject) return;
      const cores = activeProject.cores.map((c) =>
        c.id === coreId
          ? { ...c, intervals: c.intervals.map((i) => (i.id === interval.id ? interval : i)) }
          : c
      );
      const updated = { ...activeProject, cores };
      dispatch({ type: 'UPDATE_PROJECT', project: updated });
      await saveProject(updated);
    },

    deleteInterval: async (coreId, intervalId) => {
      if (!activeProject) return;
      const cores = activeProject.cores.map((c) =>
        c.id === coreId
          ? { ...c, intervals: c.intervals.filter((i) => i.id !== intervalId) }
          : c
      );
      const updated = { ...activeProject, cores };
      dispatch({ type: 'UPDATE_PROJECT', project: updated });
      await saveProject(updated);
      if (state.activeIntervalId === intervalId) {
        dispatch({ type: 'SET_ACTIVE_INTERVAL', id: null });
      }
    },

    // Settings
    updateSettings: async (settings) => {
      dispatch({ type: 'UPDATE_SETTINGS', settings });
      const current = await loadSettings();
      await saveSettings({ ...current, ...settings });
    },

    // Measured porosity (array of { depth, value } points for a core)
    setCoreMeasuredPorosity: async (coreId, points) => {
      if (!activeProject) return;
      const cores = activeProject.cores.map((c) =>
        c.id === coreId ? { ...c, measuredPorosity: points } : c
      );
      const updated = { ...activeProject, cores };
      dispatch({ type: 'UPDATE_PROJECT', project: updated });
      await saveProject(updated);
    },

    // Custom lithologies
    setCustomLithologies: async (list) => {
      dispatch({ type: 'SET_CUSTOM_LITHOLOGIES', list });
      await saveCustomLithologies(list);
    },
  };

  return (
    <ProjectContext.Provider value={{ state, activeProject, activeCore, activeInterval, ...actions }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
