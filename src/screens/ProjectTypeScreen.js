import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, shadows } from '../theme/colors';
import { typography } from '../theme/typography';
import { useProject } from '../context/ProjectContext';

export default function ProjectTypeScreen({ navigation }) {
  const { createProject } = useProject();

  async function select(type) {
    await createProject(type);
    navigation.replace('LogHeader');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select Project Type</Text>
      <Text style={styles.sub}>This determines the location and header fields for your log.</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.card, shadows.card]}
          onPress={() => select('western_canada')}
          activeOpacity={0.8}
        >
          <Text style={styles.icon}>🇨🇦</Text>
          <Text style={styles.cardTitle}>Western Canada</Text>
          <Text style={styles.cardDesc}>
            DLS location system{'\n'}
            LSD / Sec / Twp / Rng / Mer{'\n'}
            Box Tally + Box Depths
          </Text>
          <View style={styles.selectBtn}>
            <Text style={styles.selectText}>Select</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, shadows.card]}
          onPress={() => select('international')}
          activeOpacity={0.8}
        >
          <Text style={styles.icon}>🌍</Text>
          <Text style={styles.cardTitle}>International / Offshore</Text>
          <Text style={styles.cardDesc}>
            Latitude / Longitude{'\n'}
            Degrees + Decimal Minutes{'\n'}
            Section Tally + Section Depths
          </Text>
          <View style={[styles.selectBtn, styles.selectBtnIntl]}>
            <Text style={styles.selectText}>Select</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  sub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
    maxWidth: 600,
  },
  row: {
    flexDirection: 'row',
    gap: 32,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 36,
    alignItems: 'center',
    width: 300,
  },
  icon: { fontSize: 56, marginBottom: 16 },
  cardTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  cardDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  selectBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  selectBtnIntl: { backgroundColor: colors.warning },
  selectText: { ...typography.h4, color: colors.textOnDark },
});
