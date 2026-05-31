import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { AssetCard } from '../components/AssetCard';
import { EmptyState } from '../components/EmptyState';
import { Header } from '../components/Header';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionLabel } from '../components/SectionLabel';
import { getCurrentPositions } from '../database/database';
import { fetchQuotes } from '../services/marketApi';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const HomeScreen = ({ currentUser, onSignOut }) => {
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState({ totalValue: 0, totalCost: 0, totalReturn: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadPortfolio = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const positions = await getCurrentPositions();
      const quotes = await fetchQuotes(positions.map((position) => position.ticker));

      const enrichedAssets = positions.map((position) => {
        const quote = quotes[position.ticker];
        const currentPrice = quote?.price || position.averagePrice;
        const currentValue = position.quantity * currentPrice;
        const returnPercent = position.averagePrice > 0
          ? ((currentPrice - position.averagePrice) / position.averagePrice) * 100
          : 0;

        return {
          ...position,
          currentPrice,
          currentValue,
          returnPercent,
          quoteSource: quote?.source || 'local',
        };
      });

      const totalValue = enrichedAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
      const totalCost = enrichedAssets.reduce((sum, asset) => sum + asset.totalCost, 0);
      const totalReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

      setAssets(enrichedAssets);
      setSummary({ totalValue, totalCost, totalReturn });
    } catch (loadError) {
      setError(loadError.message || 'Não foi possível carregar a carteira.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPortfolio();
    }, [loadPortfolio]),
  );

  const isPositive = summary.totalReturn >= 0;
  const summaryAccent = isPositive ? colors.success : colors.danger;

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <Header
        title="Carteira"
        subtitle={currentUser?.name ? `Olá, ${currentUser.name}` : 'Ações, FIIs e ETFs consolidados'}
        actionLabel="Sair"
        onActionPress={onSignOut}
      />

      <LinearGradient colors={['#2D2D2D', '#232323']} style={styles.totalCard}>
        <Text style={styles.totalLabel}>Patrimônio total</Text>
        <Text style={styles.totalValue}>{formatCurrency(summary.totalValue)}</Text>
        <View style={styles.totalMetaRow}>
          <Text style={styles.totalMeta}>Custo {formatCurrency(summary.totalCost)}</Text>
          <View style={[styles.returnBadge, { borderColor: `${summaryAccent}59`, backgroundColor: `${summaryAccent}1F` }]}>
            <Text style={[styles.returnBadgeText, { color: summaryAccent }]}>{formatPercent(summary.totalReturn)}</Text>
          </View>
        </View>
      </LinearGradient>

      <SectionLabel>Posições atuais</SectionLabel>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.foreground} />
          <Text style={styles.loaderText}>Atualizando cotações</Text>
        </View>
      ) : error ? (
        <EmptyState title="Falha ao carregar" description={error} />
      ) : (
        <FlatList
          data={assets}
          keyExtractor={(item) => item.ticker}
          renderItem={({ item }) => <AssetCard asset={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadPortfolio(true)} tintColor={colors.foreground} />
          }
          ListEmptyComponent={
            <EmptyState
              title="Carteira vazia"
              description="Registre uma compra na aba Operar para iniciar o acompanhamento dos ativos."
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={assets.length ? styles.listContent : styles.emptyListContent}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  totalCard: {
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 26,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  totalLabel: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  totalValue: {
    color: colors.foreground,
    fontFamily: fonts.displayBold,
    fontSize: 31,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.8,
    marginTop: 10,
  },
  totalMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  totalMeta: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
  },
  returnBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  returnBadgeText: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  loader: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 30,
  },
  loaderText: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 18,
  },
  emptyListContent: {
    flexGrow: 1,
  },
});
