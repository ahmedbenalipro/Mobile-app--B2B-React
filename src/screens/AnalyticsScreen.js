import { useMemo, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, REGIONS, formatDuration } from '../data/voxflow';
import { EmptyState, Pill, ScreenHeading, SectionTitle } from '../components/UI';

const OUTCOMES = ['Qualified', 'Callback', 'Not Interested', 'No Answer'];

function StatCard({ label, value, note }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statNote}>{note}</Text>
    </View>
  );
}

function CallRow({ call }) {
  const color = call.outcome === 'Qualified' ? COLORS.success : COLORS.taupe;
  return (
    <View style={styles.callRow}>
      <View style={styles.callIcon}>
        <Feather name={call.outcome === 'Qualified' ? 'check' : call.outcome === 'No Answer' ? 'phone-off' : 'phone'} size={15} color={color} />
      </View>
      <View style={styles.callDetails}>
        <Text style={styles.callName}>{call.name}</Text>
        <Text style={styles.callMeta}>{call.company} · {call.region}</Text>
        {call.note ? <Text numberOfLines={1} style={styles.callNote}>{call.note}</Text> : null}
      </View>
      <View style={styles.callRight}>
        <Text style={[styles.callOutcome, { color }]}>{call.outcome}</Text>
        <Text style={styles.callDuration}>{formatDuration(call.duration)}</Text>
      </View>
    </View>
  );
}

function makeCsv(calls) {
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = [
    ['Date', 'Prospect', 'Company', 'Region', 'Outcome', 'Duration (seconds)', 'Note'],
    ...calls.map((call) => [
      new Date(call.date).toLocaleString(),
      call.name,
      call.company,
      call.region,
      call.outcome,
      call.duration,
      call.note,
    ]),
  ];
  return rows.map((row) => row.map(escape).join(',')).join('\n');
}

export function AnalyticsScreen({ calls, onLoadDemo }) {
  const [regionFilter, setRegionFilter] = useState('All regions');
  const [outcomeFilter, setOutcomeFilter] = useState('All outcomes');
  const connected = calls.filter((call) => call.outcome !== 'No Answer').length;
  const average = calls.length
    ? Math.round(calls.reduce((total, call) => total + call.duration, 0) / calls.length)
    : 0;
  const filteredCalls = useMemo(
    () => calls.filter(
      (call) =>
        (regionFilter === 'All regions' || call.region === regionFilter) &&
        (outcomeFilter === 'All outcomes' || call.outcome === outcomeFilter),
    ),
    [calls, outcomeFilter, regionFilter],
  );
  const completionRate = calls.length ? `${Math.round((connected / calls.length) * 100)}%` : '—';

  const shareCsv = async () => {
    await Share.share({
      message: makeCsv(filteredCalls),
      title: 'VoxFlow call report',
      subject: 'VoxFlow call report',
    });
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeading
        eyebrow="A CLEARER VIEW"
        title="The work, in focus."
        detail="A thoughtful record of the conversations that matter."
      />
      <View style={styles.statsGrid}>
        <StatCard label="TOTAL CALLS" value={String(calls.length).padStart(2, '0')} note="logged conversations" />
        <StatCard label="COMPLETION" value={completionRate} note="connected calls" />
        <StatCard label="AVG. DURATION" value={calls.length ? formatDuration(average) : '—'} note="minutes : seconds" />
      </View>
      <View style={styles.historySection}>
        <SectionTitle
          title="Call history"
          detail={`${filteredCalls.length} ${filteredCalls.length === 1 ? 'conversation' : 'conversations'}`}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {['All regions', ...REGIONS].map((item) => (
            <Pill key={item} label={item} selected={regionFilter === item} onPress={() => setRegionFilter(item)} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {['All outcomes', ...OUTCOMES].map((item) => (
            <Pill key={item} label={item} selected={outcomeFilter === item} onPress={() => setOutcomeFilter(item)} />
          ))}
        </ScrollView>
        <View style={styles.callList}>
          {filteredCalls.length ? (
            filteredCalls.map((call) => <CallRow key={call.id} call={call} />)
          ) : calls.length ? (
            <EmptyState icon="filter" title="No calls match these filters" detail="Try choosing a different region or outcome." />
          ) : (
            <EmptyState icon="phone" title="Your call history starts here" detail="Log an outcome in your workspace or load a few sample conversations." />
          )}
        </View>
      </View>
      <View style={styles.actions}>
        {calls.length === 0 ? (
          <TouchableOpacity onPress={onLoadDemo} accessibilityRole="button" style={styles.secondaryButton}>
            <Feather name="layers" size={15} color={COLORS.espresso} />
            <Text style={styles.secondaryText}>Load demo data</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          onPress={shareCsv}
          disabled={filteredCalls.length === 0}
          accessibilityRole="button"
          style={[styles.primaryButton, filteredCalls.length === 0 && styles.disabledButton]}
        >
          <Feather name="share" size={15} color={COLORS.cream} />
          <Text style={styles.primaryText}>Share CSV report</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.privacyNote}>
        <Feather name="lock" size={12} color={COLORS.subtle} />
        <Text style={styles.privacyText}>Call notes are kept locally in this session.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 5, paddingBottom: 26 },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, minHeight: 106, padding: 10, borderWidth: 1, borderColor: COLORS.border, borderRadius: 13, backgroundColor: COLORS.cream, justifyContent: 'space-between' },
  statLabel: { color: COLORS.taupe, fontSize: 8, fontWeight: '600', letterSpacing: 0.7 },
  statValue: { color: COLORS.espresso, fontSize: 23, fontWeight: '500', fontVariant: ['tabular-nums'], marginTop: 8 },
  statNote: { color: COLORS.subtle, fontSize: 9 },
  historySection: { marginTop: 25 },
  filterRow: { flexDirection: 'row', gap: 7, paddingBottom: 8, paddingRight: 8 },
  callList: { marginTop: 4, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, backgroundColor: COLORS.cream, overflow: 'hidden' },
  callRow: { minHeight: 74, paddingHorizontal: 12, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  callIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.linen, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  callDetails: { flex: 1, paddingRight: 7 },
  callName: { color: COLORS.espresso, fontSize: 12, fontWeight: '600' },
  callMeta: { color: COLORS.taupe, fontSize: 10, marginTop: 4 },
  callNote: { color: COLORS.subtle, fontSize: 9, marginTop: 4 },
  callRight: { alignItems: 'flex-end', gap: 5 },
  callOutcome: { fontSize: 9, fontWeight: '600' },
  callDuration: { color: COLORS.taupe, fontSize: 10, fontVariant: ['tabular-nums'] },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15 },
  primaryButton: { flexGrow: 1, minHeight: 43, borderRadius: 11, backgroundColor: COLORS.espresso, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14 },
  primaryText: { color: COLORS.cream, fontSize: 11, fontWeight: '600' },
  disabledButton: { backgroundColor: '#A39B8F' },
  secondaryButton: { flexGrow: 1, minHeight: 43, borderRadius: 11, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cream, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 13 },
  secondaryText: { color: COLORS.espresso, fontSize: 11, fontWeight: '600' },
  privacyNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 15 },
  privacyText: { color: COLORS.subtle, fontSize: 10 },
});
