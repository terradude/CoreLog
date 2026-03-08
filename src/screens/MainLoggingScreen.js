import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  ScrollView, useWindowDimensions, Alert, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '../theme/colors';
import { typography } from '../theme/typography';
import { useProject } from '../context/ProjectContext';
import CoreColumn from '../components/CoreColumn';
import LithologyTab from '../components/LithologyTab';
import StructuresTab from '../components/StructuresTab';
import AttributesTab from '../components/AttributesTab';
import InterpretationTab from '../components/InterpretationTab';

const TABS = ['LITHOLOGY', 'STRUCTURES', 'ATTRIBUTES', 'INTERPRETATION'];

export default function MainLoggingScreen({ navigation }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {
    activeProject,
    activeCore,
    activeInterval,
    state,
    addInterval,
    updateInterval,
    deleteInterval,
    setActiveCore,
    setActiveInterval,
  } = useProject();

  const [activeTab, setActiveTab] = useState(0);
  const [cursorDepth, setCursorDepth] = useState(null);
  const [topDepth, setTopDepth] = useState('');
  const [baseDepth, setBaseDepth] = useState('');

  const customLithologies = state.customLithologies || [];

  const isIntl = activeProject?.type === 'international';
  const boxLabel = isIntl ? 'Section' : 'Box';
  const depthUnits = activeProject?.header?.depthUnits || 'metres';
  const cores = activeProject?.cores || [];
  const intervals = activeCore?.intervals || [];
  const structures = intervals.flatMap((i) => (i.structures || []).map((s) => ({ ...s })));

  // Sync depth fields with active interval
  useEffect(() => {
    if (activeInterval) {
      setTopDepth(String(activeInterval.topDepth || ''));
      setBaseDepth(String(activeInterval.baseDepth || ''));
    }
  }, [activeInterval?.id]);

  // Compute column depth range
  const allDepths = intervals.flatMap((i) => [parseFloat(i.topDepth), parseFloat(i.baseDepth)]).filter(isFinite);
  const activeBoxDepths = activeCore?.boxes?.map((b) => [parseFloat(b.topDepth), parseFloat(b.bottomDepth)]).flat().filter(isFinite) || [];
  const allD = [...allDepths, ...activeBoxDepths];
  const depthMin = allD.length > 0 ? Math.min(...allD) : 0;
  const depthMax = allD.length > 0 ? Math.max(...allD) : 10;

  // Column panel occupies right 40%
  const leftW = Math.round(screenWidth * 0.60);
  const rightW = screenWidth - leftW;
  const columnHeight = screenHeight - insets.top - insets.bottom - 52; // 52 = header

  async function handleIntervalFieldUpdate(fields) {
    if (!activeInterval || !activeCore) return;
    const updated = { ...activeInterval, ...fields };
    await updateInterval(activeCore.id, updated);
  }

  async function handleNewInterval() {
    if (!activeCore) {
      Alert.alert('No Core Selected', 'Select a core run first from the header.');
      return;
    }
    const top = cursorDepth != null ? String(cursorDepth.toFixed(2)) : '';
    const interval = await addInterval(activeCore.id, {
      topDepth: top,
      baseDepth: '',
    });
    setTopDepth(top);
    setBaseDepth('');
  }

  async function handleDeleteInterval() {
    if (!activeInterval || !activeCore) return;
    Alert.alert('Delete Interval', 'Delete this logged interval?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteInterval(activeCore.id, activeInterval.id),
      },
    ]);
  }

  async function commitDepths() {
    if (!activeInterval || !activeCore) return;
    await handleIntervalFieldUpdate({ topDepth, baseDepth });
    if (topDepth && !isNaN(parseFloat(baseDepth))) {
      setCursorDepth(parseFloat(baseDepth));
    }
  }

  function getTitleParts() {
    if (!activeProject) return { well: 'No project', loc: '' };
    const h = activeProject.header;
    if (activeProject.type === 'western_canada') {
      return { well: h.wellName || 'Unnamed Well', loc: [h.lsd, h.sec, h.twp, h.rng].filter(Boolean).join('-') };
    }
    return { well: h.coreName || 'Unnamed Core', loc: `${h.latDeg || ''}° N` };
  }
  const { well, loc } = getTitleParts();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── App header ────────────────────────────────────────────────── */}
      <View style={styles.appHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerWell} numberOfLines={1}>{well}</Text>
          {loc ? <Text style={styles.headerLoc}>{loc}</Text> : null}
        </View>

        {/* Core selector */}
        <ScrollView horizontal style={styles.coreStrip} showsHorizontalScrollIndicator={false}>
          {cores.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.coreChip, c.id === state.activeCoreId && styles.coreChipActive]}
              onPress={() => setActiveCore(c.id)}
            >
              <Text style={[styles.coreChipText, c.id === state.activeCoreId && styles.coreChipTextActive]}>
                Core {c.coreNumber}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('StripLog')}>
            <Text style={styles.headerBtnText}>Strip Log</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.headerBtnText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Split view ───────────────────────────────────────────────── */}
      <View style={styles.body}>
        {/* Left panel — data entry (60%) */}
        <View style={[styles.leftPanel, { width: leftW }]}>

          {/* Interval depth controls */}
          <View style={styles.depthBar}>
            <View style={styles.depthGroup}>
              <Text style={styles.depthBarLabel}>Top ({depthUnits === 'metres' ? 'm' : 'ft'})</Text>
              <TextInput
                style={styles.depthField}
                value={topDepth}
                onChangeText={setTopDepth}
                onBlur={commitDepths}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                selectTextOnFocus
              />
            </View>
            <Text style={styles.depthDash}>–</Text>
            <View style={styles.depthGroup}>
              <Text style={styles.depthBarLabel}>Base ({depthUnits === 'metres' ? 'm' : 'ft'})</Text>
              <TextInput
                style={styles.depthField}
                value={baseDepth}
                onChangeText={setBaseDepth}
                onBlur={commitDepths}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                selectTextOnFocus
              />
            </View>

            {cursorDepth != null && (
              <View style={styles.cursorDisplay}>
                <Text style={styles.cursorLabel}>Cursor</Text>
                <Text style={styles.cursorValue}>{cursorDepth.toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.depthSpacer} />

            {/* New / Delete interval buttons */}
            <TouchableOpacity style={styles.newIntervalBtn} onPress={handleNewInterval}>
              <Text style={styles.newIntervalBtnText}>+ New Interval</Text>
            </TouchableOpacity>
            {activeInterval && (
              <TouchableOpacity style={styles.deleteIntervalBtn} onPress={handleDeleteInterval}>
                <Text style={styles.deleteIntervalBtnText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tab strip */}
          <View style={styles.tabStrip}>
            {TABS.map((tab, i) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, i === activeTab && styles.tabActive]}
                onPress={() => setActiveTab(i)}
              >
                <Text style={[styles.tabText, i === activeTab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* No interval placeholder */}
          {!activeInterval && activeTab !== 0 && (
            <View style={styles.noIntervalBanner}>
              <Text style={styles.noIntervalBannerText}>
                Create or select an interval to log attributes
              </Text>
            </View>
          )}

          {/* Tab content */}
          <View style={styles.tabContent}>
            {activeTab === 0 && (
              <LithologyTab
                interval={activeInterval}
                onUpdate={handleIntervalFieldUpdate}
                customLithologies={customLithologies}
              />
            )}
            {activeTab === 1 && (
              <StructuresTab
                interval={activeInterval}
                cursorDepth={cursorDepth}
                onUpdate={handleIntervalFieldUpdate}
              />
            )}
            {activeTab === 2 && (
              <AttributesTab
                interval={activeInterval}
                onUpdate={handleIntervalFieldUpdate}
              />
            )}
            {activeTab === 3 && (
              <InterpretationTab
                interval={activeInterval}
                onUpdate={handleIntervalFieldUpdate}
              />
            )}
          </View>

          {/* Interval list strip */}
          {intervals.length > 0 && (
            <View style={styles.intervalListBar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[...intervals]
                  .sort((a, b) => parseFloat(a.topDepth) - parseFloat(b.topDepth))
                  .map((iv) => {
                    const isActive = iv.id === state.activeIntervalId;
                    return (
                      <TouchableOpacity
                        key={iv.id}
                        style={[styles.intervalChip, isActive && styles.intervalChipActive]}
                        onPress={() => {
                          setActiveInterval(iv.id);
                          setTopDepth(String(iv.topDepth || ''));
                          setBaseDepth(String(iv.baseDepth || ''));
                        }}
                      >
                        <Text style={[styles.intervalChipText, isActive && styles.intervalChipTextActive]}>
                          {iv.topDepth || '?'} – {iv.baseDepth || '?'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Right panel — core column (40%) */}
        <View style={[styles.rightPanel, { width: rightW }]}>
          <View style={styles.columnHeader}>
            <Text style={styles.columnHeaderText}>
              {activeCore ? `Core ${activeCore.coreNumber}` : 'Select Core'}
            </Text>
            <Text style={styles.columnHeaderSub}>
              {intervals.length} interval{intervals.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <ScrollView style={styles.columnScroll} contentContainerStyle={{ minHeight: columnHeight }}>
            <CoreColumn
              intervals={intervals}
              structures={structures}
              activeIntervalId={state.activeIntervalId}
              depthMin={depthMin}
              depthMax={depthMax}
              height={Math.max(columnHeight, 500)}
              onDepthTap={(d) => {
                setCursorDepth(d);
                // Try to select the interval at this depth
                const hit = intervals.find((i) => {
                  const t = parseFloat(i.topDepth);
                  const b = parseFloat(i.baseDepth);
                  return d >= t && d <= b;
                });
                if (hit) {
                  setActiveInterval(hit.id);
                  setTopDepth(String(hit.topDepth));
                  setBaseDepth(String(hit.baseDepth));
                }
              }}
              customLithologies={customLithologies}
            />
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },

  // Header
  appHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy,
    paddingHorizontal: 12,
    gap: 10,
  },
  backBtn: { paddingHorizontal: 10, paddingVertical: 8 },
  backBtnText: { color: '#fff', fontSize: 18, fontWeight: '500' },
  headerCenter: { flex: 0, alignItems: 'flex-start', minWidth: 160 },
  headerWell: { color: '#fff', fontWeight: '700', fontSize: 14, maxWidth: 220 },
  headerLoc: { color: '#a0b8d0', fontSize: 11 },
  coreStrip: { flex: 1, maxHeight: 40 },
  coreChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    backgroundColor: colors.navyLight,
    height: 34,
    justifyContent: 'center',
  },
  coreChipActive: { backgroundColor: colors.accent },
  coreChipText: { color: '#a0b8d0', fontWeight: '600', fontSize: 13 },
  coreChipTextActive: { color: '#fff' },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.navyLight,
    height: 34,
    justifyContent: 'center',
  },
  headerBtnText: { color: '#a0b8d0', fontSize: 13, fontWeight: '600' },

  // Body
  body: { flex: 1, flexDirection: 'row', backgroundColor: colors.bg },

  // Left panel
  leftPanel: { flex: 1, backgroundColor: colors.bgCard, borderRightWidth: 1, borderRightColor: colors.border },

  depthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.bgPanel,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
    flexWrap: 'wrap',
  },
  depthGroup: { alignItems: 'center' },
  depthBarLabel: { ...typography.caption, color: colors.textMuted, marginBottom: 3 },
  depthField: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    backgroundColor: colors.bgCard,
    width: 110,
    textAlign: 'center',
    minHeight: 42,
  },
  depthDash: { ...typography.h3, color: colors.textMuted, marginTop: 14 },
  cursorDisplay: { alignItems: 'center', marginLeft: 8 },
  cursorLabel: { ...typography.caption, color: colors.textMuted },
  cursorValue: { ...typography.h4, color: colors.accent },
  depthSpacer: { flex: 1 },
  newIntervalBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 42,
    justifyContent: 'center',
  },
  newIntervalBtnText: { ...typography.label, color: '#fff', fontWeight: '700' },
  deleteIntervalBtn: {
    borderWidth: 1.5,
    borderColor: colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 42,
    justifyContent: 'center',
  },
  deleteIntervalBtnText: { ...typography.label, color: colors.danger, fontWeight: '600' },

  // Tabs
  tabStrip: {
    flexDirection: 'row',
    backgroundColor: colors.bgPanel,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.accent, backgroundColor: colors.bgCard },
  tabText: { fontSize: 11, fontWeight: '600', color: colors.textMuted, letterSpacing: 0.5 },
  tabTextActive: { color: colors.accent },

  noIntervalBanner: {
    backgroundColor: '#fef9c3',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  noIntervalBannerText: { ...typography.caption, color: '#92400e', textAlign: 'center' },

  tabContent: { flex: 1 },

  // Interval list strip at bottom
  intervalListBar: {
    height: 46,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgPanel,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  intervalChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 6,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    minHeight: 32,
  },
  intervalChipActive: { backgroundColor: colors.accentLight, borderColor: colors.accent },
  intervalChipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  intervalChipTextActive: { color: colors.accentDark, fontWeight: '700' },

  // Right panel — core column
  rightPanel: { backgroundColor: colors.columnBg },
  columnHeader: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.navy,
    paddingHorizontal: 12,
  },
  columnHeaderText: { ...typography.h4, color: '#fff' },
  columnHeaderSub: { ...typography.caption, color: '#a0b8d0' },
  columnScroll: { flex: 1 },
});
