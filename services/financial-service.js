const Transaction = require("../models/Transaction");
const Financial = require("../models/Financial");
const { executeWithTransaction, createError } = require("../utils/common");
const { exchangeValidation, checkExchangeCurrencies, performExchange } = require("../utils/financial");

const addFunds = (userId, type, amount) => {
  return executeWithTransaction(async (session) => {
    if (amount < 1 || typeof amount !== "number" || isNaN(amount)) {
      throw createError("Invalid fund amount", 400);
    }
    const userFinancial = await Financial.findOne({ userId }).session(session);
    if (!userFinancial) {
      throw createError("User financial data not found! If this error persist, please contact support", 404);
    }
    
    userFinancial.balance += amount;
    const newTransaction = new Transaction({ userId, type, amount });

    await userFinancial.save({ session });
    await newTransaction.save({ session });

    return { userFinancial, newTransaction }
  })
};

const exchangeCurrency = (userId, type, from, to, rate) => {
  return executeWithTransaction(async (session) => {
    exchangeValidation(from, to, rate);

    await checkExchangeCurrencies(from, to);

    const userFinancial = await performExchange(userId, session, from, to);

    const newTransaction = new Transaction({
      userId,
      type,
      from: { code: from.code, amount: from.amount },
      to: { code: to.code, amount: to.amount },
      exchangeRate: rate,
    });

    await userFinancial.save({ session });
    await newTransaction.save({ session });

    return { userFinancial, newTransaction };
  })
}

module.exports = { addFunds, exchangeCurrency };