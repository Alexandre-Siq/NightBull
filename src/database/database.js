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
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

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
    CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
  `);
};

const normalizeEmail = (email) => email.trim().toLowerCase();

export const createUser = async ({ name, email, password }) => {
  const database = await getDatabase();
  const cleanName = name.trim();
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = password.trim();

  if (!cleanName || !cleanEmail.includes('@') || cleanPassword.length < 4) {
    throw new Error('Informe nome, e-mail válido e senha com ao menos 4 caracteres.');
  }

  const existingUser = await database.getFirstAsync(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    cleanEmail,
  );

  if (existingUser) {
    throw new Error('Já existe uma conta cadastrada com este e-mail.');
  }

  const result = await database.runAsync(
    'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)',
    cleanName,
    cleanEmail,
    cleanPassword,
    new Date().toISOString(),
  );

  return {
    id: result.lastInsertRowId,
    name: cleanName,
    email: cleanEmail,
  };
};

export const authenticateUser = async ({ email, password }) => {
  const database = await getDatabase();
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    throw new Error('Informe e-mail e senha.');
  }

  const user = await database.getFirstAsync(
    'SELECT id, name, email FROM users WHERE email = ? AND password = ? LIMIT 1',
    cleanEmail,
    cleanPassword,
  );

  if (!user) {
    throw new Error('E-mail ou senha inválidos.');
  }

  return user;
};

export const addTransaction = async ({ type, ticker, quantity, price, date }) => {
  const database = await getDatabase();
  const cleanTicker = ticker.trim().toUpperCase();
  const cleanType = type === 'SELL' ? 'SELL' : 'BUY';
  const cleanQuantity = Number.parseInt(quantity, 10);
  const cleanPrice = Number(price);

  if (!cleanTicker || !Number.isInteger(cleanQuantity) || cleanQuantity <= 0 || !Number.isFinite(cleanPrice)) {
    throw new Error('Dados da transação inválidos.');
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
      averageBuyPrice: 0,
      buyQuantity: 0,
      sellQuantity: 0,
      buyTotal: 0,
      sellTotal: 0,
      realizedResult: 0,
      transactionCount: 0,
      lastTradeDate: transaction.date,
    };

    if (transaction.type === 'BUY') {
      const operationValue = transaction.quantity * transaction.price;

      current.buyQuantity += transaction.quantity;
      current.buyTotal += operationValue;
      current.totalCost += operationValue;
      current.quantity += transaction.quantity;
    } else {
      const quantityToSell = Math.min(transaction.quantity, current.quantity);
      const operationValue = transaction.quantity * transaction.price;
      const costBasis = quantityToSell * current.averagePrice;

      current.sellQuantity += transaction.quantity;
      current.sellTotal += operationValue;
      current.realizedResult += operationValue - costBasis;
      current.totalCost -= costBasis;
      current.quantity -= quantityToSell;
    }

    current.averagePrice = current.quantity > 0 ? current.totalCost / current.quantity : 0;
    current.averageBuyPrice = current.buyQuantity > 0 ? current.buyTotal / current.buyQuantity : 0;
    current.transactionCount += 1;
    current.lastTradeDate = transaction.date;
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
