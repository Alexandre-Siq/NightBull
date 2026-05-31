import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Database, LineChart, Newspaper, Route, ShieldCheck, Smartphone } from 'lucide-react-native';
import { Header } from '../components/Header';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionLabel } from '../components/SectionLabel';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const decisions = [
  {
    icon: Smartphone,
    title: 'Aplicativo em React Native com Expo',
    description: 'Escolhi Expo para acelerar a construção e conseguir apresentar o mesmo projeto em Android e Web, sem depender de configuração nativa complexa.',
  },
  {
    icon: Route,
    title: 'Navegação por abas',
    description: 'Separei o app em áreas objetivas: carteira, operação, relatórios, notícias e sobre. A ideia foi deixar o fluxo claro para quem estiver avaliando.',
  },
  {
    icon: Database,
    title: 'Persistência local com SQLite',
    description: 'Usei SQLite para gravar usuários e transações no próprio dispositivo. Assim, as compras e vendas continuam salvas mesmo após fechar o app.',
  },
  {
    icon: LineChart,
    title: 'Cotações e relatórios',
    description: 'A cotação é buscada pela Brapi quando possível. Os relatórios foram montados com gráficos e cálculos locais para evitar dependência excessiva de serviços externos.',
  },
  {
    icon: Newspaper,
    title: 'Notícias financeiras',
    description: 'Mantive notícias mockadas e clicáveis para garantir estabilidade na apresentação, com filtro entre notícias gerais e notícias relacionadas aos meus ativos.',
  },
  {
    icon: ShieldCheck,
    title: 'Validações de uso',
    description: 'O app valida tickers conhecidos, exige quantidade válida, permite informar o preço realmente pago e separa a carteira de cada usuário cadastrado.',
  },
];

const presentationSteps = [
  'Criar uma conta ou acessar com um usuário já cadastrado.',
  'Selecionar um ativo reconhecido pela B3 na tela Operar.',
  'Registrar uma compra ou venda com o preço pago pelo usuário.',
  'Conferir o patrimônio, histórico e detalhe do ativo na Carteira.',
  'Analisar a distribuição por ativo e por tipo em Relatórios.',
  'Abrir Notícias e comparar o filtro geral com o filtro Meus ativos.',
];

const DecisionCard = ({ item }) => {
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
    <Header title="Sobre" subtitle="Como construí e organizei este projeto" />

    <View style={styles.heroCard}>
      <Text style={styles.heroEyebrow}>NightBull</Text>
      <Text style={styles.heroTitle}>Minha proposta de carteira de investimentos</Text>
      <Text style={styles.heroText}>
        Neste projeto, eu desenvolvi um aplicativo de carteira de investimentos com foco em uma apresentação acadêmica funcional.
        Minha intenção foi simular um fluxo real de uso: cadastrar usuário, registrar compras e vendas, acompanhar patrimônio,
        visualizar relatórios e consultar notícias do mercado financeiro.
      </Text>
      <Text style={styles.heroText}>
        Priorizei uma interface escura, minimalista e objetiva, com dados bem destacados e sem elementos visuais que tirassem o foco
        da análise da carteira.
      </Text>
    </View>

    <SectionLabel style={styles.nextSection}>Decisões técnicas</SectionLabel>
    {decisions.map((item) => <DecisionCard key={item.title} item={item} />)}

    <SectionLabel style={styles.nextSection}>O que o app demonstra</SectionLabel>
    <View style={styles.textCard}>
      <Text style={styles.paragraph}>
        A aplicação demonstra integração entre interface mobile, banco local, consumo de API, validações de formulário,
        cálculos financeiros e visualização de dados. O ponto principal é mostrar que a carteira não é apenas uma lista de ativos:
        ela calcula preço médio, custo total, valor atual, rentabilidade, histórico e distribuição por classe.
      </Text>
      <Text style={styles.paragraph}>
        Também procurei deixar o projeto seguro para apresentação. Por isso, algumas partes usam dados mockados ou fallback local,
        evitando que uma falha de API prejudique a demonstração.
      </Text>
    </View>

    <SectionLabel style={styles.nextSection}>Roteiro que eu usaria na apresentação</SectionLabel>
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
  textCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  paragraph: {
    color: colors.mutedForeground,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 10,
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
    lineHeight: 19,
  },
});
