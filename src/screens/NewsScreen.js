import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CalendarDays } from 'lucide-react-native';
import { EmptyState } from '../components/EmptyState';
import { Header } from '../components/Header';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionLabel } from '../components/SectionLabel';
import { getPortfolioTickers } from '../database/database';
import { fetchFinancialNews } from '../services/marketApi';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { formatDate } from '../utils/formatters';

const NewsCard = ({ item }) => (
  <View style={styles.newsCard}>
    <View style={styles.newsMetaRow}>
      <Text style={styles.source}>{item.source}</Text>
      <View style={styles.dateRow}>
        <CalendarDays color={colors.mutedForeground} size={12} strokeWidth={1.8} />
        <Text style={styles.date}>{formatDate(item.date)}</Text>
      </View>
    </View>
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.summary}>{item.summary}</Text>
    <View style={styles.tickerRow}>
      {item.tickers.slice(0, 4).map((ticker) => (
        <View key={ticker} style={styles.tickerChip}>
          <Text style={styles.tickerChipText}>{ticker}</Text>
        </View>
      ))}
    </View>
  </View>
);

export const NewsScreen = () => {
  const [news, setNews] = useState([]);
  const [trackedTickers, setTrackedTickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const tickers = await getPortfolioTickers();
      const nextNews = await fetchFinancialNews(tickers);

      setTrackedTickers(tickers);
      setNews(nextNews);
    } catch (loadError) {
      setError(loadError.message || 'Nao foi possivel carregar noticias.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNews();
    }, [loadNews]),
  );

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <Header
        title="Noticias"
        subtitle={trackedTickers.length ? `Filtro: ${trackedTickers.join(', ')}` : 'Resumo financeiro do mercado'}
      />

      <SectionLabel>Atualizacoes do mercado</SectionLabel>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.foreground} />
          <Text style={styles.loaderText}>Carregando noticias</Text>
        </View>
      ) : error ? (
        <EmptyState title="Falha nas noticias" description={error} />
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NewsCard item={item} />}
          ListEmptyComponent={
            <EmptyState title="Nenhuma noticia" description="Nao ha noticias disponiveis para os tickers da carteira." />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
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
  newsCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    padding: 16,
  },
  newsMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  source: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.9,
    textTransform: 'uppercase',
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  date: {
    color: colors.mutedForeground,
    fontFamily: fonts.monoMedium,
    fontSize: 10,
  },
  title: {
    color: colors.foreground,
    fontFamily: fonts.displaySemiBold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 23,
  },
  summary: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  tickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  tickerChip: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  tickerChipText: {
    color: colors.foreground,
    fontFamily: fonts.monoMedium,
    fontSize: 10,
  },
});
