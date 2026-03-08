import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, FlatList, Alert,
} from 'react-native';
import { colors, shadows } from '../theme/colors';
import { typography } from '../theme/typography';
import { useProject } from '../context/ProjectContext';

function CoreCard({ core, isActive, onPress, onDelete, depthUnits, isIntl }) {
  const boxLabel = isIntl ? 'section' : 'box';
  return (
    <TouchableOpacity
      style={[styles.coreCard, isActive && styles.coreCardActive, shadows.card]}
      onPress={onPress}
      onLongPress={onDelete}
      activeOpacity={0.8}
    >
      <Text style={[styles.coreNumber, isActive && styles.coreNumberActive]}>
        Core {core.coreNumber}
      </Text>
      <Text style={styles.coreMeta}>
        {core.numberOfBoxes} {boxLabel}{core.numberOfBoxes !== 1 ? 's' : ''}
        {'  ·  '}
        {core.orientation === 'uphole' ? '↑ Uphole' : '↓ Downhole'}
      </Text>
    </TouchableOpacity>
  );
}

export default function BoxTallyScreen({ navigation }) {
  const { activeProject, addCore, updateCore, setActiveCore, state } = useProject();
  const isIntl = activeProject?.type === 'international';
  const boxLabel = isIntl ? 'Section' : 'Box';
  const depthUnits = activeProject?.header?.depthUnits || 'metres';

  const [coreNumber, setCoreNumber] = useState('');
  const [numBoxes, setNumBoxes] = useState('');
  const [orientation, setOrientation] = useState('downhole');
  const [editingCoreId, setEditingCoreId] = useState(null);

  const cores = activeProject?.cores || [];

  useEffect(() => {
    // Auto-fill next core number
    if (!editingCoreId) {
      const nums = cores.map((c) => c.coreNumber).filter(Number.isInteger);
      setCoreNumber(String(nums.length > 0 ? Math.max(...nums) + 1 : 1));
    }
  }, [cores.length, editingCoreId]);

  function startEdit(core) {
    setEditingCoreId(core.id);
    setCoreNumber(String(core.coreNumber));
    setNumBoxes(String(core.numberOfBoxes));
    setOrientation(core.orientation);
  }

  function clearForm() {
    setEditingCoreId(null);
    setCoreNumber('');
    setNumBoxes('');
    setOrientation('downhole');
  }

  async function handleSave() {
    const num = parseInt(numBoxes, 10);
    const coreNum = parseInt(coreNumber, 10);
    if (isNaN(coreNum) || coreNum < 1) {
      Alert.alert('Invalid', 'Enter a valid core number.');
      return;
    }
    if (isNaN(num) || num < 1) {
      Alert.alert('Invalid', `Enter how many ${boxLabel.toLowerCase()}es this core has.`);
      return;
    }

    if (editingCoreId) {
      const core = cores.find((c) => c.id === editingCoreId);
      if (!core) return;

      // Rebuild boxes array to match new count
      const existingBoxes = core.boxes || [];
      const boxes = Array.from({ length: num }, (_, i) => {
        return existingBoxes[i] || {
          id: `${editingCoreId}_box_${i + 1}`,
          boxNumber: i + 1,
          topDepth: '',
          bottomDepth: '',
        };
      });

      await updateCore({ ...core, coreNumber: coreNum, numberOfBoxes: num, orientation, boxes });
      setActiveCore(editingCoreId);
    } else {
      const core = await addCore(coreNum);
      const boxes = Array.from({ length: num }, (_, i) => ({
        id: `${core.id}_box_${i + 1}`,
        boxNumber: i + 1,
        topDepth: '',
        bottomDepth: '',
      }));
      await updateCore({ ...core, numberOfBoxes: num, orientation, boxes });
    }
    clearForm();
  }

  function selectCore(coreId) {
    setActiveCore(coreId);
    startEdit(cores.find((c) => c.id === coreId));
  }

  return (
    <View style={styles.container}>
      <View style={styles.layout}>
        {/* Left: core list */}
        <View style={styles.listPanel}>
          <Text style={styles.panelTitle}>Core Runs</Text>
          {cores.length === 0 ? (
            <View style={styles.emptyList}>
              <Text style={styles.emptyText}>No cores yet</Text>
            </View>
          ) : (
            <FlatList
              data={[...cores].sort((a, b) => a.coreNumber - b.coreNumber)}
              keyExtractor={(c) => c.id}
              renderItem={({ item }) => (
                <CoreCard
                  core={item}
                  isActive={item.id === state.activeCoreId}
                  onPress={() => selectCore(item.id)}
                  onDelete={() =>
                    Alert.alert('Delete Core', `Remove Core ${item.coreNumber}?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: clearForm },
                    ])
                  }
                  depthUnits={depthUnits}
                  isIntl={isIntl}
                />
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>

        {/* Right: form */}
        <View style={[styles.formPanel, shadows.card]}>
          <Text style={styles.panelTitle}>
            {editingCoreId ? `Edit Core ${coreNumber}` : 'Add Core Run'}
          </Text>

          <Text style={styles.label}>Core Number</Text>
          <TextInput
            style={styles.input}
            value={coreNumber}
            onChangeText={setCoreNumber}
            keyboardType="numeric"
            placeholder="e.g. 1"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Number of {boxLabel}es</Text>
          <TextInput
            style={styles.input}
            value={numBoxes}
            onChangeText={setNumBoxes}
            keyboardType="numeric"
            placeholder="e.g. 8"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Core Orientation</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, orientation === 'downhole' && styles.toggleActive]}
              onPress={() => setOrientation('downhole')}
            >
              <Text style={[styles.toggleText, orientation === 'downhole' && styles.toggleTextActive]}>
                ↓ Downhole
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, orientation === 'uphole' && styles.toggleActive]}
              onPress={() => setOrientation('uphole')}
            >
              <Text style={[styles.toggleText, orientation === 'uphole' && styles.toggleTextActive]}>
                ↑ Uphole
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.btnRow}>
            {editingCoreId && (
              <TouchableOpacity style={styles.cancelBtn} onPress={clearForm}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>
                {editingCoreId ? 'Update Core' : '+ Add Core'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => navigation.navigate('BoxDepths')}
          >
            <Text style={styles.nextBtnText}>Assign {boxLabel} Depths →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextBtn, styles.logBtn]}
            onPress={() => navigation.navigate('MainLogging')}
          >
            <Text style={styles.nextBtnText}>Open Core Log →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  layout: { flex: 1, flexDirection: 'row', padding: 24, gap: 24 },

  listPanel: { flex: 1 },
  formPanel: {
    width: 380,
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    padding: 24,
    alignSelf: 'flex-start',
  },

  panelTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: 18 },

  emptyList: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { ...typography.body, color: colors.textMuted },

  coreCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  coreCardActive: { borderColor: colors.accent },
  coreNumber: { ...typography.h4, color: colors.textPrimary },
  coreNumberActive: { color: colors.accent },
  coreMeta: { ...typography.body, color: colors.textSecondary, marginTop: 4 },

  label: { ...typography.label, color: colors.textSecondary, marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 17,
    color: colors.textPrimary,
    backgroundColor: colors.bgCard,
  },

  toggleRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.bgPanel,
  },
  toggleActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  toggleText: { ...typography.body, color: colors.textSecondary, fontWeight: '600' },
  toggleTextActive: { color: colors.textOnDark },

  btnRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: { ...typography.body, color: colors.textSecondary, fontWeight: '600' },
  saveBtn: {
    flex: 2,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: { ...typography.h4, color: colors.textOnDark },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: 20 },

  nextBtn: {
    backgroundColor: colors.navyLight,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  logBtn: { backgroundColor: colors.success },
  nextBtnText: { ...typography.h4, color: colors.textOnDark },
});
