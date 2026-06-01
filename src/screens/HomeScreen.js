import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, CalendarDays } from 'lucide-react-native';
import { AssetCard } from '../components/AssetCard';
import { EmptyState } from '../components/EmptyState';
import { Header } from '../components/Header';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionLabel } from '../components/SectionLabel';
import { getCurrentPositions, getTransactions } from '../database/database';
import { fetchQuotes } from '../services/marketApi';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { formatCurrency, formatDate, formatPercent } from '../utils/formatters';

const MetricCard = ({ label, value, detail, tone = 'neutral' }) => {
  const accent = tone === 'positive' ? colors.success : tone === 'negative' ? colors.danger : colors.mutedForeground;

  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
      {!!detail && <Text style={styles.metricDetail}>{detail}</Text>}
    </View>
  );
};

const TransactionCard = ({ transaction }) => {
  const isBuy = transaction.type === 'BUY';
  const accent = isBuy ? colors.success : colors.danger;
  const Icon = isBuy ? ArrowDownLeft : ArrowUpRight;

  return (
    <View style={styles.transactionCard}>
      <View style={[styles.transactionIcon, { borderColor: `${accent}59`, backgroundColor: `${accent}1F` }]}>
        <Icon color={accent} size={16} strokeWidth={2} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{isBuy ? 'Compra' : 'Venda'} de {transaction.ticker}</Text>
        <Text style={styles.transactionMeta}>
          {transaction.quantity} cotas | {formatCurrency(transaction.price)} por ativo
        </Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionValue}>{formatCurrency(transaction.quantity * transaction.price)}</Text>
        <View style={styles.transactionDateRow}>
          <CalendarDays color={colors.mutedForeground} size={11} strokeWidth={1.8} />
          <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
        </View>
      </View>
    </View>
  );
};

const DetailRow = ({ label, value, tone = 'neutral' }) => {
  const valueColor = tone === 'positive' ? colors.success : tone === 'negative' ? colors.danger : colors.foreground;

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
};

