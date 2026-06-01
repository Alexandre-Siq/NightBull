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
  'Eu quis criar um aplicativo que fosse simples de apresentar, mas que tivesse um fluxo real de uso.',
  'A ideia foi unir cadastro, operações, persistência local, cotações, relatórios e notícias em uma única experiência.',
  'Também quis trabalhar uma identidade visual mais profissional, com dark theme e foco em dados financeiros.',
];

const technicalDecisions = [
  {
    icon: Smartphone,
    title: 'React Native com Expo',
    description: 'Escolhi Expo porque ele facilita a execução em Android e Web. Isso deixa o projeto mais seguro para apresentação, já que posso demonstrar em emulador ou navegador.',
  },
  {
    icon: Route,
    title: 'Navegação por abas',
    description: 'Organizei o app em áreas bem objetivas: Carteira, Operar, Relatórios, Notícias e Sobre. Cada aba representa uma parte do fluxo do investidor.',
  },
  {
    icon: Database,
    title: 'SQLite local',
    description: 'Usei expo-sqlite para gravar usuários e transações no próprio dispositivo. Assim, as operações continuam salvas mesmo fechando o app.',
  },
  {
    icon: LineChart,
    title: 'Cotação via Brapi',
    description: 'A cotação dos ativos é buscada pela Brapi. Quando necessário, o app usa uma lista local conhecida para evitar que a apresentação dependa totalmente da API.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios visuais',
    description: 'Criei relatórios para mostrar patrimônio, custo, valor atual e distribuição por tipo de ativo. Isso torna a carteira mais fácil de interpretar.',
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
        Eu desenvolvi este aplicativo como uma proposta acadêmica para acompanhar uma carteira de investimentos de forma simples,
        local e visual. A ideia foi criar algo que parecesse um produto real, mas que também deixasse claro o uso das tecnologias
        exigidas no projeto.
      </Text>
      <Text style={styles.heroText}>
        Por isso, esta aba funciona como meu roteiro de apresentação. Em vez de depender de slides, eu consigo explicar o problema,
        a motivação, as decisões técnicas e as principais funcionalidades diretamente dentro do app.
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
        Minha solução foi criar um app em que eu consigo registrar operações, persistir os dados localmente, buscar cotações,
        calcular preço médio e visualizar a composição da carteira. O objetivo é reduzir a complexidade e mostrar rapidamente
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
