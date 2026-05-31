export const formatCurrency = (value) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue);
};

export const formatPercent = (value) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const sign = safeValue > 0 ? '+' : '';

  return `${sign}${safeValue.toFixed(2)}%`;
};

export const normalizeTicker = (ticker) => ticker.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

export const initialsFromTicker = (ticker) => normalizeTicker(ticker).slice(0, 2) || '--';

export const formatDate = (isoDate) => {
  const date = isoDate ? new Date(isoDate) : new Date();

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};
