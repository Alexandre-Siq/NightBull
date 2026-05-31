import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { EmptyState } from '../components/EmptyState';
import { Header } from '../components/Header';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionLabel } from '../components/SectionLabel';
import { getCurrentPositions } from '../database/database';
import { fetchQuotes } from '../services/marketApi';
import { assetPalette, colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { assetTypeMeta, assetTypeOrder, classifyAsset } from '../utils/assetClassifier';
import { formatCurrency, formatPercent } from '../utils/formatters';

const chartConfig = {
  backgroundGradientFrom: colors.card,
  backgroundGradientTo: colors.card,
  color: (opacity = 1) => `rgba(237, 237, 237, ${opacity})`,
  decimalPlaces: 0,
  labelColor: (opacity = 1) => `rgba(166, 166, 166, ${opacity})`,
  propsForBackgroundLines: {
    stroke: colors.border,
    strokeDasharray: '4 8',
  },
  propsForLabels: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
  },
  barPercentage: 0.5,
};

const SummaryCard = ({ label, value, detail, tone = 'neutral' }) => {
  const color = tone === 'positive' ? colors.success : tone === 'negative' ? colors.danger : colors.foreground;

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      {!!detail && <Text style={styles.summaryDetail}>{detail}</Text>}
    </View>
  );
};

const TypeAllocationCard = ({ item, totalValue }) => {
  const percent = totalValue > 0 ? (item.value / totalValue) * 100 : 0;

  return (
    <View style={styles.typeCard}>
      <View style={styles.typeHeader}>
        <View style={[styles.typeDot, { backgroundColor: item.color }]} />
        <Text style={styles.typeLabel}>{item.label}</Text>
      </View>
      <Text style={styles.typeValue}>{formatCurrency(item.value)}</Text>
      <Text style={styles.typeMeta}>{formatPercent(percent)} | {item.count} ativo{item.count === 1 ? '' : 's'}</Text>
    </View>
  );
};

