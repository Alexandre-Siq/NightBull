# NightBull

Aplicativo mobile acadêmico de carteira de investimentos em React Native com Expo.

## Stack

- Expo / React Native
- React Navigation Bottom Tabs
- expo-sqlite para persistência local
- react-native-chart-kit para gráficos
- fetch API nativo para cotações Brapi

## Funcionalidades

- Carteira consolidada por ticker com quantidade, preço médio, preço atual e retorno percentual.
- Registro de compras e vendas persistidas em SQLite.
- Consulta de cotação pela Brapi com fallback mock para apresentações offline ou sem token.
- Relatórios com gráfico de pizza e barras em dark theme.
- Notícias financeiras mockadas e filtradas pelos tickers da carteira.

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
  screens/       Carteira, Operar, Relatórios e Notícias
  services/      Integração Brapi e notícias mock
  theme/         Paleta e tipografia
  utils/         Formatadores
```
