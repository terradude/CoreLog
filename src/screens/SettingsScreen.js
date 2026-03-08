import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Alert, FlatList,
} from 'react-native';
import { colors, shadows } from '../theme/colors';
import { typography } from '../theme/typography';
import { useProject } from '../context/ProjectContext';
import { generateId } from '../utils/storage';

const PATTERN_OPTIONS = [
  { id: 'stipple', label: 'Stipple (sand)' },
  { id: 'hline', label: 'Horizontal lines (silt/shale)' },
  { id: 'brick', label: 'Brick (limestone)' },
  { id: 'rhombus', label: 'Rhombus (dolostone)' },
  { id: 'cross_hatch', label: 'Cross-hatch (evaporite)' },
  { id: 'solid', label: 'Solid fill' },
  { id: 'diagonal_loss', label: 'Diagonal (lost core)' },
  { id: 'empty', label: 'Empty (no recovery)' },
];

const BG_COLORS = [
  '#f0d8a0', '#c8b8a8', '#b8d4f0', '#c8e0b0', '#e0c0c0', '#d8d0b8',
  '#f0e8d8', '#d0d0d0', '#e8f0d0', '#f8d0d0',
];

export default function SettingsScreen({ navigation }) {
  const { state, updateSettings, setCustomLithologies } = useProject();
  const { settings, customLithologies } = state;

  const [loggedBy, setLoggedBy] = useState(settings.defaultLoggedBy || '');
  const [depthUnits, setDepthUnits] = useState(settings.depthUnits || 'metres');

  // Custom lithology editor state
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAbbrev, setEditAbbrev] = useState('');
  const [editPattern, setEditPattern] = useState('stipple');
  const [editBg, setEditBg] = useState(BG_COLORS[0]);

  async function saveSettings() {
    await updateSettings({ defaultLoggedBy: loggedBy, depthUnits });
    Alert.alert('Saved', 'Settings saved.');
  }

  function startEdit(lith) {
    setEditId(lith.id);
    setEditName(lith.name);
    setEditAbbrev(lith.abbrev || '');
    setEditPattern(lith.pattern?.type || 'stipple');
    setEditBg(lith.fillColor || BG_COLORS[0]);
  }

  function clearEdit() {
    setEditId(null);
    setEditName('');
    setEditAbbrev('');
    setEditPattern('stipple');
    setEditBg(BG_COLORS[0]);
  }

  async function saveLith() {
    if (!editName.trim()) {
      Alert.alert('Error', 'Enter a name for the lithology.');
      return;
    }
    const lith = {
      id: editId || generateId(),
      name: editName.trim(),
      abbrev: editAbbrev.trim() || editName.trim().slice(0, 4).toUpperCase(),
      palette: 'P3',
      fillColor: editBg,
      pattern: { type: editPattern, color: '#666', bgColor: editBg },
    };
    const existing = customLithologies.filter((l) => l.id !== lith.id);
    await setCustomLithologies([...existing, lith]);
    clearEdit();
  }

  async function deleteLith(id) {
    Alert.alert('Delete', 'Remove this custom lithology?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await setCustomLithologies(customLithologies.filter((l) => l.id !== id));
          if (editId === id) clearEdit();
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* General settings */}
      <View style={[styles.section, shadows.card]}>
        <Text style={styles.sectionTitle}>General</Text>

        <Text style={styles.label}>Default Logged By</Text>
        <TextInput
          style={styles.input}
          value={loggedBy}
          onChangeText={setLoggedBy}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Default Depth Units</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, depthUnits === 'metres' && styles.toggleActive]}
            onPress={() => setDepthUnits('metres')}
          >
            <Text style={[styles.toggleText, depthUnits === 'metres' && styles.toggleTextActive]}>Metres</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, depthUnits === 'feet' && styles.toggleActive]}
            onPress={() => setDepthUnits('feet')}
          >
            <Text style={[styles.toggleText, depthUnits === 'feet' && styles.toggleTextActive]}>Feet</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}>
          <Text style={styles.saveBtnText}>Save Settings</Text>
        </TouchableOpacity>
      </View>

      {/* P3 Custom lithology editor */}
      <View style={[styles.section, shadows.card]}>
        <Text style={styles.sectionTitle}>P3 Custom Lithologies</Text>
        <Text style={styles.sectionDesc}>
          These appear in the P3 palette on the main logging screen.
        </Text>

        {customLithologies.length === 0 ? (
          <Text style={styles.emptyText}>No custom lithologies yet.</Text>
        ) : (
          <View style={styles.lithList}>
            {customLithologies.map((lith) => (
              <View key={lith.id} style={styles.lithRow}>
                <View style={[styles.lithSwatch, { backgroundColor: lith.fillColor }]} />
                <Text style={styles.lithRowName}>{lith.name}</Text>
                <Text style={styles.lithRowAbbrev}>{lith.abbrev}</Text>
                <TouchableOpacity onPress={() => startEdit(lith)} style={styles.lithAction}>
                  <Text style={styles.lithActionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteLith(lith.id)} style={[styles.lithAction, styles.deleteAction]}>
                  <Text style={styles.deleteActionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Edit / Add form */}
        <View style={styles.editForm}>
          <Text style={styles.editFormTitle}>{editId ? 'Edit Lithology' : 'Add New Lithology'}</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={editName}
            onChangeText={setEditName}
            placeholder="e.g. Dolomitic Sandstone"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Abbreviation</Text>
          <TextInput
            style={styles.input}
            value={editAbbrev}
            onChangeText={setEditAbbrev}
            placeholder="e.g. DolSS"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Pattern Style</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.patternStrip}>
              {PATTERN_OPTIONS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.patternBtn, editPattern === p.id && styles.patternBtnActive]}
                  onPress={() => setEditPattern(p.id)}
                >
                  <Text style={[styles.patternBtnText, editPattern === p.id && styles.patternBtnTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.label}>Background Colour</Text>
          <View style={styles.bgRow}>
            {BG_COLORS.map((bg) => (
              <TouchableOpacity
                key={bg}
                style={[styles.bgSwatch, { backgroundColor: bg }, editBg === bg && styles.bgSwatchActive]}
                onPress={() => setEditBg(bg)}
              />
            ))}
          </View>

          <View style={styles.btnRow}>
            {editId && (
              <TouchableOpacity style={styles.cancelBtn} onPress={clearEdit}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.addBtn} onPress={saveLith}>
              <Text style={styles.addBtnText}>{editId ? 'Update' : '+ Add Lithology'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* About */}
      <View style={[styles.section, shadows.card]}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>CoreLog v1.0.0</Text>
        <Text style={styles.aboutText}>Offline geological core logging for iPad</Text>
        <Text style={styles.aboutText}>All data stored locally on this device</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 28, paddingBottom: 60 },

  section: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    padding: 22,
    marginBottom: 22,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionDesc: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
  },

  label: { ...typography.label, color: colors.textSecondary, marginBottom: 8, marginTop: 14 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.bgCard,
    minHeight: 48,
  },

  toggleRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  toggleBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgPanel,
  },
  toggleActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  toggleText: { ...typography.body, color: colors.textSecondary, fontWeight: '600' },
  toggleTextActive: { color: '#fff' },

  saveBtn: {
    backgroundColor: colors.success,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: { ...typography.h4, color: '#fff' },

  emptyText: { ...typography.body, color: colors.textMuted, marginBottom: 16 },

  lithList: { marginBottom: 16 },
  lithRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgPanel,
    gap: 10,
  },
  lithSwatch: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: colors.border },
  lithRowName: { ...typography.body, color: colors.textPrimary, flex: 1 },
  lithRowAbbrev: { ...typography.label, color: colors.textSecondary, width: 60 },
  lithAction: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  lithActionText: { ...typography.caption, color: colors.accent, fontWeight: '600' },
  deleteAction: { borderColor: colors.danger },
  deleteActionText: { ...typography.caption, color: colors.danger, fontWeight: '600' },

  editForm: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    marginTop: 8,
  },
  editFormTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 4 },

  patternStrip: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  patternBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgPanel,
  },
  patternBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  patternBtnText: { ...typography.caption, color: colors.textSecondary },
  patternBtnTextActive: { color: '#fff' },

  bgRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 8 },
  bgSwatch: { width: 40, height: 40, borderRadius: 8, borderWidth: 2, borderColor: 'transparent' },
  bgSwatchActive: { borderColor: colors.textPrimary, borderWidth: 3 },

  btnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: { ...typography.body, color: colors.textSecondary, fontWeight: '600' },
  addBtn: {
    flex: 2,
    backgroundColor: colors.accent,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtnText: { ...typography.h4, color: '#fff' },

  aboutText: { ...typography.body, color: colors.textSecondary, marginTop: 6 },
});
