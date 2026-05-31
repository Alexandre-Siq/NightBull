import { StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export const Header = ({ title, subtitle }) => (
  <View style={styles.container}>
    <View>
      <Text style={styles.eyebrow}>NightBull</Text>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>

    <LinearGradient colors={['#474747', '#292929']} style={styles.brandMark}>
      <LineChart color={colors.foreground} size={28} strokeWidth={2} />
      <View style={styles.brandDot} />
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  eyebrow: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 2.3,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.foreground,
    fontFamily: fonts.displayBold,
    fontSize: 30,
    letterSpacing: -0.6,
  },
  subtitle: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    marginTop: 6,
  },
  brandMark: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    position: 'relative',
    width: 48,
  },
  brandDot: {
    backgroundColor: colors.success,
    borderRadius: 5,
    height: 10,
    position: 'absolute',
    right: 7,
    top: 7,
    width: 10,
  },
});
