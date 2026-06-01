const stockIconMap = {
  PETR: { label: 'PB', name: 'Petrobras', background: '#24352D', border: '#5BC98B59', foreground: '#5BC98B' },
  VALE: { label: 'VA', name: 'Vale', background: '#343122', border: '#D8B46E59', foreground: '#D8B46E' },
  ITUB: { label: 'IT', name: 'Itaú', background: '#332A22', border: '#E0A96D59', foreground: '#E0A96D' },
  BBDC: { label: 'BD', name: 'Bradesco', background: '#352725', border: '#E07A5F59', foreground: '#E07A5F' },
  BBAS: { label: 'BB', name: 'Banco do Brasil', background: '#343122', border: '#D8B46E59', foreground: '#D8B46E' },
  ABEV: { label: 'AB', name: 'Ambev', background: '#263128', border: '#7CA98259', foreground: '#7CA982' },
  WEGE: { label: 'WG', name: 'WEG', background: '#253135', border: '#8FA1A659', foreground: '#8FA1A6' },
  B3SA: { label: 'B3', name: 'B3', background: '#2F2F2F', border: '#A6A6A659', foreground: '#EDEDED' },
  RENT: { label: 'RE', name: 'Localiza', background: '#332D24', border: '#C6B38E59', foreground: '#C6B38E' },
  SUZB: { label: 'SZ', name: 'Suzano', background: '#24352D', border: '#5BC98B59', foreground: '#5BC98B' },
};

export const getAssetIcon = (ticker) => {
  const cleanTicker = ticker.trim().toUpperCase();
  const prefix = cleanTicker.slice(0, 4);

  return stockIconMap[prefix] || null;
};