const AssetDetail = ({ asset, transactions, onBack }) => {
  const profit = asset.currentValue - asset.totalCost;
  const profitTone = profit >= 0 ? 'positive' : 'negative';
  const assetTransactions = transactions.filter((transaction) => transaction.ticker === asset.ticker);

  return (
    <ScreenContainer scroll>
      <Pressable onPress={onBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <ArrowLeft color={colors.foreground} size={17} strokeWidth={2} />
        <Text style={styles.backButtonText}>Voltar</Text>
      </Pressable>

      <Header title={asset.ticker} subtitle="Detalhes da posição e preço médio" />

      <LinearGradient colors={['#2D2D2D', '#232323']} style={styles.totalCard}>
        <Text style={styles.totalLabel}>Valor atual</Text>
        <Text style={styles.totalValue}>{formatCurrency(asset.currentValue)}</Text>
        <View style={styles.totalMetaRow}>
          <Text style={styles.totalMeta}>{asset.quantity} cotas em carteira</Text>
          <View style={[styles.returnBadge, { borderColor: `${profit >= 0 ? colors.success : colors.danger}59`, backgroundColor: `${profit >= 0 ? colors.success : colors.danger}1F` }]}>
            <Text style={[styles.returnBadgeText, { color: profit >= 0 ? colors.success : colors.danger }]}>
              {formatPercent(asset.returnPercent)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <SectionLabel>Preço médio detalhado</SectionLabel>
      <View style={styles.detailCard}>
        <DetailRow label="Preço médio atual" value={formatCurrency(asset.averagePrice)} />
        <DetailRow label="Preço médio das compras" value={formatCurrency(asset.averageBuyPrice)} />
        <DetailRow label="Preço atual" value={formatCurrency(asset.currentPrice)} />
        <DetailRow label="Custo remanescente" value={formatCurrency(asset.totalCost)} />
        <DetailRow label="Resultado não realizado" value={formatCurrency(profit)} tone={profitTone} />
        <DetailRow label="Resultado realizado em vendas" value={formatCurrency(asset.realizedResult)} tone={asset.realizedResult >= 0 ? 'positive' : 'negative'} />
        <DetailRow label="Compras acumuladas" value={`${asset.buyQuantity} cotas | ${formatCurrency(asset.buyTotal)}`} />
        <DetailRow label="Vendas acumuladas" value={`${asset.sellQuantity} cotas | ${formatCurrency(asset.sellTotal)}`} />
        <DetailRow label="Operações registradas" value={String(asset.transactionCount)} />
      </View>

      <SectionLabel style={styles.nextSection}>Histórico do ativo</SectionLabel>
      {assetTransactions.length ? (
        assetTransactions.map((transaction) => <TransactionCard key={transaction.id} transaction={transaction} />)
      ) : (
        <EmptyState title="Sem histórico" description="Nenhuma transação encontrada para este ativo." />
      )}
    </ScreenContainer>
  );
};

export const HomeScreen = ({ currentUser, onSignOut }) => {
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalValue: 0,
    totalCost: 0,
    totalReturn: 0,
    totalProfit: 0,
    positionsCount: 0,
    monthlyMovement: 0,
    bestAsset: null,
    worstAsset: null,
  });
  const [selectedTicker, setSelectedTicker] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [positions, storedTransactions] = await Promise.all([
        getCurrentPositions(currentUser.id),
        getTransactions(currentUser.id),
      ]);
      const quotes = await fetchQuotes(positions.map((position) => position.ticker));
      const sortedTransactions = [...storedTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));

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
      const totalProfit = totalValue - totalCost;
      const totalReturn = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
      const bestAsset = enrichedAssets.length
        ? [...enrichedAssets].sort((a, b) => b.returnPercent - a.returnPercent)[0]
        : null;
      const worstAsset = enrichedAssets.length
        ? [...enrichedAssets].sort((a, b) => a.returnPercent - b.returnPercent)[0]
        : null;
      const now = new Date();
      const monthlyMovement = storedTransactions.reduce((sum, transaction) => {
        const transactionDate = new Date(transaction.date);
        const isCurrentMonth = transactionDate.getMonth() === now.getMonth()
          && transactionDate.getFullYear() === now.getFullYear();

        return isCurrentMonth ? sum + transaction.quantity * transaction.price : sum;
      }, 0);

      setAssets(enrichedAssets);
      setTransactions(sortedTransactions);
      setSummary({
        totalValue,
        totalCost,
        totalReturn,
        totalProfit,
        positionsCount: enrichedAssets.length,
        monthlyMovement,
        bestAsset,
        worstAsset,
      });
    } catch (loadError) {
      setError(loadError.message || 'Não foi possível carregar a carteira.');
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  useFocusEffect(
    useCallback(() => {
      loadPortfolio();
    }, [loadPortfolio]),
  );

  const selectedAsset = assets.find((asset) => asset.ticker === selectedTicker);

  if (selectedTicker && selectedAsset) {
    return (
      <AssetDetail
        asset={selectedAsset}
        transactions={transactions}
        onBack={() => setSelectedTicker('')}
      />
    );
  }

  const isPositive = summary.totalReturn >= 0;
  const summaryAccent = isPositive ? colors.success : colors.danger;
  const profitTone = summary.totalProfit >= 0 ? 'positive' : 'negative';

  return (
    <ScreenContainer scroll>
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

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.foreground} />
          <Text style={styles.loaderText}>Atualizando dashboard</Text>
        </View>
      ) : error ? (
        <EmptyState title="Falha ao carregar" description={error} />
      ) : (
        <>
          <SectionLabel>Resumo da carteira</SectionLabel>
          <View style={styles.metricGrid}>
            <MetricCard label="Resultado" value={formatCurrency(summary.totalProfit)} detail="Não realizado" tone={profitTone} />
            <MetricCard label="Ativos" value={String(summary.positionsCount)} detail="Posições abertas" />
            <MetricCard
              label="Melhor ativo"
              value={summary.bestAsset ? summary.bestAsset.ticker : '--'}
              detail={summary.bestAsset ? formatPercent(summary.bestAsset.returnPercent) : 'Sem posição'}
              tone={!summary.bestAsset ? 'neutral' : summary.bestAsset.returnPercent >= 0 ? 'positive' : 'negative'}
            />
            <MetricCard
              label="Pior ativo"
              value={summary.worstAsset ? summary.worstAsset.ticker : '--'}
              detail={summary.worstAsset ? formatPercent(summary.worstAsset.returnPercent) : 'Sem posição'}
              tone={!summary.worstAsset ? 'neutral' : summary.worstAsset.returnPercent >= 0 ? 'positive' : 'negative'}
            />
            <MetricCard label="Movimento mês" value={formatCurrency(summary.monthlyMovement)} detail="Compras e vendas" />
            <MetricCard label="Rentabilidade" value={formatPercent(summary.totalReturn)} detail="Total da carteira" tone={isPositive ? 'positive' : 'negative'} />
          </View>

          <SectionLabel style={styles.nextSection}>Posições atuais</SectionLabel>
          {assets.length ? (
            assets.map((asset) => (
              <AssetCard key={asset.ticker} asset={asset} onPress={() => setSelectedTicker(asset.ticker)} />
            ))
          ) : (
            <EmptyState
              title="Carteira vazia"
              description="Registre uma compra na aba Operar para iniciar o acompanhamento dos ativos."
            />
          )}

          <SectionLabel style={styles.nextSection}>Histórico de transações</SectionLabel>
          {transactions.length ? (
            transactions.map((transaction) => <TransactionCard key={transaction.id} transaction={transaction} />)
          ) : (
            <EmptyState
              title="Sem transações"
              description="Compras e vendas registradas aparecerão aqui em ordem cronológica."
            />
          )}
        </>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
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
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 98,
    padding: 14,
    width: '48%',
  },
  metricLabel: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.foreground,
    fontFamily: fonts.displaySemiBold,
    fontSize: 20,
    fontVariant: ['tabular-nums'],
    marginTop: 10,
  },
  metricDetail: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    marginTop: 6,
  },
  nextSection: {
    marginTop: 24,
  },
  transactionCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 14,
  },
  transactionIcon: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    marginRight: 12,
    width: 36,
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },
  transactionTitle: {
    color: colors.foreground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  transactionMeta: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    marginTop: 5,
  },
  transactionRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  transactionValue: {
    color: colors.foreground,
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  transactionDateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  transactionDate: {
    color: colors.mutedForeground,
    fontFamily: fonts.monoMedium,
    fontSize: 10,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: colors.foreground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  detailCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  detailLabel: {
    color: colors.mutedForeground,
    flex: 1,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    paddingRight: 12,
  },
  detailValue: {
    color: colors.foreground,
    flexShrink: 0,
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
});
