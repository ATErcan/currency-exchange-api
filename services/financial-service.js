const Transaction = require("../models/Transaction");
const Financial = require("../models/Financial");
const { executeWithTransaction, createError } = require("../utils/common");
const { getAllCurrencies } = require("../utils/api");

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
    if(from.code === to.code) {
      throw createError("Invalid currency transaction", 400);
    }

    const tolerance = 0.001;
    const exchangeRate = Number((from.mid / to.mid).toFixed(3));
    const exchangeResult = Number((from.amount * exchangeRate).toFixed(3));
    if (Math.abs(rate - exchangeRate) > tolerance) {
      throw createError("Exchange rate is outdated or tampered", 400);
    }
    if(Math.abs(exchangeResult - to.amount) > tolerance) {
      throw createError("The exchange amounts do not match the expected calculation. Please verify the values and try again.", 400);
    }
    if(exchangeRate < 1 && from.amount < 1) {
      throw createError("The amount is too low to process with the current exchange rate. Please enter a larger amount.", 400);
    }

    const [tableA, tableB] = await getAllCurrencies();
    const fromCurrency =
      checkCurrencyCode(tableA?.value?.rates, from.code) ??
      checkCurrencyCode(tableB?.value?.rates, from.code);
    const toCurrency =
      checkCurrencyCode(tableA?.value?.rates, to.code) ??
      checkCurrencyCode(tableB?.value?.rates, to.code);

    if (!fromCurrency || !toCurrency) {
      throw createError(
        `Currency not found: ${
          !fromCurrency ? `${from.code}` : `${to.code}`
        } Currency is not valid or is not currently available.`,
        400
      );
    }
    if(fromCurrency.mid !== from.mid || toCurrency.mid !== to.mid) {
      throw createError("Exchange rate is outdated or tampered", 400);
    }

    const userFinancial = await Financial.findOne({ userId }).session(session);
    if(!userFinancial) {
      throw createError("User financial data not found! If this error persist, please contact support", 404)
    }

    const toCurrencyBalance = userFinancial.currencies.find(currency => currency.code === toCurrency.code);
    const fromCurrencyBalance = userFinancial.currencies.find(currency => currency.code === fromCurrency.code);
    if (fromCurrency.code === userFinancial.baseCurrency) {
      if (userFinancial.balance < from.amount) {
        throw createError("You do not have sufficient funds to perform this transaction.", 400);
      }
      userFinancial.balance -= from.amount;
    } else {
      if (!fromCurrencyBalance || fromCurrencyBalance.amount < from.amount) {
        throw createError("You do not have sufficient funds in the currency you selected.", 400);
      }
      fromCurrencyBalance.amount -= from.amount;
    }

    if (toCurrency.code === userFinancial.baseCurrency) {
      userFinancial.balance += to.amount;
    } else if (toCurrencyBalance) {
      toCurrencyBalance.amount += to.amount;
    } else {
      userFinancial.currencies.push({ code: to.code, amount: to.amount });
    }

    const newTransaction = new Transaction({
      userId,
      type,
      from: { code: from.code, amount: from.amount },
      to: { code: to.code, amount: to.amount },
      exchangeRate,
    });

    await userFinancial.save({ session });
    await newTransaction.save({ session });

    return { userFinancial, newTransaction };
  })
}

module.exports = { addFunds }