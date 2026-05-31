import { normalizeTicker } from '../utils/formatters';

const BRAPI_BASE_URL = 'https://brapi.dev/api/quote';

const mockPrices = {
  PETR4: { price: 38.42, changePercent: 0.74, shortName: 'Petrobras PN' },
  VALE3: { price: 63.18, changePercent: -0.42, shortName: 'Vale ON' },
  ITUB4: { price: 34.91, changePercent: 0.21, shortName: 'Itau Unibanco PN' },
  BOVA11: { price: 128.55, changePercent: 0.38, shortName: 'ETF Ibovespa' },
  IVVB11: { price: 315.3, changePercent: 0.58, shortName: 'ETF S&P 500' },
  KNCR11: { price: 103.8, changePercent: -0.12, shortName: 'Kinea Rendimentos' },
  HGLG11: { price: 161.47, changePercent: 0.09, shortName: 'CSHG Logística' },
};

const mockNews = [
  {
    id: 'macro-juros',
    title: 'Mercado monitora curva de juros antes de nova decisão do Copom',
    source: 'Valor Econômico',
    date: '2026-05-31',
    summary: 'Investidores ajustam posições em renda variável enquanto avaliam inflação, atividade e comunicados do Banco Central.',
    tickers: ['PETR4', 'VALE3', 'ITUB4', 'BOVA11'],
  },
  {
    id: 'fiis-logistica',
    title: 'FIIs de tijolo buscam recompor distribuições com vacância controlada',
    source: 'InfoMoney',
    date: '2026-05-30',
    summary: 'Segmentos de galpões logísticos e lajes corporativas mantêm foco em contratos indexados e revisões graduais de aluguel.',
    tickers: ['HGLG11', 'KNCR11'],
  },
  {
    id: 'commodities',
    title: 'Commodities fecham mistas e afetam empresas exportadoras na B3',
    source: 'Exame Invest',
    date: '2026-05-29',
    summary: 'Petróleo e minério seguem sensíveis a dados de demanda global, estoques e sinais da economia chinesa.',
    tickers: ['PETR4', 'VALE3'],
  },
  {
    id: 'etfs-global',
    title: 'ETFs internacionais ganham espaço em carteiras diversificadas',
    source: 'B3',
    date: '2026-05-28',
    summary: 'Produtos listados localmente permitem exposição a índices globais sem remessa direta de recursos ao exterior.',
    tickers: ['IVVB11', 'BOVA11'],
  },
  {
    id: 'bancos',
    title: 'Bancos mantêm rentabilidade em foco diante de crédito seletivo',
    source: 'Money Times',
    date: '2026-05-27',
    summary: 'Analistas observam inadimplência, margem financeira e disciplina de custos nas principais instituições listadas.',
    tickers: ['ITUB4'],
  },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mockQuoteForTicker = (ticker) => {
  const cleanTicker = normalizeTicker(ticker);
  const knownMock = mockPrices[cleanTicker];

  if (knownMock) {
    return {
      ticker: cleanTicker,
      price: knownMock.price,
      changePercent: knownMock.changePercent,
      shortName: knownMock.shortName,
      source: 'mock',
    };
  }

  const seed = cleanTicker.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const price = 18 + (seed % 180) + (seed % 37) / 100;
  const changePercent = ((seed % 900) / 100 - 4.5) / 2;

  return {
    ticker: cleanTicker,
    price: Number(price.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    shortName: `${cleanTicker} B3`,
    source: 'mock',
  };
};

export const fetchQuote = async (ticker) => {
  const cleanTicker = normalizeTicker(ticker);

  if (!cleanTicker) {
    throw new Error('Informe um ticker válido.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${BRAPI_BASE_URL}/${cleanTicker}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Não foi possível consultar a Brapi.');
    }

    const payload = await response.json();
    const result = payload?.results?.[0];

    if (!result?.regularMarketPrice) {
      throw new Error('Ticker não encontrado na Brapi.');
    }

    return {
      ticker: result.symbol || cleanTicker,
      price: Number(result.regularMarketPrice),
      changePercent: Number(result.regularMarketChangePercent || 0),
      shortName: result.shortName || result.longName || cleanTicker,
      source: 'brapi',
    };
  } catch (error) {
    return mockQuoteForTicker(cleanTicker);
  } finally {
    clearTimeout(timeout);
  }
};

export const fetchQuotes = async (tickers) => {
  const uniqueTickers = Array.from(new Set(tickers.map(normalizeTicker).filter(Boolean)));
  const quotes = await Promise.all(uniqueTickers.map((ticker) => fetchQuote(ticker)));

  return quotes.reduce((accumulator, quote) => {
    accumulator[quote.ticker] = quote;
    return accumulator;
  }, {});
};

export const fetchFinancialNews = async (tickers = []) => {
  await wait(350);

  const normalizedTickers = tickers.map(normalizeTicker).filter(Boolean);

  if (!normalizedTickers.length) {
    return mockNews;
  }

  const filteredNews = mockNews.filter((item) =>
    item.tickers.some((ticker) => normalizedTickers.includes(ticker)),
  );

  return filteredNews.length ? filteredNews : mockNews;
};
