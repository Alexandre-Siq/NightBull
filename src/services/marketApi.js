import { normalizeTicker } from '../utils/formatters';

const BRAPI_BASE_URL = 'https://brapi.dev/api/quote';
//sistema de SOS caso de algo errado na api da BRAPI
const mockPrices = {
  PETR4: { price: 38.42, changePercent: 0.74, shortName: 'Petrobras PN' },
  PETR3: { price: 41.1, changePercent: 0.62, shortName: 'Petrobras ON' },
  VALE3: { price: 63.18, changePercent: -0.42, shortName: 'Vale ON' },
  ITUB4: { price: 34.91, changePercent: 0.21, shortName: 'Itaú Unibanco PN' },
  ITUB3: { price: 32.74, changePercent: 0.17, shortName: 'Itaú Unibanco ON' },
  BBDC4: { price: 14.82, changePercent: -0.2, shortName: 'Bradesco PN' },
  BBAS3: { price: 27.66, changePercent: 0.31, shortName: 'Banco do Brasil ON' },
  WEGE3: { price: 41.92, changePercent: 0.44, shortName: 'WEG ON' },
  ABEV3: { price: 12.06, changePercent: -0.14, shortName: 'Ambev ON' },
  MGLU3: { price: 9.84, changePercent: 1.06, shortName: 'Magazine Luiza ON' },
  B3SA3: { price: 12.47, changePercent: 0.53, shortName: 'B3 ON' },
  RENT3: { price: 43.2, changePercent: -0.18, shortName: 'Localiza ON' },
  SUZB3: { price: 54.35, changePercent: 0.27, shortName: 'Suzano ON' },
  BOVA11: { price: 128.55, changePercent: 0.38, shortName: 'ETF Ibovespa' },
  IVVB11: { price: 315.3, changePercent: 0.58, shortName: 'ETF S&P 500' },
  SMAL11: { price: 111.42, changePercent: 0.24, shortName: 'ETF Small Caps' },
  KNCR11: { price: 103.8, changePercent: -0.12, shortName: 'Kinea Rendimentos' },
  HGLG11: { price: 161.47, changePercent: 0.09, shortName: 'CSHG Logística' },
  MXRF11: { price: 10.34, changePercent: 0.04, shortName: 'Maxi Renda FII' },
  XPLG11: { price: 103.12, changePercent: -0.07, shortName: 'XP Log FII' },
};

export const b3AssetOptions = Object.entries(mockPrices)
  .map(([ticker, data]) => ({
    ticker,
    name: data.shortName,
  }))
  .sort((a, b) => a.ticker.localeCompare(b.ticker));

export const knownB3Tickers = b3AssetOptions.map((asset) => asset.ticker);

const generalMarketNews = [
  {
    id: 'macro-selic',
    title: 'Mercado reduz projeção para juros futuros após dados de inflação',
    source: 'Valor Econômico',
    date: '2026-05-31',
    summary: 'A curva de juros abriu espaço para revisão de expectativas depois de novos indicadores de preços e atividade econômica.',
    tickers: [],
    url: 'https://valor.globo.com/financas/',
  },
  {
    id: 'b3-volume',
    title: 'Volume financeiro da B3 avança com maior procura por renda variável',
    source: 'B3',
    date: '2026-05-30',
    summary: 'O aumento de negociações reflete maior participação de investidores pessoa física e rotação entre setores da bolsa.',
    tickers: [],
    url: 'https://www.b3.com.br/pt_br/noticias/',
  },
  {
    id: 'dolar-bolsa',
    title: 'Dólar e bolsa reagem a sinais externos sobre crescimento global',
    source: 'Exame Invest',
    date: '2026-05-29',
    summary: 'Investidores acompanham dados dos Estados Unidos e China para calibrar exposição a mercados emergentes.',
    tickers: [],
    url: 'https://exame.com/invest/mercados/',
  },
  {
    id: 'fundos-fluxo',
    title: 'Fundos multimercado aumentam posição em bolsa brasileira',
    source: 'InfoMoney',
    date: '2026-05-28',
    summary: 'Gestores citam valuation descontado, queda dos juros reais e melhora gradual do apetite a risco.',
    tickers: [],
    url: 'https://www.infomoney.com.br/mercados/',
  },
];

