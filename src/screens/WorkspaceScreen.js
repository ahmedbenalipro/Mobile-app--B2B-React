import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, OBJECTIONS, PROSPECTS, formatDuration } from '../data/voxflow';
import { Eyebrow, ScreenHeading, SectionTitle } from '../components/UI';

const OUTCOMES = [
  { label: 'Qualified', icon: 'check' },
  { label: 'Callback', icon: 'clock' },
  { label: 'Not Interested', icon: 'slash' },
  { label: 'No Answer', icon: 'phone-off' },
];

function ProspectCard({ prospect, index, onNext, duration, isRunning, onToggleTimer, onResetTimer }) {
  return (
    <View style={styles.prospectCard}>
      <View style={styles.cardTopline}>
        <Eyebrow>ACTIVE PROSPECT · {String(index + 1).padStart(2, '0')} / 06</Eyebrow>
        <TouchableOpacity onPress={onNext} accessibilityRole="button" style={styles.nextButton}>
          <Text style={styles.nextText}>Next</Text>
          <Feather name="arrow-right" size={13} color={COLORS.taupe} />
        </TouchableOpacity>
      </View>
      <View style={styles.prospectMain}>
        <View style={styles.prospectIdentity}>
          <Text style={styles.prospectName}>{prospect.name}</Text>
          <Text style={styles.prospectRole}>{prospect.role}</Text>
          <Text style={styles.prospectCompany}>{prospect.company} · {prospect.city}</Text>
          <Text style={styles.prospectPhone}>{prospect.phone}</Text>
        </View>
        <View style={styles.timerBlock}>
          <Text style={styles.timer}>{formatDuration(duration)}</Text>
          <View style={styles.timerActions}>
            <TouchableOpacity onPress={onToggleTimer} style={styles.timerAction} accessibilityRole="button" accessibilityLabel={isRunning ? 'Pause timer' : 'Start timer'}>
              <Feather name={isRunning ? 'pause' : 'play'} size={13} color={COLORS.espresso} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onResetTimer} style={styles.timerAction} accessibilityRole="button" accessibilityLabel="Reset timer">
              <Feather name="rotate-ccw" size={13} color={COLORS.taupe} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

function ScriptCard({ scripts }) {
  const [history, setHistory] = useState([]);
  const [stepId, setStepId] = useState('opener');
  const [complete, setComplete] = useState(false);
  const activeStep = scripts.find((step) => step.id === stepId) || scripts[0];
  const stepNumber = String(['OPENER', 'DISCOVERY', 'CLOSING'].indexOf(activeStep.stage) + 1).padStart(2, '0');

  const chooseResponse = (nextId) => {
    if (!nextId) {
      setComplete(true);
      return;
    }
    setHistory((current) => [...current, stepId]);
    setStepId(nextId);
  };

  const goBack = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setStepId(previous);
    setHistory((current) => current.slice(0, -1));
    setComplete(false);
  };

  const reset = () => {
    setStepId('opener');
    setHistory([]);
    setComplete(false);
  };

  return (
    <View style={styles.scriptCard}>
      <View style={styles.scriptMeta}>
        <View style={styles.stageBadge}>
          <Text style={styles.stageBadgeText}>{stepNumber} · {activeStep.stage}</Text>
        </View>
        <Text style={styles.scriptHint}>SAY THIS</Text>
      </View>
      <Text style={styles.prompt}>{activeStep.prompt}</Text>
      <View style={styles.responseHeading}>
        <Text style={styles.responseLabel}>{complete ? 'PATH COMPLETE' : 'WHAT DID THEY SAY?'}</Text>
        {history.length > 0 ? (
          <TouchableOpacity onPress={goBack} accessibilityRole="button">
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {complete ? (
        <View style={styles.completeMessage}>
          <Feather name="check-circle" size={16} color={COLORS.success} />
          <Text style={styles.completeText}>Conversation path complete. Your place is saved.</Text>
        </View>
      ) : (
        <View style={styles.responseList}>
          {activeStep.responses.map((response, index) => (
            <TouchableOpacity
              key={`${activeStep.id}-${index}`}
              onPress={() => chooseResponse(response.next)}
              accessibilityRole="button"
              style={styles.responseButton}
            >
              <Text style={styles.responseButtonText}>{response.label}</Text>
              <Feather name="arrow-up-right" size={13} color={COLORS.subtle} />
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={styles.scriptFooter}>
        <Text style={styles.pathNote}>{history.length + 1} {history.length === 0 ? 'step' : 'steps'} in this path</Text>
        <TouchableOpacity onPress={reset} accessibilityRole="button">
          <Text style={styles.resetText}>Reset script</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ObjectionsDrawer({ region }) {
  const [expanded, setExpanded] = useState(false);
  const objections = OBJECTIONS[region] || OBJECTIONS.France;
  return (
    <View style={styles.objectionCard}>
      <TouchableOpacity
        onPress={() => setExpanded((current) => !current)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={styles.objectionToggle}
      >
        <View style={styles.objectionTitleGroup}>
          <Feather name="message-circle" size={15} color={COLORS.taupe} />
          <Text style={styles.objectionTitle}>Objections</Text>
          <Text style={styles.objectionCount}>04</Text>
        </View>
        <Feather name={expanded ? 'minus' : 'plus'} size={16} color={COLORS.taupe} />
      </TouchableOpacity>
      {expanded ? (
        <View style={styles.objectionList}>
          {objections.map(([title, response]) => (
            <View key={title} style={styles.objectionItem}>
              <Text style={styles.objectionPrompt}>{title}</Text>
              <Text style={styles.objectionResponse}>{response}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Disposition({ note, onChangeNote, onLogCall }) {
  return (
    <View style={styles.dispositionSection}>
      <SectionTitle title="Call disposition" detail="A quick note, then save your outcome." />
      <TextInput
        value={note}
        onChangeText={onChangeNote}
        placeholder="Add a note from this conversation…"
        placeholderTextColor={COLORS.subtle}
        style={styles.noteInput}
        returnKeyType="done"
        accessibilityLabel="Call note"
      />
      <View style={styles.outcomeGrid}>
        {OUTCOMES.map((outcome) => (
          <TouchableOpacity
            key={outcome.label}
            onPress={() => onLogCall(outcome.label)}
            accessibilityRole="button"
            style={styles.outcomeButton}
          >
            <Feather name={outcome.icon} size={14} color={COLORS.olive} />
            <Text style={styles.outcomeText}>{outcome.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function WorkspaceScreen({
  region,
  scripts,
  prospectIndex,
  onNextProspect,
  duration,
  isRunning,
  onToggleTimer,
  onResetTimer,
  onLogCall,
  note,
  onChangeNote,
}) {
  const prospect = PROSPECTS[prospectIndex] || PROSPECTS[0];
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeading
        eyebrow="YOUR LIVE WORKSPACE"
        title="Make it a conversation."
        detail="A little structure. A much more human call."
      />
      <ProspectCard
        prospect={prospect}
        index={prospectIndex}
        onNext={onNextProspect}
        duration={duration}
        isRunning={isRunning}
        onToggleTimer={onToggleTimer}
        onResetTimer={onResetTimer}
      />
      <View style={styles.scriptSection}>
        <SectionTitle title="Conversation guide" detail="A flexible path, not a script to read." />
        <ScriptCard scripts={scripts} />
      </View>
      <ObjectionsDrawer region={region} />
      <Disposition note={note} onChangeNote={onChangeNote} onLogCall={(outcome) => onLogCall(outcome, prospect)} />
      <Text style={styles.footnote}>Take a breath between calls. Good conversations leave room to listen.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 5, paddingBottom: 24 },
  prospectCard: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 15, padding: 15, backgroundColor: COLORS.cream },
  cardTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nextButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 3, paddingLeft: 8 },
  nextText: { color: COLORS.taupe, fontSize: 11, fontWeight: '500' },
  prospectMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  prospectIdentity: { flex: 1, paddingRight: 8 },
  prospectName: { color: COLORS.espresso, fontSize: 17, fontWeight: '600', letterSpacing: -0.25 },
  prospectRole: { color: COLORS.taupe, fontSize: 11, marginTop: 4 },
  prospectCompany: { color: COLORS.espresso, fontSize: 11, marginTop: 7, fontWeight: '500' },
  prospectPhone: { color: COLORS.taupe, fontSize: 10, marginTop: 3, fontVariant: ['tabular-nums'] },
  timerBlock: { minWidth: 94, alignItems: 'flex-end', borderLeftWidth: 1, borderLeftColor: COLORS.border, paddingLeft: 12 },
  timer: { color: COLORS.espresso, fontSize: 26, fontWeight: '500', letterSpacing: 0.7, fontVariant: ['tabular-nums'] },
  timerActions: { flexDirection: 'row', gap: 7, marginTop: 7 },
  timerAction: { width: 29, height: 27, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, backgroundColor: COLORS.linen, alignItems: 'center', justifyContent: 'center' },
  scriptSection: { marginTop: 21 },
  scriptCard: { padding: 16, borderRadius: 15, backgroundColor: COLORS.cream, borderWidth: 1, borderColor: COLORS.border },
  scriptMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stageBadge: { backgroundColor: COLORS.pill, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 },
  stageBadgeText: { color: COLORS.espresso, fontSize: 9, letterSpacing: 0.65, fontWeight: '700' },
  scriptHint: { color: COLORS.subtle, fontSize: 9, letterSpacing: 1.2 },
  prompt: { color: COLORS.espresso, fontFamily: 'Georgia', fontSize: 19, lineHeight: 28, marginTop: 15, marginBottom: 15 },
  responseHeading: { minHeight: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 11, marginBottom: 9 },
  responseLabel: { color: COLORS.taupe, fontSize: 9, letterSpacing: 1.15, fontWeight: '600' },
  backText: { color: COLORS.taupe, fontSize: 11 },
  responseList: { gap: 7 },
  responseButton: { minHeight: 42, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.cream },
  responseButtonText: { flex: 1, color: COLORS.espresso, fontSize: 11, lineHeight: 16, paddingRight: 8 },
  completeMessage: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F0F1EA', borderRadius: 9, padding: 12 },
  completeText: { flex: 1, color: COLORS.olive, fontSize: 11, lineHeight: 16 },
  scriptFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 13 },
  pathNote: { color: COLORS.subtle, fontSize: 10 },
  resetText: { color: COLORS.taupe, fontSize: 10, fontWeight: '500' },
  objectionCard: { marginTop: 11, borderWidth: 1, borderColor: COLORS.border, borderRadius: 13, backgroundColor: COLORS.cream, overflow: 'hidden' },
  objectionToggle: { minHeight: 48, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  objectionTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  objectionTitle: { color: COLORS.espresso, fontSize: 12, fontWeight: '600' },
  objectionCount: { color: COLORS.taupe, fontSize: 10, backgroundColor: COLORS.pill, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 3 },
  objectionList: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingHorizontal: 14 },
  objectionItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  objectionPrompt: { color: COLORS.espresso, fontSize: 11, fontWeight: '600' },
  objectionResponse: { color: COLORS.taupe, fontSize: 11, lineHeight: 17, marginTop: 5 },
  dispositionSection: { marginTop: 20 },
  noteInput: { minHeight: 40, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cream, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, color: COLORS.espresso, fontSize: 11 },
  outcomeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 9 },
  outcomeButton: { minHeight: 38, flexGrow: 1, flexBasis: '45%', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: COLORS.cream },
  outcomeText: { color: COLORS.espresso, fontSize: 10, fontWeight: '500' },
  footnote: { color: COLORS.subtle, fontFamily: 'Georgia', fontSize: 11, fontStyle: 'italic', lineHeight: 17, textAlign: 'center', marginTop: 18, marginBottom: 4 },
});
