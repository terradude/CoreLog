import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Platform,
} from 'react-native';
import { colors, shadows } from '../theme/colors';
import { typography } from '../theme/typography';
import { useProject } from '../context/ProjectContext';
import DateTimePicker from '@react-native-community/datetimepicker';

// Simple inline date picker wrapper
function DateField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  const date = value ? new Date(value) : new Date();

  return (
    <View style={hStyles.fieldGroup}>
      <Text style={hStyles.label}>{label}</Text>
      <TouchableOpacity
        style={hStyles.dateBtn}
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Text style={hStyles.dateBtnText}>
          {date.toLocaleDateString('en-CA')}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display="inline"
          onChange={(e, d) => {
            setShow(false);
            if (d) onChange(d.toISOString());
          }}
        />
      )}
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline, keyboardType, style }) {
  return (
    <View style={[hStyles.fieldGroup, style]}>
      <Text style={hStyles.label}>{label}</Text>
      <TextInput
        style={[hStyles.input, multiline && hStyles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || ''}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

function ToggleBtn({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[hStyles.toggleBtn, active && hStyles.toggleActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[hStyles.toggleText, active && hStyles.toggleTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Western Canada Header ────────────────────────────────────────────────────
function WesternCanadaHeader({ header, onChange, onNavigate }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={hStyles.scrollContent}>
      <View style={hStyles.section}>
        <Text style={hStyles.sectionTitle}>Well Information</Text>
        <Field
          label="Well Name"
          value={header.wellName}
          onChangeText={(v) => onChange({ wellName: v })}
          placeholder="e.g. Pembina Cardium 16-22-48-07W5"
          style={hStyles.fullWidth}
        />

        <Text style={hStyles.sectionTitle}>DLS Location</Text>
        <View style={hStyles.row}>
          <Field label="LSD" value={header.lsd} onChangeText={(v) => onChange({ lsd: v })}
            placeholder="00" keyboardType="numeric" style={hStyles.tinyField} />
          <Field label="Sec" value={header.sec} onChangeText={(v) => onChange({ sec: v })}
            placeholder="00" keyboardType="numeric" style={hStyles.tinyField} />
          <Field label="Twp" value={header.twp} onChangeText={(v) => onChange({ twp: v })}
            placeholder="000" keyboardType="numeric" style={hStyles.smallField} />
          <Field label="Rng" value={header.rng} onChangeText={(v) => onChange({ rng: v })}
            placeholder="00" keyboardType="numeric" style={hStyles.tinyField} />
          <Field label="Mer" value={header.mer} onChangeText={(v) => onChange({ mer: v })}
            placeholder="W5" style={hStyles.tinyField} />
        </View>
        <Field label="Other Location Info" value={header.other}
          onChangeText={(v) => onChange({ other: v })} style={hStyles.fullWidth} />
      </View>

      <View style={hStyles.section}>
        <Text style={hStyles.sectionTitle}>Logging Details</Text>
        <View style={hStyles.row}>
          <DateField label="Date Logged" value={header.dateLogged}
            onChange={(v) => onChange({ dateLogged: v })} />
          <Field label="Logged By" value={header.loggedBy}
            onChangeText={(v) => onChange({ loggedBy: v })}
            placeholder="Geologist name" style={hStyles.medField} />
        </View>

        <Text style={hStyles.label}>Depth Units</Text>
        <View style={hStyles.toggleRow}>
          <ToggleBtn label="Metres" active={header.depthUnits === 'metres'}
            onPress={() => onChange({ depthUnits: 'metres' })} />
          <ToggleBtn label="Feet" active={header.depthUnits === 'feet'}
            onPress={() => onChange({ depthUnits: 'feet' })} />
        </View>

        <View style={hStyles.row}>
          <Field label={`Ground Elevation (${header.depthUnits === 'metres' ? 'm' : 'ft'})`}
            value={header.groundElevation}
            onChangeText={(v) => onChange({ groundElevation: v })}
            keyboardType="numeric" style={hStyles.medField} />
          <Field label={`KB Elevation (${header.depthUnits === 'metres' ? 'm' : 'ft'})`}
            value={header.kbElevation}
            onChangeText={(v) => onChange({ kbElevation: v })}
            keyboardType="numeric" style={hStyles.medField} />
        </View>

        <Field label="Remarks" value={header.remarks}
          onChangeText={(v) => onChange({ remarks: v })}
          multiline placeholder="General remarks about this core..."
          style={hStyles.fullWidth} />
      </View>

      <View style={hStyles.navBtns}>
        <TouchableOpacity style={hStyles.navBtn} onPress={() => onNavigate('tally')}>
          <Text style={hStyles.navBtnText}>Box Tally →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={hStyles.navBtn} onPress={() => onNavigate('depths')}>
          <Text style={hStyles.navBtnText}>Box Depths →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[hStyles.navBtn, hStyles.navBtnPrimary]} onPress={() => onNavigate('log')}>
          <Text style={hStyles.navBtnText}>Open Core Log →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── International Header ─────────────────────────────────────────────────────
function InternationalHeader({ header, onChange, onNavigate }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={hStyles.scrollContent}>
      <View style={hStyles.section}>
        <Text style={hStyles.sectionTitle}>Core Information</Text>
        <Field label="Core Name / ID" value={header.coreName}
          onChangeText={(v) => onChange({ coreName: v })}
          placeholder="e.g. IODP 395A-1H" style={hStyles.fullWidth} />

        <Text style={hStyles.sectionTitle}>Location</Text>
        <View style={hStyles.row}>
          <Text style={[hStyles.label, { alignSelf: 'center', marginTop: 12, marginRight: 8 }]}>Latitude</Text>
          <Field label="Degrees (°)" value={header.latDeg}
            onChangeText={(v) => onChange({ latDeg: v })}
            keyboardType="numeric" style={hStyles.smallField} />
          <Field label="Dec. Minutes (')" value={header.latMin}
            onChangeText={(v) => onChange({ latMin: v })}
            keyboardType="numeric" style={hStyles.smallField} />
          <Text style={[hStyles.label, { alignSelf: 'center', marginTop: 12, marginHorizontal: 16 }]}>N</Text>

          <Text style={[hStyles.label, { alignSelf: 'center', marginTop: 12, marginRight: 8 }]}>Longitude</Text>
          <Field label="Degrees (°)" value={header.lonDeg}
            onChangeText={(v) => onChange({ lonDeg: v })}
            keyboardType="numeric" style={hStyles.smallField} />
          <Field label="Dec. Minutes (')" value={header.lonMin}
            onChangeText={(v) => onChange({ lonMin: v })}
            keyboardType="numeric" style={hStyles.smallField} />
        </View>
      </View>

      <View style={hStyles.section}>
        <Text style={hStyles.sectionTitle}>Logging Details</Text>
        <View style={hStyles.row}>
          <DateField label="Date" value={header.date} onChange={(v) => onChange({ date: v })} />
          <Field label="Described By" value={header.describedBy}
            onChangeText={(v) => onChange({ describedBy: v })}
            placeholder="Geologist name" style={hStyles.medField} />
        </View>

        <Text style={hStyles.label}>Depth Units</Text>
        <View style={hStyles.toggleRow}>
          <ToggleBtn label="Metres" active={header.depthUnits === 'metres'}
            onPress={() => onChange({ depthUnits: 'metres' })} />
          <ToggleBtn label="Feet" active={header.depthUnits === 'feet'}
            onPress={() => onChange({ depthUnits: 'feet' })} />
        </View>

        <View style={hStyles.row}>
          <Field label={`Water Depth (${header.depthUnits === 'metres' ? 'm' : 'ft'})`}
            value={header.waterDepth}
            onChangeText={(v) => onChange({ waterDepth: v })}
            keyboardType="numeric" style={hStyles.medField} />
          <Field label={`Rig Floor to Sea Level (${header.depthUnits === 'metres' ? 'm' : 'ft'})`}
            value={header.rigFloorToSeaLevel}
            onChangeText={(v) => onChange({ rigFloorToSeaLevel: v })}
            keyboardType="numeric" style={hStyles.medField} />
        </View>
      </View>

      <View style={hStyles.navBtns}>
        <TouchableOpacity style={hStyles.navBtn} onPress={() => onNavigate('tally')}>
          <Text style={hStyles.navBtnText}>Section Tally →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={hStyles.navBtn} onPress={() => onNavigate('depths')}>
          <Text style={hStyles.navBtnText}>Section Depths →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[hStyles.navBtn, hStyles.navBtnPrimary]} onPress={() => onNavigate('log')}>
          <Text style={hStyles.navBtnText}>Open Core Log →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function LogHeaderScreen({ navigation }) {
  const { activeProject, updateHeader } = useProject();
  const [header, setHeader] = useState(activeProject?.header || {});

  useEffect(() => {
    if (activeProject) setHeader(activeProject.header);
  }, [activeProject?.id]);

  function onChange(fields) {
    const updated = { ...header, ...fields };
    setHeader(updated);
    updateHeader(fields);
  }

  function onNavigate(dest) {
    if (dest === 'tally') navigation.navigate('BoxTally');
    else if (dest === 'depths') navigation.navigate('BoxDepths');
    else if (dest === 'log') navigation.navigate('MainLogging');
  }

  if (!activeProject) return (
    <View style={hStyles.center}>
      <Text style={typography.body}>No project selected.</Text>
    </View>
  );

  return (
    <View style={hStyles.container}>
      {activeProject.type === 'western_canada' ? (
        <WesternCanadaHeader header={header} onChange={onChange} onNavigate={onNavigate} />
      ) : (
        <InternationalHeader header={header} onChange={onChange} onNavigate={onNavigate} />
      )}
    </View>
  );
}

const hStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 28, paddingBottom: 60 },

  section: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.navyLight,
    marginBottom: 14,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, alignItems: 'flex-start' },

  fieldGroup: { marginBottom: 4 },
  fullWidth: { flex: 1, minWidth: 300 },
  medField: { flex: 1, minWidth: 180 },
  smallField: { width: 130 },
  tinyField: { width: 80 },

  label: { ...typography.label, color: colors.textSecondary, marginBottom: 6, marginTop: 12 },
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
  inputMultiline: { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 },

  dateBtn: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.bgCard,
    minHeight: 48,
    minWidth: 160,
    justifyContent: 'center',
  },
  dateBtnText: { fontSize: 16, color: colors.textPrimary },

  toggleRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  toggleBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgPanel,
  },
  toggleActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  toggleText: { ...typography.body, color: colors.textSecondary, fontWeight: '600' },
  toggleTextActive: { color: colors.textOnDark },

  navBtns: { flexDirection: 'row', gap: 16, justifyContent: 'flex-end', marginTop: 8 },
  navBtn: {
    backgroundColor: colors.navyLight,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  navBtnPrimary: { backgroundColor: colors.accent },
  navBtnText: { ...typography.h4, color: colors.textOnDark },
});
