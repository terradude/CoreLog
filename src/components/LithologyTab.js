import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { P1_CARBONATES, P2_CLASTICS, P4_VOLCANIC } from '../data/lithologies';
import LithologyPattern from './LithologyPattern';

const PALETTES = [
  { id: 'P1', label: 'P1 Carbonates', color: colors.p1, items: P1_CARBONATES },
  { id: 'P2', label: 'P2 Clastics', color: colors.p2, items: P2_CLASTICS },
  { id: 'P3', label: 'P3 Custom', color: colors.p3, items: [] },
  { id: 'P4', label: 'P4 Volcanic', color: colors.p4, items: P4_VOLCANIC },
];

export default function LithologyTab({ interval, onUpdate, customLithologies = [] }) {
  const [activePalette, setActivePalette] = useState('P1');

  const selectedId = interval?.lithologyId || null;
  const isInterbedded = interval?.isInterbedded || false;
  const secondaryId = interval?.secondaryLithologyId || null;
  const interbeddedPct = interval?.interbeddedPercent ?? 50;

  const paletteItems = {
    P1: P1_CARBONATES,
    P2: P2_CLASTICS,
    P3: customLithologies,
    P4: P4_VOLCANIC,
  }[activePalette] || [];

  function selectLith(id) {
    onUpdate({ lithologyId: id });
  }

  function selectSecondary(id) {
    onUpdate({ secondaryLithologyId: id });
  }

  const selectedLith = [...P1_CARBONATES, ...P2_CLASTICS, ...P4_VOLCANIC, ...customLithologies]
    .find((l) => l.id === selectedId);
  const secondaryLith = [...P1_CARBONATES, ...P2_CLASTICS, ...P4_VOLCANIC, ...customLithologies]
    .find((l) => l.id === secondaryId);

  return (
    <View style={styles.container}>
      {/* Palette selector strip */}
      <View style={styles.paletteStrip}>
        {PALETTES.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.paletteBtn, activePalette === p.id && { backgroundColor: p.color }]}
            onPress={() => setActivePalette(p.id)}
            activeOpacity={0.75}
          >
            <Text style={[styles.paletteBtnText, activePalette === p.id && styles.paletteBtnTextActive]}>
              {p.id}
            </Text>
            <Text style={[styles.paletteLabelSmall, activePalette === p.id && styles.paletteBtnTextActive]}
              numberOfLines={1}>
              {p.label.split(' ').slice(1).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected lithology display */}
      {selectedLith && (
        <View style={styles.selectedBar}>
          <LithologyPattern pattern={selectedLith.pattern} width={56} height={28} />
          <Text style={styles.selectedName}>{selectedLith.name}</Text>
          {isInterbedded && secondaryLith && (
            <>
              <Text style={styles.interText}>/{Math.round(100 - interbeddedPct)}%</Text>
              <LithologyPattern pattern={secondaryLith.pattern} width={56} height={28} />
              <Text style={styles.selectedName}>{secondaryLith.name} {Math.round(100 - interbeddedPct)}%</Text>
            </>
          )}
        </View>
      )}

      {/* Grid */}
      <ScrollView style={styles.grid} contentContainerStyle={styles.gridContent}>
        {paletteItems.length === 0 ? (
          <View style={styles.emptyPalette}>
            <Text style={styles.emptyText}>
              {activePalette === 'P3'
                ? 'No custom lithologies yet.\nAdd them in Settings.'
                : 'No lithologies in this palette.'}
            </Text>
          </View>
        ) : (
          <View style={styles.gridRow}>
            {paletteItems.map((lith) => {
              const isSelected = lith.id === selectedId;
              const isSecondary = lith.id === secondaryId && isInterbedded;
              return (
                <TouchableOpacity
                  key={lith.id}
                  style={[
                    styles.lithBtn,
                    isSelected && styles.lithBtnSelected,
                    isSecondary && styles.lithBtnSecondary,
                  ]}
                  onPress={() => {
                    if (isInterbedded && selectedId && !isSelected) {
                      selectSecondary(lith.id);
                    } else {
                      selectLith(lith.id);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <LithologyPattern pattern={lith.pattern} width={52} height={30} />
                  <Text style={styles.lithName} numberOfLines={2}>{lith.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Interbedded toggle */}
      <View style={styles.interRow}>
        <Text style={styles.interLabel}>INTERBEDDED</Text>
        <Switch
          value={isInterbedded}
          onValueChange={(v) => onUpdate({ isInterbedded: v })}
          trackColor={{ true: colors.accent }}
          thumbColor={isInterbedded ? colors.accentDark : '#ccc'}
        />

        {isInterbedded && (
          <View style={styles.interControls}>
            <Text style={styles.interHint}>
              Primary {Math.round(interbeddedPct)}% / Secondary {Math.round(100 - interbeddedPct)}%
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={10}
              maximumValue={90}
              step={5}
              value={interbeddedPct}
              onValueChange={(v) => onUpdate({ interbeddedPercent: v })}
              minimumTrackTintColor={colors.accent}
              maximumTrackTintColor={colors.border}
            />
            <Text style={styles.interHint2}>
              Tap a second lithology in the grid to set the secondary
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  paletteStrip: { flexDirection: 'row', gap: 8, padding: 10, paddingBottom: 8 },
  paletteBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.bgPanel,
    minHeight: 52,
    justifyContent: 'center',
  },
  paletteBtnText: { ...typography.h4, color: colors.textPrimary },
  paletteLabelSmall: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  paletteBtnTextActive: { color: '#fff' },

  selectedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 8,
  },
  selectedName: { ...typography.h4, color: colors.textPrimary, flex: 1 },
  interText: { ...typography.body, color: colors.textSecondary },

  grid: { flex: 1 },
  gridContent: { padding: 8, paddingBottom: 16 },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  emptyPalette: { flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },

  lithBtn: {
    width: 90,
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  lithBtnSelected: { borderColor: colors.accent, borderWidth: 2.5, backgroundColor: colors.accentLight },
  lithBtnSecondary: { borderColor: colors.warning, borderWidth: 2 },
  lithName: { ...typography.caption, color: colors.textPrimary, textAlign: 'center', marginTop: 4, minHeight: 28 },

  interRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
    flexWrap: 'wrap',
  },
  interLabel: { ...typography.label, color: colors.textSecondary, fontWeight: '700' },
  interControls: { flex: 1, minWidth: 200 },
  interHint: { ...typography.caption, color: colors.accent, marginBottom: 4 },
  interHint2: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  slider: { flex: 1, height: 36 },
});
