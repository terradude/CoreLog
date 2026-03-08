import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, StatusBar,
} from 'react-native';
import { colors, shadows } from '../theme/colors';
import { typography } from '../theme/typography';
import { useProject } from '../context/ProjectContext';

export default function ProjectListScreen({ navigation }) {
  const { state, setActiveProject, deleteProject } = useProject();
  const { projects, loading } = state;

  function openProject(project) {
    setActiveProject(project.id);
    navigation.navigate('LogHeader');
  }

  function newProject() {
    navigation.navigate('ProjectType');
  }

  function confirmDelete(project) {
    Alert.alert(
      'Delete Project',
      `Delete "${project.header?.wellName || project.header?.coreName || 'Unnamed'}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProject(project.id),
        },
      ]
    );
  }

  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-CA');
  }

  function getProjectTitle(p) {
    if (p.type === 'western_canada') {
      return p.header?.wellName || 'Unnamed Well';
    }
    return p.header?.coreName || 'Unnamed Core';
  }

  function getProjectSubtitle(p) {
    if (p.type === 'western_canada') {
      const { lsd, sec, twp, rng, mer } = p.header || {};
      if (lsd) return `${lsd}-${sec}-${twp}-${rng}W${mer}`;
      return 'Western Canada (DLS)';
    }
    const { latDeg, latMin, lonDeg, lonMin } = p.header || {};
    if (latDeg) return `${latDeg}° ${latMin}' N  ${lonDeg}° ${lonMin}' W`;
    return 'International / Offshore';
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {projects.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No projects yet</Text>
          <Text style={styles.emptySubtitle}>Tap "New Project" to start logging</Text>
        </View>
      ) : (
        <FlatList
          data={[...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, shadows.card]}
              onPress={() => openProject(item)}
              onLongPress={() => confirmDelete(item)}
              activeOpacity={0.75}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.typeBadge, item.type === 'western_canada' ? styles.typeCA : styles.typeIntl]}>
                  <Text style={styles.typeText}>{item.type === 'western_canada' ? 'DLS' : 'LAT/LON'}</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{getProjectTitle(item)}</Text>
                <Text style={styles.cardSub}>{getProjectSubtitle(item)}</Text>
                <Text style={styles.cardDate}>
                  {(item.cores || []).length} core run{(item.cores || []).length !== 1 ? 's' : ''}
                  {'  ·  Updated '}
                  {formatDate(item.updatedAt)}
                </Text>
              </View>
              <View style={styles.cardChevron}>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={newProject} activeOpacity={0.85}>
        <Text style={styles.fabText}>+ New Project</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { ...typography.h2, color: colors.textSecondary, marginBottom: 8 },
  emptySubtitle: { ...typography.body, color: colors.textMuted },
  list: { padding: 20, paddingBottom: 120 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    marginBottom: 14,
    padding: 18,
    alignItems: 'center',
  },
  cardLeft: { marginRight: 16 },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  typeCA: { backgroundColor: colors.accentLight },
  typeIntl: { backgroundColor: '#fef3c7' },
  typeText: { ...typography.label, fontWeight: '700', color: colors.textPrimary },
  cardBody: { flex: 1 },
  cardTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: 4 },
  cardSub: { ...typography.body, color: colors.textSecondary, marginBottom: 4 },
  cardDate: { ...typography.caption, color: colors.textMuted },
  cardChevron: { marginLeft: 12 },
  chevron: { fontSize: 28, color: colors.textMuted, lineHeight: 32 },
  fab: {
    position: 'absolute',
    bottom: 36,
    right: 36,
    backgroundColor: colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 30,
    ...shadows.card,
  },
  fabText: { ...typography.h4, color: colors.textOnDark },
});
