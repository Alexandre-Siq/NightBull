import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
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


const PIE_SIZE = 172;

const polarToCartesian = (center, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: center + radius * Math.cos(angleInRadians),
    y: center + radius * Math.sin(angleInRadians),
  };
};

const describeSlice = (startAngle, endAngle, radius, center) => {
  const start = polarToCartesian(center, radius, endAngle);
  const end = polarToCartesian(center, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${center} ${center}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
};

const PieGraphic = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.population, 0);
  const center = PIE_SIZE / 2;
  const radius = center - 2;
  let currentAngle = 0;

  if (!data.length || total <= 0) {
    return <View style={styles.piePlaceholder} />;
  }

  if (data.length === 1) {
    return (
      <Svg width={PIE_SIZE} height={PIE_SIZE} viewBox={`0 0 ${PIE_SIZE} ${PIE_SIZE}`}>
        <Circle cx={center} cy={center} r={radius} fill={data[0].color} />
      </Svg>
    );
  }

  return (
    <Svg width={PIE_SIZE} height={PIE_SIZE} viewBox={`0 0 ${PIE_SIZE} ${PIE_SIZE}`}>
      {data.map((item) => {
        const angle = (item.population / total) * 360;
        const path = describeSlice(currentAngle, currentAngle + angle, radius, center);
        currentAngle += angle;

        return <Path key={item.key ?? item.name} d={path} fill={item.color} />;
      })}
    </Svg>
  );
};

const ComparisonBars = ({ totalCost, totalValue }) => {
  const maxValue = Math.max(totalCost, totalValue, 1);
  const costHeight = Math.max((totalCost / maxValue) * 156, 18);
  const valueHeight = Math.max((totalValue / maxValue) * 156, 18);

  return (
    <View style={styles.comparisonFrame}>
      <View style={styles.barArea}>
        <View style={styles.barGroup}>
          <View style={[styles.comparisonBar, styles.costBar, { height: costHeight }]} />
          <Text style={styles.barValue}>{formatCurrency(totalCost)}</Text>
          <Text style={styles.barLabel}>Custo</Text>
        </View>
        <View style={styles.barGroup}>
          <View style={[styles.comparisonBar, styles.valueBar, { height: valueHeight }]} />
          <Text style={styles.barValue}>{formatCurrency(totalValue)}</Text>
          <Text style={styles.barLabel}>Atual</Text>
        </View>
      </View>
    </View>
  );
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


const AllocationLegend = ({ items, totalValue }) => (
  <View style={styles.legendGrid}>
    {items.map((item) => {
      const value = item.value ?? item.population;
      const label = item.label ?? item.name;
      const percent = totalValue > 0 ? (value / totalValue) * 100 : 0;

      return (
        <View key={item.key ?? label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <View style={styles.legendCopy}>
            <Text style={styles.legendLabel}>{label}</Text>
            <Text style={styles.legendMeta}>{formatPercent(percent)} | {formatCurrency(value)}</Text>
          </View>
        </View>
      );
    })}
  </View>
);

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
    key: asset.ticker,
    name: asset.ticker,
    population: Number(asset.currentValue.toFixed(2)),
    color: asset.color,
  }));
  const typePieData = report.typeAllocations.map((item) => ({
    key: item.key,
    name: item.label,
    population: Number(item.value.toFixed(2)),
    color: item.color,
  }));
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
            <PieGraphic data={typePieData} />
          </View>

          <SectionLabel style={styles.nextSection}>Distribuição por ativo</SectionLabel>
          <View style={styles.chartCard}>
            <PieGraphic data={pieData} />
            <AllocationLegend items={pieData.slice(0, 6)} totalValue={report.totalValue} />
          </View>

          <SectionLabel style={styles.nextSection}>Custo vs. valor atual</SectionLabel>
          <View style={styles.chartCard}>
            <ComparisonBars totalCost={report.totalCost} totalValue={report.totalValue} />
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
  legendGrid: {
    gap: 8,
    marginTop: 8,
    width: '100%',
  },
  legendItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  legendDot: {
    borderRadius: 5,
    height: 10,
    marginRight: 10,
    width: 10,
  },
  legendCopy: {
    flex: 1,
  },
  legendLabel: {
    color: colors.foreground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  legendMeta: {
    color: colors.mutedForeground,
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  piePlaceholder: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: PIE_SIZE / 2,
    height: PIE_SIZE,
    width: PIE_SIZE,
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
  comparisonFrame: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    width: '100%',
  },
  barArea: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    height: 230,
    justifyContent: 'space-around',
  },
  barGroup: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 112,
  },
  comparisonBar: {
    borderRadius: 8,
    width: 58,
  },
  costBar: {
    backgroundColor: colors.danger,
  },
  valueBar: {
    backgroundColor: colors.success,
  },
  barValue: {
    color: colors.foreground,
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    marginTop: 10,
  },
  barLabel: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.4,
    marginTop: 7,
    marginBottom: 14,
    textTransform: 'uppercase',
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
