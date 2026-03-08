import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, Switch, ActivityIndicator,
} from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { colors, shadows } from '../theme/colors';
import { typography } from '../theme/typography';
import { useProject } from '../context/ProjectContext';
import { COLUMN_DEFS, SCALE_OPTIONS } from '../utils/computeStripLayout';
import { generateStripLogHTML } from '../utils/generateStripLogSVG';
import StripLogCanvas from '../components/StripLogCanvas';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { exportIntervalsCsv, csvFilename } from '../utils/exportIntervalsCsv';
import { parsePorosityCsv } from '../utils/parsePorosityCsv';

export default function StripLogScreen({ navigation }) {
  const { activeProject, activeCore, state, setCoreMeasuredPorosity } = useProject();
  const customLithologies = state.customLithologies || [];

  const [columns, setColumns] = useState(COLUMN_DEFS.map(c => ({ ...c })));
  const [scaleIdx, setScaleIdx] = useState(1); // default 1:100
  const [exporting, setExporting] = useState(false);

  const scale = SCALE_OPTIONS[scaleIdx];
  const intervals = activeCore?.intervals || [];
  const enabledCount = columns.filter(c => c.enabled).length;

  function toggleColumn(id) {
    setColumns(prev => prev.map(c => c.id === id && !c.locked ? { ...c, enabled: !c.enabled } : c));
  }

  const handleDragEnd = useCallback(({ data }) => {
    // Keep locked columns (depth) fixed at position 0
    const locked = data.filter(c => c.locked);
    const unlocked = data.filter(c => !c.locked);
    setColumns([...locked, ...unlocked]);
  }, []);

  async function handleExport() {
    if (!activeProject || !activeCore) {
      Alert.alert('No data', 'Select a project and core run first.');
      return;
    }
    if (intervals.length === 0) {
      Alert.alert('No intervals', 'Log some intervals before exporting.');
      return;
    }
    setExporting(true);
    try {
      const html = generateStripLogHTML(activeProject, activeCore, columns, {
        scalePixPerM: scale.pxPerM,
        customLithologies,
      });
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share CoreLog Strip Log',
        UTI: 'com.adobe.pdf',
      });
    } catch (e) {
      Alert.alert('Export failed', e.message || String(e));
    } finally {
      setExporting(false);
    }
  }

  async function handleExportCsv() {
    if (!activeProject || !activeCore) {
      Alert.alert('No data', 'Select a project and core run first.');
      return;
    }
    if (intervals.length === 0) {
      Alert.alert('No intervals', 'Log some intervals before exporting.');
      return;
    }
    setExporting(true);
    try {
      const csv = exportIntervalsCsv(activeCore, customLithologies);
      const filename = csvFilename(activeProject, activeCore);
      const uri = FileSystem.cacheDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Share CoreLog CSV',
        UTI: 'public.comma-separated-values-text',
      });
    } catch (e) {
      Alert.alert('CSV export failed', e.message || String(e));
    } finally {
      setExporting(false);
    }
  }

  async function handleImportPorosity() {
    if (!activeCore) {
      Alert.alert('No core', 'Select a core run first.');
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/plain', 'public.comma-separated-values-text', '*/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      const text = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const points = parsePorosityCsv(text);
      await setCoreMeasuredPorosity(activeCore.id, points);

      // Auto-enable the porosity_measured column
      setColumns(prev => prev.map(c =>
        c.id === 'porosity_measured' ? { ...c, enabled: true } : c
      ));

      Alert.alert(
        'Imported',
        `${points.length} depth/porosity points loaded.\nDepth range: ${points[0].depth.toFixed(1)} – ${points[points.length-1].depth.toFixed(1)}`,
      );
    } catch (e) {
      Alert.alert('Import failed', e.message || String(e));
    }
  }

  async function handlePrint() {
    if (!activeProject || !activeCore) {
      Alert.alert('No data', 'Select a project and core run first.');
      return;
    }
    if (intervals.length === 0) {
      Alert.alert('No intervals', 'Log some intervals before printing.');
      return;
    }
    setExporting(true);
    try {
      const html = generateStripLogHTML(activeProject, activeCore, columns, {
        scalePixPerM: scale.pxPerM,
        customLithologies,
      });
      await Print.printAsync({ html });
    } catch (e) {
      Alert.alert('Print failed', e.message || String(e));
    } finally {
      setExporting(false);
    }
  }

  const renderColItem = useCallback(({ item: col, drag, isActive }) => (
    <ScaleDecorator activeScale={1.03}>
      <TouchableOpacity
        style={[styles.colRow, isActive && styles.colRowDragging]}
        onPress={() => toggleColumn(col.id)}
        onLongPress={col.locked ? undefined : drag}
        activeOpacity={col.locked ? 1 : 0.7}
        delayLongPress={150}
      >
        {/* Drag handle — hidden for locked columns */}
        {col.locked ? (
          <View style={styles.dragHandlePlaceholder} />
        ) : (
          <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
            <View style={styles.dragDot} />
            <View style={styles.dragDot} />
            <View style={styles.dragDot} />
            <View style={styles.dragDot} />
            <View style={styles.dragDot} />
            <View style={styles.dragDot} />
          </TouchableOpacity>
        )}

        <Switch
          value={col.enabled}
          onValueChange={() => toggleColumn(col.id)}
          disabled={col.locked}
          trackColor={{ true: colors.accent }}
          thumbColor={col.enabled ? colors.accentDark : '#ccc'}
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        />
        <Text style={[styles.colLabel, !col.enabled && styles.colLabelOff]}>
          {col.label}
        </Text>
        {col.locked && <Text style={styles.lockedBadge}>FIXED</Text>}
      </TouchableOpacity>
    </ScaleDecorator>
  ), [columns]);

  return (
    <View style={styles.container}>
      <View style={styles.layout}>
        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <View style={[styles.sidebar, shadows.card]}>
          {/* Scale selector */}
          <Text style={styles.sidebarTitle}>Scale</Text>
          <View style={styles.scaleRow}>
            {SCALE_OPTIONS.map((opt, idx) => (
              <TouchableOpacity
                key={opt.label}
                style={[styles.scaleBtn, idx === scaleIdx && styles.scaleBtnActive]}
                onPress={() => setScaleIdx(idx)}
              >
                <Text style={[styles.scaleBtnText, idx === scaleIdx && styles.scaleBtnTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Column toggles + drag-to-reorder */}
          <Text style={styles.sidebarTitle}>Columns</Text>
          <Text style={styles.sidebarHint}>{enabledCount} active · toggle or drag to reorder</Text>

          <View style={styles.colListContainer}>
            <DraggableFlatList
              data={columns}
              keyExtractor={col => col.id}
              renderItem={renderColItem}
              onDragEnd={handleDragEnd}
              activationDistance={5}
              containerStyle={{ flex: 1 }}
            />
          </View>

          {/* Porosity import */}
          <View style={styles.divider} />
          <Text style={styles.sidebarTitle}>Measured Porosity</Text>
          {activeCore?.measuredPorosity?.length > 0 ? (
            <Text style={styles.sidebarHint}>
              {activeCore.measuredPorosity.length} pts loaded
            </Text>
          ) : (
            <Text style={styles.sidebarHint}>No data — import CSV/TXT</Text>
          )}
          <TouchableOpacity
            style={[styles.exportBtn, styles.importBtn]}
            onPress={handleImportPorosity}
          >
            <Text style={styles.exportBtnText}>Import Porosity</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.exportBtns}>
            <TouchableOpacity
              style={[styles.exportBtn, styles.printBtn]}
              onPress={handlePrint}
              disabled={exporting}
            >
              {exporting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.exportBtnText}>Print</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.exportBtnText}>Export PDF</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.exportBtn, styles.csvBtn]}
              onPress={handleExportCsv}
              disabled={exporting}
            >
              {exporting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.exportBtnText}>Export CSV</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Preview panel ─────────────────────────────────────────── */}
        <View style={styles.preview}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Strip Log Preview</Text>
            <Text style={styles.previewSub}>
              {intervals.length} interval{intervals.length !== 1 ? 's' : ''}
              {'  ·  Scale '}
              {scale.label}
              {'  ·  '}
              {enabledCount} column{enabledCount !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.previewHint}>Pinch/scroll to navigate</Text>
          </View>

          {!activeProject || !activeCore ? (
            <View style={styles.noData}>
              <Text style={styles.noDataText}>No project / core selected</Text>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backBtnText}>← Go back</Text>
              </TouchableOpacity>
            </View>
          ) : intervals.length === 0 ? (
            <View style={styles.noData}>
              <Text style={styles.noDataText}>No intervals logged yet.</Text>
              <Text style={styles.noDataSub}>Log some intervals on the main screen first.</Text>
            </View>
          ) : (
            <View style={styles.canvasContainer}>
              <StripLogCanvas
                project={activeProject}
                core={activeCore}
                columns={columns}
                scalePixPerM={scale.pxPerM}
                customLithologies={customLithologies}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  layout: { flex: 1, flexDirection: 'row', padding: 16, gap: 16 },

  sidebar: {
    width: 240,
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    padding: 16,
    flexShrink: 0,
  },
  sidebarTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 8 },
  sidebarHint: { ...typography.caption, color: colors.textMuted, marginBottom: 8 },

  scaleRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  scaleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgPanel,
    alignItems: 'center',
  },
  scaleBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  scaleBtnText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  scaleBtnTextActive: { color: '#fff' },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },

  colListContainer: { flex: 1 },

  colRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgPanel,
    gap: 6,
    backgroundColor: colors.bgCard,
  },
  colRowDragging: {
    backgroundColor: colors.bgPanel,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  dragHandle: {
    width: 16,
    height: 24,
    flexWrap: 'wrap',
    alignContent: 'space-between',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 2,
  },
  dragDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
  },
  dragHandlePlaceholder: { width: 16 },

  colLabel: { ...typography.body, color: colors.textPrimary, flex: 1, fontSize: 13 },
  colLabelOff: { color: colors.textMuted },
  lockedBadge: {
    fontSize: 8,
    color: colors.textMuted,
    backgroundColor: colors.bgPanel,
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },

  exportBtns: { gap: 8, marginTop: 12 },
  exportBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  printBtn: { backgroundColor: colors.navyLight },
  csvBtn: { backgroundColor: '#2d7a4f' },
  importBtn: { backgroundColor: '#7c3aed', marginBottom: 0 },
  exportBtnText: { ...typography.h4, color: '#fff' },

  preview: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 16,
    flexWrap: 'wrap',
  },
  previewTitle: { ...typography.h3, color: colors.textPrimary },
  previewSub: { ...typography.body, color: colors.textSecondary, flex: 1 },
  previewHint: { ...typography.caption, color: colors.textMuted },

  noData: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  noDataText: { ...typography.h3, color: colors.textMuted },
  noDataSub: { ...typography.body, color: colors.textMuted },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.accent,
    borderRadius: 10,
  },
  backBtnText: { ...typography.h4, color: '#fff' },

  canvasContainer: { flex: 1, backgroundColor: '#fff' },
});
