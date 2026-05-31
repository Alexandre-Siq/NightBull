# NightBull

Aplicativo mobile acadêmico de carteira de investimentos em React Native com Expo.

## Stack

- Expo / React Native
- React Navigation Bottom Tabs
- expo-sqlite para persistencia local
- react-native-chart-kit para graficos
- fetch API nativo para cotacoes Brapi

## Funcionalidades

- Carteira consolidada por ticker com quantidade, preco medio, preco atual e retorno percentual.
- Registro de compras e vendas persistidas em SQLite.
- Consulta de cotacao pela Brapi com fallback mock para apresentacoes offline ou sem token.
- Relatorios com grafico de pizza e barras em dark theme.
- Noticias financeiras mockadas e filtradas pelos tickers da carteira.

## Scripts

```bash
npm start
npm run android
npm run web
```

## Estrutura principal

```text
src/
  components/    Componentes visuais reutilizaveis
  database/      Inicializacao e consultas SQLite
  navigation/    Bottom Tabs
  screens/       Carteira, Operar, Relatorios e Noticias
  services/      Integracao Brapi e noticias mock
  theme/         Paleta e tipografia
  utils/         Formatadores
```
