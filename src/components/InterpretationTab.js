import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, FlatList,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import {
  HC_STAINS, STAIN_COLOURS, SHOWS, FLUORESCENCE, FLUORESCENCE_COLOURS,
} from '../data/attributes';
import { loadRecentEnvironments, addRecentEnvironment, loadRecentComplexes, addRecentComplex } from '../utils/storage';

function ButtonStrip({ label, options, value, onSelect, small }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.strip}>
          {options.map((opt) => {
            const active = value === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.stripBtn, active && styles.stripBtnActive, small && styles.stripBtnSmall]}
                onPress={() => onSelect(opt.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.stripBtnText, active && styles.stripBtnTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function AutocompleteField({ label, value, onChangeText, recentItems, onSelectRecent }) {
  const [focused, setFocused] = useState(false);
  const filtered = focused && value
    ? recentItems.filter((r) => r.toLowerCase().includes(value.toLowerCase()) && r !== value)
    : [];

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder={`Enter ${label.toLowerCase()}...`}
        placeholderTextColor={colors.textMuted}
      />
      {filtered.length > 0 && (
        <View style={styles.dropdown}>
          {filtered.slice(0, 5).map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.dropdownItem}
              onPress={() => { onSelectRecent(item); setFocused(false); }}
            >
              <Text style={styles.dropdownItemText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function InterpretationTab({ interval, onUpdate }) {
  const [recentEnvs, setRecentEnvs] = useState([]);
  const [recentCx, setRecentCx] = useState([]);

  useEffect(() => {
    loadRecentEnvironments().then(setRecentEnvs);
    loadRecentComplexes().then(setRecentCx);
  }, []);

  if (!interval) return (
    <View style={styles.noInterval}>
      <Text style={styles.noIntervalText}>No interval selected</Text>
    </View>
  );

  async function saveEnv(v) {
    onUpdate({ depositionalEnvironment: v });
    if (v) {
      await addRecentEnvironment(v);
      setRecentEnvs(await loadRecentEnvironments());
    }
  }

  async function saveCx(v) {
    onUpdate({ depositionalComplex: v });
    if (v) {
      await addRecentComplex(v);
      setRecentCx(await loadRecentComplexes());
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ButtonStrip
        label="HC Stain"
        options={HC_STAINS}
        value={interval.hcStain}
        onSelect={(v) => onUpdate({ hcStain: v })}
      />
      <ButtonStrip
        label="Stain Colour"
        options={STAIN_COLOURS}
        value={interval.stainColour}
        onSelect={(v) => onUpdate({ stainColour: v })}
      />
      <ButtonStrip
        label="Shows"
        options={SHOWS}
        value={interval.shows}
        onSelect={(v) => onUpdate({ shows: v })}
      />

      <View style={styles.twoCol}>
        <View style={{ flex: 1 }}>
          <ButtonStrip
            label="Fluorescence"
            options={FLUORESCENCE}
            value={interval.fluorescence}
            onSelect={(v) => onUpdate({ fluorescence: v })}
          />
        </View>
        <View style={{ flex: 1 }}>
          <ButtonStrip
            label="Fluor. Colour"
            options={FLUORESCENCE_COLOURS}
            value={interval.fluorescenceColour}
            onSelect={(v) => onUpdate({ fluorescenceColour: v })}
            small
          />
        </View>
      </View>

      <View style={styles.twoCol}>
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Lithofacies Code</Text>
          <TextInput
            style={[styles.textInput, styles.codeInput]}
            value={interval.lithofaciesCode || ''}
            onChangeText={(v) => onUpdate({ lithofaciesCode: v })}
            placeholder="e.g. A1"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
          />
        </View>
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Lithofacies Assoc.</Text>
          <TextInput
            style={[styles.textInput, styles.codeInput]}
            value={interval.lithofaciesAssoc || ''}
            onChangeText={(v) => onUpdate({ lithofaciesAssoc: v })}
            placeholder="e.g. FA1"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
          />
        </View>
      </View>

      <AutocompleteField
        label="Depositional Environment"
        value={interval.depositionalEnvironment || ''}
        onChangeText={(v) => onUpdate({ depositionalEnvironment: v })}
        recentItems={recentEnvs}
        onSelectRecent={(v) => { onUpdate({ depositionalEnvironment: v }); }}
      />

      <AutocompleteField
        label="Depositional Complex"
        value={interval.depositionalComplex || ''}
        onChangeText={(v) => onUpdate({ depositionalComplex: v })}
        recentItems={recentCx}
        onSelectRecent={(v) => { onUpdate({ depositionalComplex: v }); }}
      />

      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>Remarks</Text>
        <TextInput
          style={[styles.textInput, styles.remarksInput]}
          value={interval.remarks || ''}
          onChangeText={(v) => onUpdate({ remarks: v })}
          multiline
          numberOfLines={4}
          placeholder="Detailed observations..."
          placeholderTextColor={colors.textMuted}
          textAlignVertical="top"
        />
      </View>

      {/* Hydrocarbon summary badge */}
      {(interval.shows !== 'none' || interval.hcStain !== 'none') && (
        <View style={styles.hcBadge}>
          <Text style={styles.hcBadgeText}>
            HC: {interval.shows !== 'none' ? interval.shows : ''} {interval.hcStain !== 'none' ? `(${interval.hcStain} stain)` : ''}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 10, paddingBottom: 40 },
  noInterval: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noIntervalText: { ...typography.body, color: colors.textMuted },

  fieldBlock: { marginBottom: 12 },
  fieldLabel: { ...typography.label, color: colors.textSecondary, marginBottom: 6 },

  strip: { flexDirection: 'row', gap: 6 },
  stripBtn: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgPanel,
    minWidth: 80,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  stripBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  stripBtnSmall: { paddingHorizontal: 10, paddingVertical: 9, minWidth: 60 },
  stripBtnText: { ...typography.body, color: colors.textSecondary, fontWeight: '500' },
  stripBtnTextActive: { color: '#fff', fontWeight: '700' },

  twoCol: { flexDirection: 'row', gap: 16 },

  textInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.bgCard,
    minHeight: 44,
  },
  codeInput: { width: 140, fontWeight: '700', letterSpacing: 1 },
  remarksInput: { minHeight: 90, textAlignVertical: 'top', paddingTop: 10 },

  dropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.bgPanel },
  dropdownItemText: { ...typography.body, color: colors.textPrimary },

  hcBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#d97706',
    marginTop: 8,
  },
  hcBadgeText: { ...typography.h4, color: '#92400e' },
});
