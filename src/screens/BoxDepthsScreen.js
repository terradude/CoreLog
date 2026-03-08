import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  FlatList, StyleSheet, Alert,
} from 'react-native';
import { colors, shadows } from '../theme/colors';
import { typography } from '../theme/typography';
import { useProject } from '../context/ProjectContext';

function BoxRow({ box, depthUnits, boxLabel, onChangeTop, onChangeBottom, isOdd }) {
  return (
    <View style={[styles.boxRow, isOdd && styles.boxRowAlt]}>
      <View style={styles.boxNumCell}>
        <Text style={styles.boxNum}>{boxLabel} {box.boxNumber}</Text>
      </View>
      <View style={styles.depthCell}>
        <Text style={styles.depthLabel}>Top ({depthUnits === 'metres' ? 'm' : 'ft'})</Text>
        <TextInput
          style={styles.depthInput}
          value={String(box.topDepth || '')}
          onChangeText={onChangeTop}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          selectTextOnFocus
        />
      </View>
      <View style={styles.depthCell}>
        <Text style={styles.depthLabel}>Bottom ({depthUnits === 'metres' ? 'm' : 'ft'})</Text>
        <TextInput
          style={styles.depthInput}
          value={String(box.bottomDepth || '')}
          onChangeText={onChangeBottom}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          selectTextOnFocus
        />
      </View>
      <View style={styles.intervalCell}>
        {box.topDepth && box.bottomDepth ? (
          <Text style={styles.intervalText}>
            {Math.abs(parseFloat(box.bottomDepth) - parseFloat(box.topDepth)).toFixed(2)}{' '}
            {depthUnits === 'metres' ? 'm' : 'ft'}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function BoxDepthsScreen({ navigation }) {
  const { activeProject, updateBoxes, setActiveCore, state } = useProject();
  const isIntl = activeProject?.type === 'international';
  const boxLabel = isIntl ? 'Section' : 'Box';
  const depthUnits = activeProject?.header?.depthUnits || 'metres';

  const cores = activeProject?.cores || [];
  const activeCoreId = state.activeCoreId;

  const [selectedCoreId, setSelectedCoreId] = useState(activeCoreId || cores[0]?.id || null);
  const [boxes, setBoxes] = useState([]);

  const selectedCore = cores.find((c) => c.id === selectedCoreId) || null;

  useEffect(() => {
    if (selectedCore) {
      setBoxes(selectedCore.boxes ? [...selectedCore.boxes] : []);
    } else {
      setBoxes([]);
    }
  }, [selectedCoreId, selectedCore]);

  function updateBox(index, field, value) {
    const updated = boxes.map((b, i) => (i === index ? { ...b, [field]: value } : b));
    setBoxes(updated);
  }

  async function autoFill() {
    if (!boxes.length) return;
    const topDepth = parseFloat(boxes[0].topDepth || 0);
    if (isNaN(topDepth)) {
      Alert.alert('Auto-fill', 'Enter the top depth of the first box, then tap Auto-fill.');
      return;
    }
    const interval = parseFloat(depthUnits === 'metres' ? '1.5' : '5');
    const filled = boxes.map((b, i) => ({
      ...b,
      topDepth: String((topDepth + i * interval).toFixed(2)),
      bottomDepth: String((topDepth + (i + 1) * interval).toFixed(2)),
    }));
    setBoxes(filled);
  }

  async function save() {
    if (!selectedCoreId) return;
    await updateBoxes(selectedCoreId, boxes);
    Alert.alert('Saved', `${boxLabel} depths saved for Core ${selectedCore?.coreNumber}.`, [
      { text: 'OK' },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.layout}>
        {/* Core selector sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>Core Runs</Text>
          {cores.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No cores yet.{'\n'}Add cores in Box Tally.</Text>
              <TouchableOpacity style={styles.goBtn} onPress={() => navigation.navigate('BoxTally')}>
                <Text style={styles.goBtnText}>Go to {boxLabel} Tally</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={[...cores].sort((a, b) => a.coreNumber - b.coreNumber)}
              keyExtractor={(c) => c.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.coreBtn, item.id === selectedCoreId && styles.coreBtnActive]}
                  onPress={() => {
                    setSelectedCoreId(item.id);
                    setActiveCore(item.id);
                  }}
                >
                  <Text style={[styles.coreBtnText, item.id === selectedCoreId && styles.coreBtnTextActive]}>
                    Core {item.coreNumber}
                  </Text>
                  <Text style={styles.coreBtnSub}>
                    {item.numberOfBoxes} {boxLabel.toLowerCase()}{item.numberOfBoxes !== 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Box depth table */}
        <View style={styles.tablePanel}>
          {!selectedCore ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Select a core run on the left</Text>
            </View>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={styles.tableTitle}>
                  Core {selectedCore.coreNumber} — {boxLabel} Depths
                </Text>
                <View style={styles.headerActions}>
                  <TouchableOpacity style={styles.autoBtn} onPress={autoFill}>
                    <Text style={styles.autoBtnText}>Auto-fill</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={save}>
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.nextBtn}
                    onPress={async () => { await save(); navigation.navigate('MainLogging'); }}
                  >
                    <Text style={styles.saveBtnText}>Open Log →</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Column headers */}
              <View style={[styles.boxRow, styles.colHeaderRow]}>
                <View style={styles.boxNumCell}><Text style={styles.colHeader}>{boxLabel}</Text></View>
                <View style={styles.depthCell}><Text style={styles.colHeader}>Top</Text></View>
                <View style={styles.depthCell}><Text style={styles.colHeader}>Bottom</Text></View>
                <View style={styles.intervalCell}><Text style={styles.colHeader}>Interval</Text></View>
              </View>

              <ScrollView style={styles.scroll}>
                {boxes.map((box, idx) => (
                  <BoxRow
                    key={box.id || idx}
                    box={box}
                    depthUnits={depthUnits}
                    boxLabel={boxLabel}
                    isOdd={idx % 2 === 1}
                    onChangeTop={(v) => updateBox(idx, 'topDepth', v)}
                    onChangeBottom={(v) => updateBox(idx, 'bottomDepth', v)}
                  />
                ))}
                <View style={{ height: 40 }} />
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  layout: { flex: 1, flexDirection: 'row', padding: 24, gap: 24 },

  sidebar: { width: 200 },
  sidebarTitle: { ...typography.h4, color: colors.textSecondary, marginBottom: 16,
    textTransform: 'uppercase', letterSpacing: 0.8 },

  tablePanel: { flex: 1, backgroundColor: colors.bgCard, borderRadius: 14, overflow: 'hidden', ...shadows.card },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: 20 },

  goBtn: { backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  goBtnText: { ...typography.h4, color: colors.textOnDark },

  coreBtn: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.panel,
  },
  coreBtnActive: { borderColor: colors.accent, backgroundColor: colors.accentLight },
  coreBtnText: { ...typography.h4, color: colors.textPrimary },
  coreBtnTextActive: { color: colors.accentDark },
  coreBtnSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgCard,
    gap: 12,
  },
  tableTitle: { ...typography.h3, color: colors.textPrimary, flex: 1 },
  headerActions: { flexDirection: 'row', gap: 10 },
  autoBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.bgPanel,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  autoBtnText: { ...typography.label, color: colors.textSecondary, fontWeight: '600' },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.success },
  nextBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.accent },
  saveBtnText: { ...typography.label, color: colors.textOnDark, fontWeight: '700' },

  colHeaderRow: { backgroundColor: colors.bgPanel },
  colHeader: { ...typography.label, color: colors.textSecondary },
  scroll: { flex: 1 },

  boxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgPanel,
    minHeight: 60,
  },
  boxRowAlt: { backgroundColor: '#f9fafb' },
  boxNumCell: { width: 100 },
  boxNum: { ...typography.h4, color: colors.textPrimary },
  depthCell: { flex: 1, paddingRight: 16 },
  depthLabel: { ...typography.caption, color: colors.textMuted, marginBottom: 3 },
  depthInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 17,
    color: colors.textPrimary,
    backgroundColor: colors.bgCard,
  },
  intervalCell: { width: 100, alignItems: 'flex-end' },
  intervalText: { ...typography.body, color: colors.accent, fontWeight: '600' },
});