export const ReportsScreen = ({ currentUser }) => {
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - 40, 280);
  const [report, setReport] = useState({ assets: [], totalCost: 0, totalValue: 0, typeAllocations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const positions = await getCurrentPositions(currentUser.id);
      const quotes = await fetchQuotes(positions.map((position) => position.ticker));
      const assets = positions.map((position, index) => {
        const currentPrice = quotes[position.ticker]?.price || position.averagePrice;
        const currentValue = currentPrice * position.quantity;
        const type = classifyAsset(position.ticker);

        return {
          ...position,
          currentPrice,
          currentValue,
          type,
          color: assetPalette[index % assetPalette.length],
        };
      });

      const totalCost = assets.reduce((sum, asset) => sum + asset.totalCost, 0);
      const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
      const typeMap = assets.reduce((accumulator, asset) => {
        const current = accumulator[asset.type.key] || {
          key: asset.type.key,
          label: asset.type.label,
          color: asset.type.color,
          value: 0,
          cost: 0,
          count: 0,
        };

        current.value += asset.currentValue;
        current.cost += asset.totalCost;
        current.count += 1;
        accumulator[asset.type.key] = current;
        return accumulator;
      }, {});
      const typeAllocations = assetTypeOrder
        .map((key) => typeMap[key] || {
          key,
          label: assetTypeMeta[key].label,
          color: assetTypeMeta[key].color,
          value: 0,
          cost: 0,
          count: 0,
        })
        .filter((item) => item.value > 0);

      setReport({ assets, totalCost, totalValue, typeAllocations });
    } catch (loadError) {
      setError(loadError.message || 'Não foi possível gerar os relatórios.');
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  useFocusEffect(
    useCallback(() => {
      loadReport();
    }, [loadReport]),
  );

  const result = report.totalValue - report.totalCost;
  const profitability = report.totalCost > 0 ? (result / report.totalCost) * 100 : 0;
  const pieData = report.assets.map((asset) => ({
    name: asset.ticker,
    population: Number(asset.currentValue.toFixed(2)),
    color: asset.color,
    legendFontColor: colors.mutedForeground,
    legendFontSize: 11,
  }));
  const typePieData = report.typeAllocations.map((item) => ({
    name: item.label,
    population: Number(item.value.toFixed(2)),
    color: item.color,
    legendFontColor: colors.mutedForeground,
    legendFontSize: 11,
  }));
  const barData = {
    labels: ['Custo', 'Atual'],
    datasets: [
      {
        data: [Number(report.totalCost.toFixed(2)), Number(report.totalValue.toFixed(2))],
        colors: [() => colors.danger, () => colors.success],
      },
    ],
  };

  return (
    <ScreenContainer scroll>
      <Header title="Relatórios" subtitle="Distribuição, classes e valor de mercado" />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.foreground} />
          <Text style={styles.loaderText}>Calculando distribuição</Text>
        </View>
      ) : error ? (
        <EmptyState title="Falha nos relatórios" description={error} />
      ) : !report.assets.length ? (
        <EmptyState
          title="Sem dados para relatório"
          description="A carteira precisa ter ao menos uma posição comprada para montar os gráficos."
        />
      ) : (
        <>
          <SectionLabel>Resumo consolidado</SectionLabel>
          <View style={styles.summaryGrid}>
            <SummaryCard label="Investido" value={formatCurrency(report.totalCost)} detail="Custo remanescente" />
            <SummaryCard label="Atual" value={formatCurrency(report.totalValue)} detail="Valor de mercado" />
            <SummaryCard
              label="Resultado"
              value={formatCurrency(result)}
              detail={formatPercent(profitability)}
              tone={result >= 0 ? 'positive' : 'negative'}
            />
            <SummaryCard label="Ativos" value={String(report.assets.length)} detail="Posições abertas" />
          </View>

          <SectionLabel style={styles.nextSection}>Classificação por tipo</SectionLabel>
          <View style={styles.typeGrid}>
            {report.typeAllocations.map((item) => (
              <TypeAllocationCard key={item.key} item={item} totalValue={report.totalValue} />
            ))}
          </View>

          <View style={styles.chartCardCompact}>
            <PieChart
              data={typePieData}
              width={chartWidth - 24}
              height={190}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="2"
              absolute
            />
          </View>

          <SectionLabel style={styles.nextSection}>Distribuição por ativo</SectionLabel>
          <View style={styles.chartCard}>
            <PieChart
              data={pieData}
              width={chartWidth - 24}
              height={210}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="2"
              absolute
            />
          </View>

          <SectionLabel style={styles.nextSection}>Custo vs. valor atual</SectionLabel>
          <View style={styles.chartCard}>
            <BarChart
              data={barData}
              width={chartWidth - 24}
              height={220}
              chartConfig={chartConfig}
              fromZero
              showValuesOnTopOfBars
              withCustomBarColorFromData
              flatColor
              yAxisLabel="R$"
              yAxisSuffix=""
              style={styles.barChart}
            />
            <View style={styles.reportFooter}>
              <Text style={styles.footerText}>Custo {formatCurrency(report.totalCost)}</Text>
              <Text style={styles.footerText}>Atual {formatCurrency(report.totalValue)}</Text>
            </View>
          </View>
        </>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 94,
    padding: 14,
    width: '48%',
  },
  summaryLabel: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: colors.foreground,
    fontFamily: fonts.displaySemiBold,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    marginTop: 10,
  },
  summaryDetail: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    marginTop: 6,
  },
  typeGrid: {
    gap: 8,
  },
  typeCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  typeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  typeDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  typeLabel: {
    color: colors.foreground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  typeValue: {
    color: colors.foreground,
    fontFamily: fonts.displaySemiBold,
    fontSize: 19,
    fontVariant: ['tabular-nums'],
    marginTop: 10,
  },
  typeMeta: {
    color: colors.mutedForeground,
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    marginTop: 6,
  },
  chartCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  chartCardCompact: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 10,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  nextSection: {
    marginTop: 24,
  },
  barChart: {
    borderRadius: 16,
    marginLeft: -12,
  },
  reportFooter: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: '100%',
  },
  footerText: {
    color: colors.mutedForeground,
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
});
