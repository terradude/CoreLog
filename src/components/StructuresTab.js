import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { STRUCTURES_COMMON, STRUCTURES_ALTERNATE } from '../data/structures';

const CATEGORY_COLORS = {
  physical: '#3b82f6',
  bio: '#16a34a',
  diagenetic: '#d97706',
  structural: '#dc2626',
};

function StructureButton({ structure, onAdd }) {
  const cc = CATEGORY_COLORS[structure.category] || '#666';
  return (
    <TouchableOpacity
      style={[styles.structBtn, { borderColor: cc }]}
      onPress={onAdd}
      activeOpacity={0.7}
    >
      <View style={[styles.structBadge, { backgroundColor: cc }]}>
        <Text style={styles.structAbbrev}>{structure.abbrev}</Text>
      </View>
      <Text style={styles.structName} numberOfLines={2}>{structure.name}</Text>
    </TouchableOpacity>
  );
}

export default function StructuresTab({ interval, cursorDepth, onUpdate }) {
  const [showAlt, setShowAlt] = useState(false);
  const [depthOverride, setDepthOverride] = useState('');

  const structures = interval?.structures || [];
  const palette = showAlt ? STRUCTURES_ALTERNATE : STRUCTURES_COMMON;

  function getDepth() {
    if (depthOverride) return parseFloat(depthOverride);
    return cursorDepth;
  }

  function addStructure(structureId) {
    const depth = getDepth();
    if (isNaN(depth)) return;
    const obs = { structureId, depth };
    onUpdate({ structures: [...structures, obs] });
  }

  function removeStructure(idx) {
    const updated = structures.filter((_, i) => i !== idx);
    onUpdate({ structures: updated });
  }

  return (
    <View style={styles.container}>
      {/* Depth indicator */}
      <View style={styles.depthRow}>
        <Text style={styles.depthLabel}>Placing at depth:</Text>
        <TextInput
          style={styles.depthInput}
          value={depthOverride}
          onChangeText={setDepthOverride}
          placeholder={cursorDepth != null ? String(cursorDepth.toFixed(2)) : '—'}
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
        />
        <Text style={styles.depthUnit}>m</Text>
        {depthOverride ? (
          <TouchableOpacity onPress={() => setDepthOverride('')}>
            <Text style={styles.clearBtn}>✕ Clear</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.spacer} />
        <TouchableOpacity
          style={[styles.altToggle, showAlt && styles.altToggleActive]}
          onPress={() => setShowAlt(!showAlt)}
        >
          <Text style={[styles.altToggleText, showAlt && styles.altToggleTextActive]}>
            {showAlt ? 'Alternate Palette' : 'Common Palette'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <ScrollView style={styles.grid} contentContainerStyle={styles.gridContent}>
        <View style={styles.gridRow}>
          {palette.map((s) => (
            <StructureButton key={s.id} structure={s} onAdd={() => addStructure(s.id)} />
          ))}
        </View>
      </ScrollView>

      {/* Placed structures list */}
      {structures.length > 0 && (
        <View style={styles.loggedSection}>
          <Text style={styles.loggedTitle}>Logged Structures ({structures.length})</Text>
          <ScrollView horizontal style={styles.loggedScroll}>
            {structures.map((obs, idx) => {
              const def = [...STRUCTURES_COMMON, ...STRUCTURES_ALTERNATE].find((s) => s.id === obs.structureId);
              const cc = CATEGORY_COLORS[def?.category] || '#999';
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.loggedChip, { borderColor: cc }]}
                  onPress={() => removeStructure(idx)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.loggedChipAbbrev, { color: cc }]}>{def?.abbrev || '?'}</Text>
                  <Text style={styles.loggedChipDepth}>{obs.depth?.toFixed(2)}</Text>
                  <Text style={styles.loggedChipX}> ✕</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  depthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  depthLabel: { ...typography.label, color: colors.textSecondary },
  depthInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 15,
    color: colors.textPrimary,
    width: 90,
    backgroundColor: colors.bgCard,
  },
  depthUnit: { ...typography.body, color: colors.textSecondary },
  clearBtn: { ...typography.caption, color: colors.danger },
  spacer: { flex: 1 },
  altToggle: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgPanel,
  },
  altToggleActive: { backgroundColor: colors.navyLight, borderColor: colors.navyLight },
  altToggleText: { ...typography.label, color: colors.textSecondary },
  altToggleTextActive: { color: '#fff' },

  grid: { flex: 1 },
  gridContent: { padding: 8 },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  structBtn: {
    width: 88,
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: colors.bgCard,
    minHeight: 72,
    justifyContent: 'center',
  },
  structBadge: {
    width: 36,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  structAbbrev: { ...typography.label, color: '#fff', fontWeight: '700' },
  structName: { ...typography.caption, color: colors.textPrimary, textAlign: 'center' },

  loggedSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 10,
  },
  loggedTitle: { ...typography.label, color: colors.textSecondary, marginBottom: 8 },
  loggedScroll: { flexDirection: 'row' },
  loggedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: colors.bgCard,
  },
  loggedChipAbbrev: { ...typography.label, fontWeight: '700' },
  loggedChipDepth: { ...typography.caption, color: colors.textSecondary, marginLeft: 4 },
  loggedChipX: { ...typography.caption, color: colors.danger },
});
