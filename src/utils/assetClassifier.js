const ETF_TICKERS = new Set([
  'BOVA11',
  'BOVV11',
  'BRAX11',
  'DIVO11',
  'ECOO11',
  'GOVE11',
  'HASH11',
  'IVVB11',
  'MATB11',
  'MILL11',
  'NASD11',
  'PIBB11',
  'SMAL11',
  'SPXI11',
  'XINA11',
]);

const TYPE_META = {
  STOCK: { label: 'Ações', color: '#5BC98B' },
  FII: { label: 'FIIs', color: '#D8B46E' },
  ETF: { label: 'ETFs', color: '#8FA1A6' },
  OTHER: { label: 'Outros', color: '#E07A5F' },
};

export const classifyAsset = (ticker) => {
  const cleanTicker = ticker.trim().toUpperCase();

  if (ETF_TICKERS.has(cleanTicker)) {
    return { key: 'ETF', ...TYPE_META.ETF };
  }

  if (/^[A-Z]{4}11$/.test(cleanTicker)) {
    return { key: 'FII', ...TYPE_META.FII };
  }

  if (/^[A-Z]{4}[3-8]$/.test(cleanTicker)) {
    return { key: 'STOCK', ...TYPE_META.STOCK };
  }

  return { key: 'OTHER', ...TYPE_META.OTHER };
};

export const assetTypeOrder = ['STOCK', 'FII', 'ETF', 'OTHER'];

export const assetTypeMeta = TYPE_META;
