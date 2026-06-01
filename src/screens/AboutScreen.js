import { StyleSheet, Text, View } from 'react-native';
import {
  BarChart3,
  Database,
  LineChart,
  Newspaper,
  Route,
  ShieldCheck,
  Smartphone,
  Target,
} from 'lucide-react-native';
import { Header } from '../components/Header';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionLabel } from '../components/SectionLabel';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const problemItems = [
  'No acompanhamento manual, ações, FIIs e ETFs acabam ficando espalhados entre planilhas, notas e consultas em sites diferentes.',
  'Com isso, informações simples como preço médio, custo total e distribuição da carteira deixam de ficar claras no dia a dia.',
  'Para a apresentação, também era importante que o app continuasse demonstrável mesmo se alguma API externa falhasse.',
];

const motivationItems = [
  'A proposta foi montar um aplicativo simples de explicar, mas sem ficar apenas em telas estáticas.',
  'O fluxo escolhido passa por cadastro, operações, banco local, cotações, relatórios e notícias no mesmo app.',
  'A interface segue um visual escuro e mais sóbrio para combinar com a ideia de terminal financeiro.',
];

const technicalDecisions = [
  {
    icon: Smartphone,
    title: 'React Native com Expo',
    description: 'Expo entrou no projeto para facilitar testes em Android e Web sem precisar configurar um projeto nativo completo.',
  },
  {
    icon: Route,
    title: 'Navegação por abas',
    description: 'As abas foram separadas de acordo com o uso: acompanhar carteira, registrar operação, analisar relatórios, ler notícias e explicar o projeto.',
  },
  {
    icon: Database,
    title: 'SQLite local',
    description: 'O expo-sqlite guarda usuários e transações no dispositivo. Isso deixa claro o uso de persistência local e evita depender de servidor.',
  },
  {
    icon: LineChart,
    title: 'Cotação via Brapi',
    description: 'A Brapi é usada para buscar cotações. Para não travar a demonstração, alguns ativos conhecidos têm fallback local.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios visuais',
    description: 'Os relatórios resumem custo, valor atual e alocação por classe. A intenção é responder rápido onde o dinheiro está concentrado.',
  },
  {
    icon: Newspaper,
    title: 'Notícias filtradas',
    description: 'As notícias foram divididas entre visão geral do mercado e assuntos ligados à carteira. Os dados são controlados para evitar surpresa na hora da apresentação.',
  },
  {
    icon: ShieldCheck,
    title: 'Validações de entrada',
    description: 'A entrada de ticker foi limitada a ativos conhecidos, e o preço pago pode ser ajustado para refletir a operação real do usuário.',
  },
];

const featureItems = [
  'Cadastro e login salvos localmente.',
  'Compra e venda com cotação sugerida e preço pago editável.',
  'Cálculo de quantidade atual, custo total e preço médio.',
  'Dashboard com patrimônio, rentabilidade e destaques da carteira.',
  'Histórico de transações e tela de detalhe por ativo.',
  'Relatórios por ativo e por classe: ações, FIIs, ETFs e outros.',
  'Notícias separadas entre mercado geral e ativos da carteira.',
];

const BulletList = ({ items }) => (
  <View style={styles.bulletCard}>
    {items.map((item) => (
      <View key={item} style={styles.bulletRow}>
        <View style={styles.bulletDot} />
        <Text style={styles.bulletText}>{item}</Text>
      </View>
    ))}
  </View>
);

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
    <Header title="Sobre" subtitle="Resumo do projeto e das decisões" />

    <View style={styles.heroCard}>
      <Text style={styles.heroEyebrow}>NightBull</Text>
      <Text style={styles.heroTitle}>Carteira de investimentos em React Native</Text>
      <Text style={styles.heroText}>
        Este aplicativo foi desenvolvido como uma proposta acadêmica para acompanhar uma carteira de investimentos de forma simples,
        local e visual. A intenção foi entregar algo funcional, com cara de produto, mas ainda fácil de explicar tecnicamente.
      </Text>
    </View>

    <SectionLabel style={styles.nextSection}>Problema que resolvo</SectionLabel>
    <BulletList items={problemItems} />

    <SectionLabel style={styles.nextSection}>Motivação</SectionLabel>
    <BulletList items={motivationItems} />

    <SectionLabel style={styles.nextSection}>Solução proposta</SectionLabel>
    <View style={styles.statementCard}>
      <View style={styles.statementIcon}>
        <Target color={colors.success} size={22} strokeWidth={2} />
      </View>
      <Text style={styles.statementTitle}>Centralizar o acompanhamento da carteira</Text>
      <Text style={styles.statementText}>
        A solução centraliza o registro de operações, a persistência local, a consulta de cotações,
        o cálculo de preço médio e a visualização da composição da carteira. O foco está em reduzir etapas manuais
        e destacar as informações que realmente ajudam na leitura da posição do investidor.
      </Text>
    </View>

    <SectionLabel style={styles.nextSection}>Decisões técnicas</SectionLabel>
    {technicalDecisions.map((item) => <InfoCard key={item.title} item={item} />)}

    <SectionLabel style={styles.nextSection}>Funcionalidades entregues</SectionLabel>
    <BulletList items={featureItems} />
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
    fontSize: 25,
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
  bulletCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  bulletDot: {
    backgroundColor: colors.success,
    borderRadius: 4,
    height: 8,
    marginRight: 10,
    marginTop: 6,
    width: 8,
  },
  bulletText: {
    color: colors.mutedForeground,
    flex: 1,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 20,
  },
  statementCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  statementIcon: {
    alignItems: 'center',
    backgroundColor: `${colors.success}1F`,
    borderColor: `${colors.success}59`,
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    marginBottom: 14,
    width: 44,
  },
  statementTitle: {
    color: colors.foreground,
    fontFamily: fonts.displaySemiBold,
    fontSize: 20,
  },
  statementText: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 10,
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
});
