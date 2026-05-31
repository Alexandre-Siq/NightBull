import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Database, LineChart, Newspaper, Route, ShieldCheck, Smartphone } from 'lucide-react-native';
import { Header } from '../components/Header';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionLabel } from '../components/SectionLabel';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const stackItems = [
  { icon: Smartphone, title: 'React Native + Expo', description: 'Aplicativo mobile multiplataforma com execução em Android e Web.' },
  { icon: Route, title: 'React Navigation', description: 'Navegação por abas com fluxo simples para apresentação.' },
  { icon: Database, title: 'expo-sqlite', description: 'Persistência local de usuários, compras e vendas.' },
  { icon: LineChart, title: 'Brapi + gráficos', description: 'Cotação de ativos, relatórios SVG e comparação de carteira.' },
  { icon: Newspaper, title: 'Notícias filtradas', description: 'Cards mockados e clicáveis, com filtro geral ou por ativos da carteira.' },
  { icon: ShieldCheck, title: 'Validação local', description: 'Tickers aceitos por Brapi ou lista local conhecida da B3.' },
];

const presentationSteps = [
  'Entrar com a carteira demo.',
  'Registrar compra ou venda em Operar.',
  'Conferir patrimônio e histórico na Carteira.',
  'Abrir detalhes de um ativo tocando no card.',
  'Analisar distribuição em Relatórios.',
  'Filtrar Notícias por Meus ativos.',
];

const InfoCard = ({ item }) => {
  const Icon = item.icon;

  return (
    <View style={styles.infoCard}>
      <View style={styles.iconBox}>
        <Icon color={colors.foreground} size={20} strokeWidth={1.8} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoTitle}>{item.title}</Text>
        <Text style={styles.infoDescription}>{item.description}</Text>
      </View>
    </View>
  );
};

export const AboutScreen = () => (
  <ScreenContainer scroll>
    <Header title="Sobre" subtitle="Resumo técnico para apresentação acadêmica" />

    <View style={styles.heroCard}>
      <Text style={styles.heroEyebrow}>NightBull</Text>
      <Text style={styles.heroTitle}>Carteira de investimentos local</Text>
      <Text style={styles.heroText}>
        Projeto acadêmico em dark theme para registrar compras e vendas, calcular patrimônio,
        acompanhar preço médio, visualizar relatórios e consultar notícias financeiras.
      </Text>
    </View>

    <SectionLabel style={styles.nextSection}>Tecnologias e módulos</SectionLabel>
    {stackItems.map((item) => <InfoCard key={item.title} item={item} />)}

    <SectionLabel style={styles.nextSection}>Roteiro de apresentação</SectionLabel>
    <View style={styles.stepsCard}>
      {presentationSteps.map((step, index) => (
        <View key={step} style={styles.stepRow}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{String(index + 1).padStart(2, '0')}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
          <CheckCircle2 color={colors.success} size={16} strokeWidth={1.8} />
        </View>
      ))}
    </View>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  heroEyebrow: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.foreground,
    fontFamily: fonts.displayBold,
    fontSize: 24,
    letterSpacing: -0.4,
    marginTop: 10,
  },
  heroText: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 10,
  },
  nextSection: {
    marginTop: 24,
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 14,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  infoCopy: {
    flex: 1,
  },
  infoTitle: {
    color: colors.foreground,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  infoDescription: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  stepsCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
  },
  stepRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 9,
  },
  stepNumber: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    height: 30,
    justifyContent: 'center',
    marginRight: 10,
    width: 34,
  },
  stepNumberText: {
    color: colors.foreground,
    fontFamily: fonts.monoMedium,
    fontSize: 11,
  },
  stepText: {
    color: colors.foreground,
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
});