const assetRelatedNews = [
  {
    id: 'petrobras-producao',
    title: 'Petrobras atualiza plano de produção e mantém disciplina de investimentos',
    source: 'Money Times',
    date: '2026-05-31',
    summary: 'A companhia reforça foco em eficiência operacional, exploração no pré-sal e manutenção da política de remuneração ao acionista.',
    tickers: ['PETR4', 'PETR3'],
    url: 'https://www.moneytimes.com.br/empresas/',
  },
  {
    id: 'vale-minerio',
    title: 'Vale acompanha minério de ferro e demanda chinesa por aço',
    source: 'Exame Invest',
    date: '2026-05-30',
    summary: 'Analistas monitoram estoques, estímulos na China e margens das siderúrgicas para avaliar o desempenho da mineradora.',
    tickers: ['VALE3'],
    url: 'https://exame.com/invest/mercados/',
  },
  {
    id: 'itau-credito',
    title: 'Itaú mantém foco em crédito seletivo e rentabilidade',
    source: 'InfoMoney',
    date: '2026-05-29',
    summary: 'O banco segue priorizando controle de inadimplência, margem financeira e eficiência operacional no varejo.',
    tickers: ['ITUB4', 'ITUB3'],
    url: 'https://www.infomoney.com.br/mercados/',
  },
  {
    id: 'fiis-logistica',
    title: 'FIIs de tijolo buscam recompor distribuições com vacância controlada',
    source: 'InfoMoney',
    date: '2026-05-28',
    summary: 'Segmentos de galpões logísticos e recebíveis mantêm foco em contratos indexados e revisões graduais de aluguel.',
    tickers: ['HGLG11', 'KNCR11', 'XPLG11', 'MXRF11'],
    url: 'https://www.infomoney.com.br/onde-investir/fundos-imobiliarios/',
  },
  {
    id: 'etfs-global',
    title: 'ETFs internacionais ganham espaço em carteiras diversificadas',
    source: 'B3',
    date: '2026-05-27',
    summary: 'Produtos listados localmente permitem exposição a índices globais sem remessa direta de recursos ao exterior.',
    tickers: ['IVVB11', 'BOVA11', 'SMAL11'],
    url: 'https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-variavel/etf/',
  },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mockQuoteForTicker = (ticker) => {
  const cleanTicker = normalizeTicker(ticker);
  const knownMock = mockPrices[cleanTicker];

  if (!knownMock) {
    throw new Error('Ticker não reconhecido na lista local de ativos B3.');
  }

  return {
    ticker: cleanTicker,
    price: knownMock.price,
    changePercent: knownMock.changePercent,
    shortName: knownMock.shortName,
    source: 'mock',
  };
};

export const fetchQuote = async (ticker) => {
  const cleanTicker = normalizeTicker(ticker);

  if (!cleanTicker) {
    throw new Error('Informe um ticker válido.');
  }

  const controller = new AbortController(); //pausa a pesquisa caso a api demore mais de 8 segundos pra responder.
  const timeout = setTimeout(() => controller.abort(), 8000);
//o app bate na URL da Brapi, se n tiver resposta, entra no mock, se tiver, converte o JSON no atual formatado.
  try {
    const response = await fetch(`${BRAPI_BASE_URL}/${cleanTicker}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Ticker não reconhecido pela Brapi.');
    }

    const payload = await response.json();
    const result = payload?.results?.[0];

    if (!result?.regularMarketPrice) {
      throw new Error('Ticker não reconhecido pela Brapi.');
    }

    return {
      ticker: result.symbol || cleanTicker,
      price: Number(result.regularMarketPrice),
      changePercent: Number(result.regularMarketChangePercent || 0),
      shortName: result.shortName || result.longName || cleanTicker,
      source: 'brapi',
    };
  } catch (error) {
    if (mockPrices[cleanTicker]) {
      return mockQuoteForTicker(cleanTicker);
    }

    throw new Error('Ticker não reconhecido pela B3. Verifique o código e tente novamente.');
  } finally {
    clearTimeout(timeout);
  }
};
//pesquisa o preço atualizado de todas na homescreen
export const fetchQuotes = async (tickers) => {
  const uniqueTickers = Array.from(new Set(tickers.map(normalizeTicker).filter(Boolean)));
  const quotes = await Promise.all(
    uniqueTickers.map((ticker) => fetchQuote(ticker).catch(() => null)),
  );

  return quotes.filter(Boolean).reduce((accumulator, quote) => {
    accumulator[quote.ticker] = quote;
    return accumulator;
  }, {});
};

export const fetchFinancialNews = async (tickers = []) => {
  await wait(350);

  const normalizedTickers = tickers.map(normalizeTicker).filter(Boolean);

  if (!normalizedTickers.length) {
    return generalMarketNews;
  }

  const filteredNews = assetRelatedNews.filter((item) =>
    item.tickers.some((ticker) => normalizedTickers.includes(ticker)),
  );
//ve se tem algo na carteira, se tiver, aparece o filtro
  return filteredNews.length ? filteredNews : [];
};
