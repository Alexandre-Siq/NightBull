import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'nightbull.db';

let databasePromise;


const seedDemoUser = async (database) => {
  const demoEmail = 'demo@nightbull.com';
  let demoUser = await database.getFirstAsync('SELECT id FROM users WHERE email = ? LIMIT 1', demoEmail);

  if (!demoUser) {
    const result = await database.runAsync(
      'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)',
      'Usuário Demo',
      demoEmail,
      '1234',
      new Date().toISOString(),
    );

    demoUser = { id: result.lastInsertRowId };
  }

  const transactionCount = await database.getFirstAsync(
    'SELECT COUNT(*) AS count FROM transactions WHERE user_id = ?',
    demoUser.id,
  );

  if (transactionCount?.count > 0) {
    return;
  }

  const demoTransactions = [
    ['BUY', 'PETR4', 120, 34.8, '2026-01-12T10:00:00.000Z'],
    ['BUY', 'VALE3', 80, 59.4, '2026-02-08T10:00:00.000Z'],
    ['BUY', 'ITUB4', 100, 31.7, '2026-03-05T10:00:00.000Z'],
    ['BUY', 'BOVA11', 20, 119.35, '2026-03-22T10:00:00.000Z'],
    ['BUY', 'KNCR11', 35, 101.2, '2026-04-09T10:00:00.000Z'],
    ['SELL', 'PETR4', 20, 38.1, '2026-05-10T10:00:00.000Z'],
    ['BUY', 'HGLG11', 15, 158.9, '2026-05-18T10:00:00.000Z'],
  ];

  for (const [type, ticker, quantity, price, date] of demoTransactions) {
    await database.runAsync(
      'INSERT INTO transactions (user_id, type, ticker, quantity, price, date) VALUES (?, ?, ?, ?, ?, ?)',
      demoUser.id,
      type,
      ticker,
      quantity,
      price,
      date,
    );
  }
};

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
      user_id INTEGER,
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

  const columns = await database.getAllAsync('PRAGMA table_info(transactions)');
  const hasUserColumn = columns.some((column) => column.name === 'user_id');

  if (!hasUserColumn) {
    await database.execAsync('ALTER TABLE transactions ADD COLUMN user_id INTEGER');
  }

  await database.execAsync('CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions (user_id)');
  await seedDemoUser(database);
};

const requireUserId = (userId) => {
  const parsedUserId = Number(userId);

  if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
    throw new Error('Usuário inválido para carregar a carteira.');
  }

  return parsedUserId;
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

export const addTransaction = async ({ userId, type, ticker, quantity, price, date }) => {
  const database = await getDatabase();
  const cleanUserId = requireUserId(userId);
  const cleanTicker = ticker.trim().toUpperCase();
  const cleanType = type === 'SELL' ? 'SELL' : 'BUY';
  const cleanQuantity = Number.parseInt(quantity, 10);
  const cleanPrice = Number(price);

  if (!cleanTicker || !Number.isInteger(cleanQuantity) || cleanQuantity <= 0 || !Number.isFinite(cleanPrice)) {
    throw new Error('Dados da transação inválidos.');
  }

  if (cleanType === 'SELL') {
    const position = await getPositionByTicker(cleanUserId, cleanTicker);

    if (!position || position.quantity < cleanQuantity) {
      throw new Error('Quantidade insuficiente em carteira para vender.');
    }
  }

  return database.runAsync(
    'INSERT INTO transactions (user_id, type, ticker, quantity, price, date) VALUES (?, ?, ?, ?, ?, ?)',
    cleanUserId,
    cleanType,
    cleanTicker,
    cleanQuantity,
    cleanPrice,
    date || new Date().toISOString(),
  );
};

export const getTransactions = async (userId) => {
  const database = await getDatabase();
  const cleanUserId = requireUserId(userId);

  return database.getAllAsync(
    'SELECT id, user_id, type, ticker, quantity, price, date FROM transactions WHERE user_id = ? ORDER BY date ASC, id ASC',
    cleanUserId,
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

export const getCurrentPositions = async (userId) => {
  const transactions = await getTransactions(userId);

  return calculatePositions(transactions);
};

export const getPositionByTicker = async (userId, ticker) => {
  const positions = await getCurrentPositions(userId);
  const cleanTicker = ticker.trim().toUpperCase();

  return positions.find((position) => position.ticker === cleanTicker) || null;
};

export const getPortfolioTickers = async (userId) => {
  const positions = await getCurrentPositions(userId);

  return positions.map((position) => position.ticker);
};
