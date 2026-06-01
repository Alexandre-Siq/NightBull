import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CalendarDays, ExternalLink } from 'lucide-react-native';
import { EmptyState } from '../components/EmptyState';
import { Header } from '../components/Header';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionLabel } from '../components/SectionLabel';
import { getPortfolioTickers } from '../database/database';
import { fetchFinancialNews } from '../services/marketApi';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { formatDate } from '../utils/formatters';

const NewsCard = ({ item }) => {
  const openSource = async () => {
    if (item.url) {
      await Linking.openURL(item.url);
    }
  };

  return (
    <Pressable onPress={openSource} style={({ pressed }) => [styles.newsCard, pressed && styles.pressed]}>
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
      <View style={styles.sourceChip}>
        <ExternalLink color={colors.mutedForeground} size={11} strokeWidth={1.8} />
        <Text style={styles.sourceChipText}>Abrir fonte</Text>
      </View>
    </View>
  </Pressable>
  );
};

export const NewsScreen = ({ currentUser }) => {
  const [generalNews, setGeneralNews] = useState([]);
  const [portfolioNews, setPortfolioNews] = useState([]);
  const [trackedTickers, setTrackedTickers] = useState([]);
  const [newsScope, setNewsScope] = useState('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const tickers = await getPortfolioTickers(currentUser.id);
      const [nextGeneralNews, nextPortfolioNews] = await Promise.all([
        fetchFinancialNews([]),
        tickers.length ? fetchFinancialNews(tickers) : Promise.resolve([]),
      ]);

      setTrackedTickers(tickers);
      setGeneralNews(nextGeneralNews);
      setPortfolioNews(nextPortfolioNews);
    } catch (loadError) {
      setError(loadError.message || 'Não foi possível carregar notícias.');
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  useFocusEffect(
    useCallback(() => {
      loadNews();
    }, [loadNews]),
  );

  const currentNews = useMemo(
    () => (newsScope === 'portfolio' ? portfolioNews : generalNews),
    [generalNews, newsScope, portfolioNews],
  );

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <Header
        title="Notícias"
        subtitle={newsScope === 'portfolio' && trackedTickers.length ? `Meus ativos: ${trackedTickers.join(', ')}` : 'Resumo financeiro do mercado'}
      />

      <SectionLabel>Atualizações do mercado</SectionLabel>
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setNewsScope('general')}
          style={({ pressed }) => [
            styles.filterButton,
            newsScope === 'general' && styles.filterButtonActive,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.filterText, newsScope === 'general' && styles.filterTextActive]}>Gerais</Text>
        </Pressable>
        <Pressable
          onPress={() => setNewsScope('portfolio')}
          style={({ pressed }) => [
            styles.filterButton,
            newsScope === 'portfolio' && styles.filterButtonActive,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.filterText, newsScope === 'portfolio' && styles.filterTextActive]}>Meus ativos</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.foreground} />
          <Text style={styles.loaderText}>Carregando notícias</Text>
        </View>
      ) : error ? (
        <EmptyState title="Falha nas notícias" description={error} />
      ) : (
        <FlatList
          data={currentNews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NewsCard item={item} />}
          ListEmptyComponent={
            <EmptyState
              title="Nenhuma notícia"
              description={newsScope === 'portfolio' ? 'Não há notícias disponíveis para os tickers da carteira.' : 'Não há notícias gerais disponíveis.'}
            />
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
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  filterButtonActive: {
    backgroundColor: `${colors.success}1F`,
    borderColor: `${colors.success}59`,
  },
  filterText: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
  filterTextActive: {
    color: colors.success,
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
  pressed: {
    transform: [{ scale: 0.99 }],
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
  sourceChip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  sourceChipText: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
  },
});
