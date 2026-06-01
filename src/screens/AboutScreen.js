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
  'Muitos investidores pequenos acompanham ações, FIIs e ETFs em planilhas separadas ou em aplicativos com excesso de informação.',
  'Essa separação dificulta saber rapidamente quanto foi investido, qual é o preço médio e como a carteira está distribuída.',
  'Também existe o risco de depender de conexão ou de serviços externos durante uma apresentação acadêmica.',
];

const motivationItems = [
  'O objetivo foi criar um aplicativo simples de apresentar, mas com um fluxo real de uso.',
  'A ideia foi unir cadastro, operações, persistência local, cotações, relatórios e notícias em uma única experiência.',
  'A identidade visual foi pensada para transmitir profissionalismo, com dark theme e foco em dados financeiros.',
];

const technicalDecisions = [
  {
    icon: Smartphone,
    title: 'React Native com Expo',
    description: 'Expo foi utilizado por facilitar a execução em Android e Web, tornando a demonstração mais flexível em emulador ou navegador.',
  },
  {
    icon: Route,
    title: 'Navegação por abas',
    description: 'O app foi organizado em áreas objetivas: Carteira, Operar, Relatórios, Notícias e Sobre. Cada aba representa uma parte do fluxo do investidor.',
  },
  {
    icon: Database,
    title: 'SQLite local',
    description: 'O expo-sqlite grava usuários e transações no próprio dispositivo, mantendo as operações salvas mesmo após fechar o app.',
  },
  {
    icon: LineChart,
    title: 'Cotação via Brapi',
    description: 'A cotação dos ativos é buscada pela Brapi. Quando necessário, o app usa uma lista local conhecida para evitar que a apresentação dependa totalmente da API.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios visuais',
    description: 'Os relatórios mostram patrimônio, custo, valor atual e distribuição por tipo de ativo, facilitando a interpretação da carteira.',
  },
  {
    icon: Newspaper,
    title: 'Notícias filtradas',
    description: 'As notícias têm filtro geral e filtro pelos meus ativos. Mantive dados mockados e links clicáveis para garantir estabilidade durante a demonstração.',
  },
  {
    icon: ShieldCheck,
    title: 'Validações de entrada',
    description: 'O app não aceita qualquer texto como ticker. O usuário escolhe ativos reconhecidos, informa quantidade e pode ajustar o preço realmente pago.',
  },
];

const featureItems = [
  'Cadastro e login local de usuário.',
  'Compra e venda de ativos com preço pago editável.',
  'Cálculo de quantidade atual, custo total e preço médio.',
  'Dashboard com patrimônio, rentabilidade e melhores/piores ativos.',
  'Histórico de transações e tela de detalhe por ativo.',
  'Relatórios por ativo e por classe: ações, FIIs, ETFs e outros.',
  'Notícias gerais e notícias filtradas pelos ativos da carteira.',
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
    <Header title="Sobre" subtitle="Meu roteiro de apresentação do projeto" />

    <View style={styles.heroCard}>
      <Text style={styles.heroEyebrow}>NightBull</Text>
      <Text style={styles.heroTitle}>Minha carteira de investimentos</Text>
      <Text style={styles.heroText}>
        Este aplicativo foi desenvolvido como uma proposta acadêmica para acompanhar uma carteira de investimentos de forma simples,
        local e visual. A ideia foi criar algo com aparência de produto real, deixando claro o uso das tecnologias
        exigidas no projeto.
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
        A solução proposta centraliza o registro de operações, a persistência local, a busca de cotações,
        o cálculo de preço médio e a visualização da composição da carteira. O objetivo é reduzir a complexidade e mostrar rapidamente
        as informações que mais importam para o investidor.
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
