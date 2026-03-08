import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import {
  CONTACT_TYPES, BEDDING_STYLES, GRAIN_SIZES, SORTING,
  COLOURS, POROSITY_TYPES, BIOTURBATION_INDEX, BIOTURBATION_LABELS,
} from '../data/attributes';

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
                <Text style={[styles.stripBtnText, active && styles.stripBtnTextActive, small && styles.stripBtnTextSmall]}>
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

function ColourPicker({ value, onSelect }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>Colour</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.strip}>
          {COLOURS.map((c) => {
            const active = value === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.colourBtn, { backgroundColor: c.hex }, active && styles.colourBtnActive]}
                onPress={() => onSelect(c.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.colourBtnText,
                  { color: ['bk', 'dk_br', 'dk_gy', 'dk_gn'].includes(c.id) ? '#fff' : '#333' }
                ]} numberOfLines={1}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function GrainSizePicker({ value, onSelect }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>Grain Size</Text>
      <View style={styles.grainRow}>
        {GRAIN_SIZES.map((g) => {
          const active = value === g.id;
          const barH = Math.max(16, Math.round(g.width * 52));
          return (
            <TouchableOpacity
              key={g.id}
              style={[styles.grainBtn, active && styles.grainBtnActive]}
              onPress={() => onSelect(g.id)}
              activeOpacity={0.75}
            >
              <View style={{ height: 52, justifyContent: 'flex-end' }}>
                <View style={[styles.grainBar, { height: barH, backgroundColor: active ? colors.accent : '#c09050' }]} />
              </View>
              <Text style={[styles.grainLabel, active && styles.grainLabelActive]} numberOfLines={2}>
                {g.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function BioturbationPicker({ value, onSelect }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>Bioturbation Index (BI)</Text>
      <View style={styles.biRow}>
        {BIOTURBATION_INDEX.map((bi) => {
          const active = value === bi;
          return (
            <TouchableOpacity
              key={bi}
              style={[styles.biBtn, active && styles.biBtnActive]}
              onPress={() => onSelect(bi)}
              activeOpacity={0.75}
            >
              <Text style={[styles.biBtnNum, active && styles.biBtnNumActive]}>{bi}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {value != null && (
        <Text style={styles.biDesc}>{BIOTURBATION_LABELS[value]}</Text>
      )}
    </View>
  );
}

export default function AttributesTab({ interval, onUpdate }) {
  if (!interval) return (
    <View style={styles.noInterval}>
      <Text style={styles.noIntervalText}>No interval selected</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ButtonStrip
        label="Top Contact"
        options={CONTACT_TYPES}
        value={interval.topContact}
        onSelect={(v) => onUpdate({ topContact: v })}
        small
      />
      <ButtonStrip
        label="Base Contact"
        options={CONTACT_TYPES}
        value={interval.baseContact}
        onSelect={(v) => onUpdate({ baseContact: v })}
        small
      />
      <ButtonStrip
        label="Bedding Style"
        options={BEDDING_STYLES}
        value={interval.beddingStyle}
        onSelect={(v) => onUpdate({ beddingStyle: v })}
      />

      <GrainSizePicker value={interval.grainSize} onSelect={(v) => onUpdate({ grainSize: v })} />

      <View style={styles.twoCol}>
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Clay %</Text>
          <TextInput
            style={styles.numInput}
            value={String(interval.clayPercent || '')}
            onChangeText={(v) => onUpdate({ clayPercent: v })}
            keyboardType="numeric"
            placeholder="0–100"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Porosity Estimate %</Text>
          <TextInput
            style={styles.numInput}
            value={String(interval.porosityEstimate || '')}
            onChangeText={(v) => onUpdate({ porosityEstimate: v })}
            keyboardType="numeric"
            placeholder="0–35"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      <ButtonStrip
        label="Sorting"
        options={SORTING}
        value={interval.sorting}
        onSelect={(v) => onUpdate({ sorting: v })}
      />

      <BioturbationPicker
        value={interval.bioturbationIndex}
        onSelect={(v) => onUpdate({ bioturbationIndex: v })}
      />

      <ColourPicker value={interval.colour} onSelect={(v) => onUpdate({ colour: v })} />

      <ButtonStrip
        label="Porosity Type"
        options={POROSITY_TYPES}
        value={interval.porosityType}
        onSelect={(v) => onUpdate({ porosityType: v })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 10, gap: 4, paddingBottom: 30 },
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
  stripBtnSmall: { paddingHorizontal: 10, paddingVertical: 9, minWidth: 70 },
  stripBtnText: { ...typography.body, color: colors.textSecondary, fontWeight: '500' },
  stripBtnTextActive: { color: '#fff', fontWeight: '700' },
  stripBtnTextSmall: { fontSize: 13 },

  colourBtn: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 60,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  colourBtnActive: { borderColor: colors.textPrimary, borderWidth: 2.5 },
  colourBtnText: { fontSize: 12, fontWeight: '600' },

  grainRow: { flexDirection: 'row', gap: 4, alignItems: 'flex-end' },
  grainBtn: {
    alignItems: 'center',
    width: 52,
    padding: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  grainBtnActive: { borderColor: colors.accent, backgroundColor: colors.accentLight },
  grainBar: { width: 20, borderRadius: 3 },
  grainLabel: { fontSize: 9, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  grainLabelActive: { color: colors.accent, fontWeight: '700' },

  biRow: { flexDirection: 'row', gap: 8 },
  biBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgPanel,
  },
  biBtnActive: { backgroundColor: colors.navyLight, borderColor: colors.navyLight },
  biBtnNum: { ...typography.h3, color: colors.textPrimary },
  biBtnNumActive: { color: '#fff' },
  biDesc: { ...typography.caption, color: colors.accent, marginTop: 6 },

  twoCol: { flexDirection: 'row', gap: 16 },
  numInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.bgCard,
    width: 120,
    minHeight: 44,
  },
});
