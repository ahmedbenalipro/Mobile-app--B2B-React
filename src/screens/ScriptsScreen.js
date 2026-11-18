import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../data/voxflow';
import { Eyebrow, OutlineButton, ScreenHeading } from '../components/UI';

function ScriptNodeEditor({ node, index, total, onChange }) {
  const updateResponse = (responseIndex, label) => {
    const responses = node.responses.map((response, position) =>
      position === responseIndex ? { ...response, label } : response,
    );
    onChange({ ...node, responses });
  };

  return (
    <View style={styles.nodeCard}>
      <View style={styles.nodeHeader}>
        <View style={styles.nodeBadge}>
          <Text style={styles.nodeBadgeText}>{String(index + 1).padStart(2, '0')}</Text>
        </View>
        <View style={styles.nodeHeading}>
          <Text style={styles.nodeStage}>{node.stage}</Text>
          <Text style={styles.nodeCount}>STEP {index + 1} OF {total}</Text>
        </View>
        <Feather name="edit-3" size={14} color={COLORS.subtle} />
      </View>
      <Text style={styles.fieldLabel}>PROMPT</Text>
      <TextInput
        value={node.prompt}
        onChangeText={(prompt) => onChange({ ...node, prompt })}
        multiline
        textAlignVertical="top"
        style={styles.promptInput}
        accessibilityLabel={`${node.stage} prompt`}
      />
      <Text style={styles.fieldLabel}>PROSPECT RESPONSES</Text>
      <View style={styles.responseEdits}>
        {node.responses.map((response, responseIndex) => (
          <View key={`${node.id}-${responseIndex}`} style={styles.responseEdit}>
            <View style={styles.responseDot} />
            <TextInput
              value={response.label}
              onChangeText={(label) => updateResponse(responseIndex, label)}
              style={styles.responseInput}
              accessibilityLabel={`${node.stage} response ${responseIndex + 1}`}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

export function ScriptsScreen({ region, campaign, scripts, onUpdateScripts, onRestoreDefaults }) {
  const [showRestored, setShowRestored] = useState(false);

  const updateNode = (nodeIndex, updatedNode) => {
    const next = scripts.map((node, index) => (index === nodeIndex ? updatedNode : node));
    onUpdateScripts(next);
    setShowRestored(false);
  };

  const restore = () => {
    onRestoreDefaults();
    setShowRestored(true);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <ScreenHeading
        eyebrow="YOUR WORDS, YOUR WAY"
        title="A voice of your own."
        detail="Shape a thoughtful conversation, one step at a time."
      />
      <View style={styles.infoCard}>
        <View style={styles.infoIcon}><Feather name="globe" size={16} color={COLORS.olive} /></View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>{region} · {campaign === 'b2b' ? 'B2B outreach' : 'B2C survey'}</Text>
          <Text style={styles.infoDetail}>Changes are saved on this device for your current region and campaign.</Text>
        </View>
      </View>
      <View style={styles.editorHeading}>
        <View>
          <Eyebrow>CONVERSATION FLOW</Eyebrow>
          <Text style={styles.editorTitle}>Script steps</Text>
        </View>
        <OutlineButton label="Restore defaults" icon="rotate-ccw" onPress={restore} compact />
      </View>
      {showRestored ? (
        <View style={styles.restoredNotice}>
          <Feather name="check" size={13} color={COLORS.success} />
          <Text style={styles.restoredText}>Default {region} script restored.</Text>
        </View>
      ) : null}
      {scripts.map((node, index) => (
        <ScriptNodeEditor key={`${region}-${campaign}-${node.id}`} node={node} index={index} total={scripts.length} onChange={(updated) => updateNode(index, updated)} />
      ))}
      <View style={styles.editorNote}>
        <Feather name="edit-2" size={13} color={COLORS.taupe} />
        <Text style={styles.editorNoteText}>Your script is a guide. Leave room for the person on the other end.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 5, paddingBottom: 25 },
  infoCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 13, backgroundColor: COLORS.cream, padding: 12, gap: 10 },
  infoIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F0F1EA', alignItems: 'center', justifyContent: 'center' },
  infoContent: { flex: 1 },
  infoTitle: { color: COLORS.espresso, fontSize: 11, fontWeight: '600' },
  infoDetail: { color: COLORS.taupe, fontSize: 10, lineHeight: 15, marginTop: 3 },
  editorHeading: { marginTop: 24, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editorTitle: { color: COLORS.espresso, fontFamily: 'Georgia', fontSize: 21, marginTop: 4 },
  nodeCard: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, backgroundColor: COLORS.cream, padding: 14, marginBottom: 10 },
  nodeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  nodeBadge: { width: 30, height: 30, borderRadius: 9, backgroundColor: COLORS.pill, alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  nodeBadgeText: { color: COLORS.espresso, fontSize: 10, fontWeight: '700' },
  nodeHeading: { flex: 1, gap: 3 },
  nodeStage: { color: COLORS.espresso, fontSize: 11, fontWeight: '700', letterSpacing: 0.7 },
  nodeCount: { color: COLORS.subtle, fontSize: 8, letterSpacing: 0.7 },
  fieldLabel: { color: COLORS.taupe, fontSize: 8, letterSpacing: 1.05, fontWeight: '600', marginBottom: 7 },
  promptInput: { minHeight: 77, borderWidth: 1, borderColor: COLORS.border, borderRadius: 9, paddingHorizontal: 10, paddingTop: 9, paddingBottom: 9, color: COLORS.espresso, backgroundColor: COLORS.linen, fontFamily: 'Georgia', fontSize: 13, lineHeight: 19 },
  responseEdits: { gap: 6 },
  responseEdit: { minHeight: 35, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 10, backgroundColor: COLORS.linen },
  responseDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.olive, marginRight: 9 },
  responseInput: { flex: 1, paddingVertical: 7, color: COLORS.espresso, fontSize: 10 },
  restoredNotice: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0F1EA', borderRadius: 8, padding: 9, marginBottom: 10 },
  restoredText: { color: COLORS.olive, fontSize: 10 },
  editorNote: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 10, paddingHorizontal: 10 },
  editorNoteText: { color: COLORS.taupe, fontFamily: 'Georgia', fontSize: 11, fontStyle: 'italic', flexShrink: 1, lineHeight: 17, textAlign: 'center' },
});
