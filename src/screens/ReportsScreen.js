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
import { formatCurrency } from '../utils/formatters';

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
  barPercentage: 0.62,
};

export const ReportsScreen = () => {
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - 40, 280);
  const [report, setReport] = useState({ assets: [], totalCost: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const positions = await getCurrentPositions();
      const quotes = await fetchQuotes(positions.map((position) => position.ticker));
      const assets = positions.map((position, index) => {
        const currentPrice = quotes[position.ticker]?.price || position.averagePrice;
        const currentValue = currentPrice * position.quantity;

        return {
          ...position,
          currentPrice,
          currentValue,
          color: assetPalette[index % assetPalette.length],
        };
      });

      const totalCost = assets.reduce((sum, asset) => sum + asset.totalCost, 0);
      const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);

      setReport({ assets, totalCost, totalValue });
    } catch (loadError) {
      setError(loadError.message || 'Não foi possível gerar os relatórios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReport();
    }, [loadReport]),
  );

  const pieData = report.assets.map((asset) => ({
    name: asset.ticker,
    population: Number(asset.currentValue.toFixed(2)),
    color: asset.color,
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
      <Header title="Relatórios" subtitle="Distribuição e valor de mercado" />

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
          <SectionLabel>Distribuição da carteira</SectionLabel>
          <View style={styles.chartCard}>
            <PieChart
              data={pieData}
              width={chartWidth - 24}
              height={210}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute
            />
          </View>

          <SectionLabel style={styles.nextSection}>Custo vs. valor atual</SectionLabel>
          <View style={styles.chartCard}>
            <BarChart
              data={barData}
              width={chartWidth - 24}
              height={235}
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
