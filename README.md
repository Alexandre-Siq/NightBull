# NightBull

Aplicativo acadêmico de carteira de investimentos desenvolvido em React Native com Expo. O projeto simula um fluxo real de acompanhamento de ações, FIIs e ETFs, com persistência local e visualização de dados.

## Stack

- Expo / React Native
- React Navigation Bottom Tabs
- expo-sqlite para persistência local
- react-native-chart-kit e SVG para gráficos
- fetch API nativo para cotações Brapi

## Funcionalidades

- Carteira consolidada por ticker com quantidade, preço médio, preço atual e retorno percentual.
- Registro de compras e vendas persistidas em SQLite.
- Consulta de cotação pela Brapi com fallback mock para apresentações offline ou sem token.
- Relatórios com gráfico de pizza e barras em dark theme.
- Notícias financeiras mockadas e filtradas pelos tickers da carteira.

## Usuário demo

O app cria automaticamente uma carteira de demonstração local:

- E-mail: `demo@nightbull.com`
- Senha: `1234`

## Observações de implementação

- O banco é local, usando SQLite. Cada instalação do app tem seus próprios dados.
- As cotações tentam usar a Brapi, mas há fallback local para manter a apresentação estável.
- As notícias são mockadas de propósito, com links externos, para evitar dependência de autenticação em APIs de notícias.
- Existe um usuário demo criado localmente para validação, mas o botão de acesso rápido não aparece na interface final.

## Scripts

```bash
npm start
npm run android
npm run web
```

## Estrutura principal

```text
src/
  components/    Componentes visuais reutilizáveis
  database/      Inicialização e consultas SQLite
  navigation/    Bottom Tabs
  screens/       Carteira, Operar, Relatórios, Notícias e Sobre
  services/      Integração Brapi e notícias mock
  theme/         Paleta e tipografia
  utils/         Formatadores
```
