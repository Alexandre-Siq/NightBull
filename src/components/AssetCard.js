import { StyleSheet, Text, View } from 'react-native';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { formatCurrency, formatPercent, initialsFromTicker } from '../utils/formatters';

export const AssetCard = ({ asset }) => {
  const isPositive = asset.returnPercent >= 0;
  const accent = isPositive ? colors.success : colors.danger;
  const VariationIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initialsFromTicker(asset.ticker)}</Text>
        </View>
        <View style={styles.assetInfo}>
          <Text style={styles.ticker}>{asset.ticker}</Text>
          <Text style={styles.meta}>
            {asset.quantity} cotas | PM {formatCurrency(asset.averagePrice)}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.price}>{formatCurrency(asset.currentPrice)}</Text>
        <View style={[styles.badge, { borderColor: `${accent}59`, backgroundColor: `${accent}1F` }]}>
          <VariationIcon color={accent} size={11} strokeWidth={2.2} />
          <Text style={[styles.badgeText, { color: accent }]}>{formatPercent(asset.returnPercent)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  left: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    marginRight: 12,
    width: 36,
  },
  avatarText: {
    color: colors.foreground,
    fontFamily: fonts.monoMedium,
    fontSize: 13,
  },
  assetInfo: {
    flex: 1,
    minWidth: 0,
  },
  ticker: {
    color: colors.foreground,
    fontFamily: fonts.monoMedium,
    fontSize: 15,
  },
  meta: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    marginTop: 5,
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  price: {
    color: colors.foreground,
    fontFamily: fonts.displaySemiBold,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  badge: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
});
