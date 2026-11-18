import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../data/voxflow';

export function Eyebrow({ children, style }) {
  return <Text style={[styles.eyebrow, style]}>{children}</Text>;
}

export function ScreenHeading({ eyebrow, title, detail }) {
  return (
    <View style={styles.heading}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Text style={styles.title}>{title}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

export function SectionTitle({ title, detail, action, onAction }) {
  return (
    <View style={styles.sectionTitle}>
      <View>
        <Text style={styles.sectionHeading}>{title}</Text>
        {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
      </View>
      {action ? (
        <TouchableOpacity onPress={onAction} accessibilityRole="button">
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function OutlineButton({ label, onPress, icon, compact = false }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.outlineButton, compact && styles.outlineButtonCompact]}
    >
      {icon ? <Feather name={icon} size={14} color={COLORS.taupe} /> : null}
      <Text style={styles.outlineText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Pill({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.pill, selected && styles.pillSelected]}
    >
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function EmptyState({ icon, title, detail }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Feather name={icon} size={19} color={COLORS.taupe} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDetail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: COLORS.taupe, fontSize: 10, letterSpacing: 1.4, fontWeight: '600' },
  heading: { marginTop: 9, marginBottom: 20 },
  title: { color: COLORS.espresso, fontFamily: 'Georgia', fontSize: 27, lineHeight: 33, marginTop: 5, letterSpacing: -0.55 },
  detail: { color: COLORS.taupe, fontSize: 12, lineHeight: 18, marginTop: 5 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  sectionHeading: { color: COLORS.espresso, fontSize: 14, fontWeight: '600' },
  sectionDetail: { color: COLORS.taupe, fontSize: 11, marginTop: 3 },
  sectionAction: { color: COLORS.taupe, fontSize: 11, fontWeight: '600' },
  outlineButton: {
    minHeight: 37,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: COLORS.cream,
  },
  outlineButtonCompact: { minHeight: 31, paddingHorizontal: 10, borderRadius: 9 },
  outlineText: { color: COLORS.taupe, fontSize: 11, fontWeight: '500' },
  pill: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  pillSelected: { borderColor: COLORS.espresso, backgroundColor: COLORS.espresso },
  pillText: { color: COLORS.taupe, fontSize: 10 },
  pillTextSelected: { color: COLORS.cream, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingHorizontal: 28, paddingVertical: 28, borderWidth: 1, borderColor: COLORS.border, borderRadius: 15, backgroundColor: COLORS.cream },
  emptyIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.pill, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { color: COLORS.espresso, fontSize: 14, fontWeight: '600' },
  emptyDetail: { color: COLORS.taupe, fontSize: 11, textAlign: 'center', lineHeight: 17, marginTop: 6 },
});
