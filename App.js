import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { ScriptsScreen } from './src/screens/ScriptsScreen';
import { WorkspaceScreen } from './src/screens/WorkspaceScreen';
import { COLORS, REGIONS, makeScripts } from './src/data/voxflow';

const TABS = [
  { id: 'workspace', label: 'Workspace', icon: 'mic' },
  { id: 'analytics', label: 'Analytics', icon: 'bar-chart-2' },
  { id: 'scripts', label: 'Scripts', icon: 'file-text' },
];

function BrandHeader() {
  return (
    <View style={styles.brandRow}>
      <View style={styles.brandMark}>
        <Feather name="activity" size={17} color={COLORS.cream} />
      </View>
      <View>
        <Text style={styles.brandName}>voxflow</Text>
        <Text style={styles.brandCaption}>CONVERSATION STUDIO</Text>
      </View>
      <View style={styles.availability}>
        <View style={styles.availabilityDot} />
        <Text style={styles.availabilityText}>READY</Text>
      </View>
    </View>
  );
}

function CampaignSelector({ campaign, onChange }) {
  return (
    <View style={styles.campaignTrack}>
      {[
        ['b2b', 'B2B Outreach'],
        ['b2c', 'B2C Survey'],
      ].map(([value, label]) => {
        const selected = campaign === value;
        return (
          <TouchableOpacity
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(value)}
            style={[styles.campaignOption, selected && styles.campaignOptionSelected]}
          >
            <Text style={[styles.campaignText, selected && styles.campaignTextSelected]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function RegionSelector({ region, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.regionRow}
      accessibilityLabel="Choose a language and region"
    >
      {REGIONS.map((item) => {
        const selected = region === item;
        return (
          <TouchableOpacity
            key={item}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(item)}
            style={[styles.regionPill, selected && styles.regionPillSelected]}
          >
            <Text style={[styles.regionText, selected && styles.regionTextSelected]}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function BottomNavigation({ activeTab, onChange }) {
  return (
    <View style={styles.bottomBar}>
      {TABS.map((tab) => {
        const selected = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(tab.id)}
            style={styles.tabButton}
          >
            <Feather name={tab.icon} size={19} color={selected ? COLORS.espresso : COLORS.taupe} />
            <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function App() {
  const [tab, setTab] = useState('workspace');
  const [campaign, setCampaign] = useState('b2b');
  const [region, setRegion] = useState('France');
  const [prospectIndex, setProspectIndex] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [calls, setCalls] = useState([]);
  const [note, setNote] = useState('');
  const [scriptEdits, setScriptEdits] = useState({});
  const scriptKey = `${campaign}:${region}`;
  const scripts = useMemo(
    () => scriptEdits[scriptKey] || makeScripts(campaign, region),
    [campaign, region, scriptEdits, scriptKey],
  );

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = setInterval(() => setDuration((seconds) => seconds + 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  const updateScripts = (nextScripts) => {
    setScriptEdits((current) => ({ ...current, [scriptKey]: nextScripts }));
  };

  const restoreScripts = () => {
    setScriptEdits((current) => {
      const next = { ...current };
      delete next[scriptKey];
      return next;
    });
  };

  const moveToNextProspect = () => {
    setProspectIndex((current) => (current + 1) % 6);
    setNote('');
    setDuration(0);
    setIsRunning(false);
  };

  const recordCall = (outcome, prospect) => {
    setCalls((current) => [
      {
        id: `${Date.now()}-${current.length}`,
        name: prospect.name,
        company: prospect.company,
        region,
        outcome,
        duration,
        note: note.trim(),
        date: new Date().toISOString(),
      },
      ...current,
    ]);
    moveToNextProspect();
  };

  const screenProps = { campaign, region, scripts, onUpdateScripts: updateScripts };
  let screen;
  if (tab === 'analytics') {
    screen = <AnalyticsScreen calls={calls} onLoadDemo={() => setCalls(createDemoCalls())} />;
  } else if (tab === 'scripts') {
    screen = <ScriptsScreen {...screenProps} onRestoreDefaults={restoreScripts} />;
  } else {
    screen = (
      <WorkspaceScreen
        key={`${scriptKey}:${prospectIndex}`}
        {...screenProps}
        prospectIndex={prospectIndex}
        onNextProspect={moveToNextProspect}
        duration={duration}
        isRunning={isRunning}
        onToggleTimer={() => setIsRunning((running) => !running)}
        onResetTimer={() => {
          setIsRunning(false);
          setDuration(0);
        }}
        onLogCall={recordCall}
        note={note}
        onChangeNote={setNote}
      />
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.linen} />
      <View style={styles.topControls}>
        <BrandHeader />
        <CampaignSelector campaign={campaign} onChange={setCampaign} />
        <RegionSelector region={region} onChange={setRegion} />
      </View>
      <View style={styles.screenContainer}>{screen}</View>
      <BottomNavigation activeTab={tab} onChange={setTab} />
    </SafeAreaView>
  );
}

function createDemoCalls() {
  const examples = [
    ['Camille Bernard', 'Atelier Nord', 'France', 'Qualified', 326, 'Souhaite une démonstration mardi.'],
    ['Marc Dubois', 'Léman Conseil', 'Switzerland', 'Callback', 188, 'Rappeler après le comité.'],
    ['Sophie Lambert', 'Maison Verne', 'Belgium', 'Not Interested', 94, 'Déjà équipée.'],
    ['Thomas Weber', 'Luxembourg & Co.', 'Luxembourg', 'Qualified', 412, 'Échange très positif.'],
    ['Claire Martin', 'Fieldwork Studio', 'English', 'No Answer', 36, ''],
  ];
  return examples.map(([name, company, region, outcome, duration, note], index) => ({
    id: `demo-${index}`,
    name,
    company,
    region,
    outcome,
    duration,
    note,
    date: new Date(Date.now() - index * 3600000).toISOString(),
  }));
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.linen },
  topControls: { paddingHorizontal: 20, paddingTop: 8, backgroundColor: COLORS.linen },
  brandRow: { height: 48, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.espresso,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandName: { color: COLORS.espresso, fontSize: 17, fontWeight: '700', letterSpacing: -0.5 },
  brandCaption: { color: COLORS.taupe, fontSize: 8, letterSpacing: 1.15, marginTop: 1 },
  availability: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  availabilityDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.olive, marginRight: 6 },
  availabilityText: { color: COLORS.olive, fontSize: 9, letterSpacing: 1, fontWeight: '700' },
  campaignTrack: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
    backgroundColor: '#EDE9DF',
    alignSelf: 'flex-start',
    marginBottom: 11,
  },
  campaignOption: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 9 },
  campaignOptionSelected: { backgroundColor: COLORS.cream },
  campaignText: { fontSize: 11, color: COLORS.taupe, fontWeight: '500' },
  campaignTextSelected: { color: COLORS.espresso, fontWeight: '700' },
  regionRow: { alignItems: 'center', paddingBottom: 12, paddingRight: 8, gap: 7 },
  regionPill: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cream,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  regionPillSelected: { borderColor: COLORS.espresso, backgroundColor: COLORS.espresso },
  regionText: { color: COLORS.taupe, fontSize: 11 },
  regionTextSelected: { color: COLORS.cream, fontWeight: '600' },
  screenContainer: { flex: 1 },
  bottomBar: {
    minHeight: 65,
    paddingBottom: 5,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.cream,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 7, gap: 4 },
  tabLabel: { fontSize: 10, color: COLORS.taupe, letterSpacing: 0.1 },
  tabLabelSelected: { color: COLORS.espresso, fontWeight: '700' },
});
