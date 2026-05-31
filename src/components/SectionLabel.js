import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { fonts, tracking } from '../theme/typography';

export const SectionLabel = ({ children, style }) => <Text style={[styles.label, style]}>{children}</Text>;

const styles = StyleSheet.create({
  label: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: tracking.section,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
});
