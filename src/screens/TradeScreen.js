import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react-native';
import { Header } from '../components/Header';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionLabel } from '../components/SectionLabel';
import { addTransaction } from '../database/database';
import { fetchQuote } from '../services/marketApi';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { formatCurrency, normalizeTicker } from '../utils/formatters';

export const TradeScreen = ({ currentUser }) => {
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [paidPrice, setPaidPrice] = useState('');
  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const parsePriceInput = (value) => Number.parseFloat(value.replace(',', '.'));

  const handleSearch = async () => {
    const cleanTicker = normalizeTicker(ticker);

    setError('');
    setMessage('');
    setQuote(null);

    if (!cleanTicker) {
      setError('Informe um ticker válido.');
      return;
    }

    setLoadingQuote(true);

    try {
      const nextQuote = await fetchQuote(cleanTicker);
      setTicker(nextQuote.ticker);
      setQuote(nextQuote);
      setPaidPrice(String(nextQuote.price.toFixed(2)).replace('.', ','));
      setMessage(nextQuote.source === 'brapi' ? 'Cotação validada pela Brapi.' : 'Cotação mock usada para apresentação.');
    } catch (quoteError) {
      setError(quoteError.message || 'Não foi possível validar o ticker.');
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleTransaction = async (type) => {
    const cleanTicker = normalizeTicker(ticker);
    const cleanQuantity = Number.parseInt(quantity, 10);
    const cleanPaidPrice = parsePriceInput(paidPrice);

    setError('');
    setMessage('');

    if (!quote || quote.ticker !== cleanTicker) {
      setError('Busque a cotação antes de confirmar a operação.');
      return;
    }

    if (!Number.isInteger(cleanQuantity) || cleanQuantity <= 0) {
      setError('Informe uma quantidade inteira maior que zero.');
      return;
    }

    if (!Number.isFinite(cleanPaidPrice) || cleanPaidPrice <= 0) {
      setError('Informe o preço pago por ativo.');
      return;
    }

    setSubmitting(true);

    try {
      await addTransaction({
        userId: currentUser.id,
        type,
        ticker: cleanTicker,
        quantity: cleanQuantity,
        price: cleanPaidPrice,
        date: new Date().toISOString(),
      });

      setMessage(type === 'BUY' ? 'Compra registrada.' : 'Venda registrada.');
      setTicker('');
      setQuantity('');
      setPaidPrice('');
      setQuote(null);
    } catch (transactionError) {
      setError(transactionError.message || 'Não foi possível registrar a transação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Header title="Operar" subtitle="Nova transação com preço de mercado" />

        <View style={styles.formCard}>
          <SectionLabel>Ticker</SectionLabel>
          <TextInput
            value={ticker}
            onChangeText={(value) => {
              setTicker(normalizeTicker(value));
              setQuote(null);
              setPaidPrice('');
            }}
            placeholder="PETR4"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.input}
          />

          <SectionLabel style={styles.fieldLabel}>Quantidade</SectionLabel>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            placeholder="100"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
            style={styles.input}
          />

          <SectionLabel style={styles.fieldLabel}>Preço pago por ativo</SectionLabel>
          <TextInput
            value={paidPrice}
            onChangeText={setPaidPrice}
            placeholder="0,00"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <Text style={styles.helperText}>
            A cotação atual preenche este campo como sugestão, mas você pode informar o valor realmente pago.
          </Text>

          <Pressable
            onPress={handleSearch}
            disabled={loadingQuote || submitting}
            style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}
          >
            {loadingQuote ? (
              <ActivityIndicator color={colors.foreground} />
            ) : (
              <>
                <Search color={colors.foreground} size={16} strokeWidth={2} />
                <Text style={styles.searchButtonText}>Buscar cotação</Text>
              </>
            )}
          </Pressable>

          {quote && (
            <View style={styles.quoteCard}>
              <View>
                <Text style={styles.quoteTicker}>{quote.ticker}</Text>
                <Text style={styles.quoteName}>{quote.shortName}</Text>
              </View>
              <View style={styles.quoteRight}>
                <Text style={styles.quotePrice}>{formatCurrency(quote.price)}</Text>
                <Text style={styles.quoteCaption}>Cotação atual</Text>
                <Text style={styles.quoteSource}>{quote.source === 'brapi' ? 'Brapi' : 'Mock'}</Text>
              </View>
            </View>
          )}

          {!!error && <Text style={styles.errorText}>{error}</Text>}
          {!!message && <Text style={styles.messageText}>{message}</Text>}

          <View style={styles.actionGrid}>
            <Pressable
              onPress={() => handleTransaction('BUY')}
              disabled={submitting}
              style={({ pressed }) => [
                styles.actionButton,
                styles.buyButton,
                pressed && styles.pressed,
                submitting && styles.disabled,
              ]}
            >
              <ArrowDownLeft color={colors.success} size={16} strokeWidth={2} />
              <Text style={[styles.actionButtonText, { color: colors.success }]}>Comprar</Text>
            </Pressable>

            <Pressable
              onPress={() => handleTransaction('SELL')}
              disabled={submitting}
              style={({ pressed }) => [
                styles.actionButton,
                styles.sellButton,
                pressed && styles.pressed,
                submitting && styles.disabled,
              ]}
            >
              <ArrowUpRight color={colors.danger} size={16} strokeWidth={2} />
              <Text style={[styles.actionButtonText, { color: colors.danger }]}>Vender</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  fieldLabel: {
    marginTop: 18,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.foreground,
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  helperText: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  searchButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 48,
  },
  searchButtonText: {
    color: colors.foreground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  quoteCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 14,
  },
  quoteTicker: {
    color: colors.foreground,
    fontFamily: fonts.monoMedium,
    fontSize: 17,
  },
  quoteName: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    marginTop: 4,
    maxWidth: 160,
  },
  quoteRight: {
    alignItems: 'flex-end',
  },
  quotePrice: {
    color: colors.foreground,
    fontFamily: fonts.displaySemiBold,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
  },
  quoteCaption: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 10,
    marginTop: 4,
  },
  quoteSource: {
    color: colors.mutedForeground,
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },
  messageText: {
    color: colors.success,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 50,
  },
  buyButton: {
    backgroundColor: `${colors.success}1F`,
    borderColor: `${colors.success}59`,
  },
  sellButton: {
    backgroundColor: `${colors.danger}1F`,
    borderColor: `${colors.danger}59`,
  },
  actionButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.55,
  },
});
