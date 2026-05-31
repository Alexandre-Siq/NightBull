import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'nightbull.db';

let databasePromise;

export const getDatabase = async () => {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return databasePromise;
};

export const initializeDatabase = async () => {
  const database = await getDatabase();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL')),
      ticker TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      price REAL NOT NULL CHECK (price >= 0),
      date TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_ticker ON transactions (ticker);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date);
  `);
};

export const addTransaction = async ({ type, ticker, quantity, price, date }) => {
  const database = await getDatabase();
  const cleanTicker = ticker.trim().toUpperCase();
  const cleanType = type === 'SELL' ? 'SELL' : 'BUY';
  const cleanQuantity = Number.parseInt(quantity, 10);
  const cleanPrice = Number(price);

  if (!cleanTicker || !Number.isInteger(cleanQuantity) || cleanQuantity <= 0 || !Number.isFinite(cleanPrice)) {
    throw new Error('Dados da transacao invalidos.');
  }

  if (cleanType === 'SELL') {
    const position = await getPositionByTicker(cleanTicker);

    if (!position || position.quantity < cleanQuantity) {
      throw new Error('Quantidade insuficiente em carteira para vender.');
    }
  }

  return database.runAsync(
    'INSERT INTO transactions (type, ticker, quantity, price, date) VALUES (?, ?, ?, ?, ?)',
    cleanType,
    cleanTicker,
    cleanQuantity,
    cleanPrice,
    date || new Date().toISOString(),
  );
};

export const getTransactions = async () => {
  const database = await getDatabase();

  return database.getAllAsync(
    'SELECT id, type, ticker, quantity, price, date FROM transactions ORDER BY date ASC, id ASC',
  );
};

export const calculatePositions = (transactions) => {
  const positionMap = new Map();

  transactions.forEach((transaction) => {
    const ticker = transaction.ticker.toUpperCase();
    const current = positionMap.get(ticker) || {
      ticker,
      quantity: 0,
      totalCost: 0,
      averagePrice: 0,
    };

    if (transaction.type === 'BUY') {
      current.totalCost += transaction.quantity * transaction.price;
      current.quantity += transaction.quantity;
    } else {
      const quantityToSell = Math.min(transaction.quantity, current.quantity);
      current.totalCost -= quantityToSell * current.averagePrice;
      current.quantity -= quantityToSell;
    }

    current.averagePrice = current.quantity > 0 ? current.totalCost / current.quantity : 0;
    positionMap.set(ticker, current);
  });

  return Array.from(positionMap.values())
    .filter((position) => position.quantity > 0)
    .sort((a, b) => a.ticker.localeCompare(b.ticker));
};

export const getCurrentPositions = async () => {
  const transactions = await getTransactions();

  return calculatePositions(transactions);
};

export const getPositionByTicker = async (ticker) => {
  const positions = await getCurrentPositions();
  const cleanTicker = ticker.trim().toUpperCase();

  return positions.find((position) => position.ticker === cleanTicker) || null;
};

export const getPortfolioTickers = async () => {
  const positions = await getCurrentPositions();

  return positions.map((position) => position.ticker);
};
