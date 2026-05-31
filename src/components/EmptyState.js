import { StyleSheet, Text, View } from 'react-native';
import { CircleSlash } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export const EmptyState = ({ title, description }) => (
  <View style={styles.container}>
    <CircleSlash color={colors.mutedForeground} size={24} strokeWidth={1.8} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  title: {
    color: colors.foreground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    marginTop: 14,
  },
  description: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
});
