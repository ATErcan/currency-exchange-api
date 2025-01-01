const Decimal = require("decimal.js");

const Financial = require("../models/Financial");
const { getAllCurrencies } = require("./api");
const { createError } = require("./common");
const { TOLERANCE, PRECISION } = require("../lib/constants");

const handleFinancialErrors = (err) => {
  const errors = { status: 500, message: "An unexpected error occurred" };

  if (err.message.includes("User financial data not found!")) {
    errors.status = err.statusCode;
    errors.message = err.message;
    return errors;
  }

  if(err.message === "Invalid fund amount") {
    errors.status = err.statusCode;
    errors.message = err.message;
    return errors;
  }

  return errors;
}

const checkCurrencyCode = (table, code) =>
  table?.find((currency) => currency.code === code);

const roundToPrecision = (number, precision = PRECISION) =>
  new Decimal(number).toDecimalPlaces(precision).toNumber();

const exchangeValidation = (from, to, rate) => {
  if (from.code === to.code) {
    throw createError("Invalid currency transaction", 400);
  }

  const exchangeRate = roundToPrecision(new Decimal(from.mid).div(to.mid));
  const exchangeResult = roundToPrecision(new Decimal(from.amount).times(exchangeRate));

  if (Decimal.abs(new Decimal(rate).minus(exchangeRate)).gt(TOLERANCE)) {
    throw createError("Exchange rate is outdated or tampered", 400);
  }
  if(Decimal.abs(new Decimal(exchangeResult).minus(to.amount)).gt(TOLERANCE)) {
    throw createError("The exchange amounts do not match the expected calculation. Please verify the values and try again.", 400);
  }
  if(exchangeRate < 1 && from.amount < 1) {
    throw createError("The amount is too low to process with the current exchange rate. Please enter a larger amount.", 400);
  }
}

const checkExchangeCurrencies = async (from, to) => {
  const [tableA, tableB] = await getAllCurrencies();
  const fromCurrency =
    from.code === "PLN"
      ? { code: "PLN", mid: 1 }
      : checkCurrencyCode(tableA?.value?.rates, from.code) ??
        checkCurrencyCode(tableB?.value?.rates, from.code);
    
  const toCurrency = 
    to.code === "PLN"
      ? { code: "PLN", mid: 1 }
      : checkCurrencyCode(tableA?.value?.rates, to.code) ??
        checkCurrencyCode(tableB?.value?.rates, to.code);

  if (!fromCurrency || !toCurrency) {
    throw createError(
      `Currency not found: ${
        !fromCurrency ? `${from.code}` : `${to.code}`
      } Currency is not valid or is not currently available.`,
      400
    );
  }
  if (fromCurrency.mid !== from.mid || toCurrency.mid !== to.mid) {
    throw createError("Exchange rate is outdated or tampered", 400);
  }
};

const performExchange = async (userId, session, from, to) => {
  const userFinancial = await Financial.findOne({ userId }).session(session);
  if(!userFinancial) {
    throw createError("User financial data not found! If this error persist, please contact support", 404)
  }

  const fromCurrencyBalance = userFinancial.currencies.find(currency => currency.code === from.code);
  const toCurrencyBalance = userFinancial.currencies.find(currency => currency.code === to.code);
  if (from.code === userFinancial.baseCurrency) {
    if (userFinancial.balance < from.amount) {
      throw createError("You do not have sufficient funds to perform this transaction.", 400);
    }
    userFinancial.balance = roundToPrecision(new Decimal(userFinancial.balance).minus(from.amount));
  } else {
    if (!fromCurrencyBalance || fromCurrencyBalance.amount < from.amount) {
      throw createError("You do not have sufficient funds in the currency you selected.", 400);
    }
    fromCurrencyBalance.amount = roundToPrecision(new Decimal(fromCurrencyBalance.amount).minus(from.amount))
  }

  if (to.code === userFinancial.baseCurrency) {
    userFinancial.balance = roundToPrecision(new Decimal(userFinancial.balance).plus(to.amount));
  } else if (toCurrencyBalance) {
    toCurrencyBalance.amount = roundToPrecision(new Decimal(toCurrencyBalance.amount).plus(to.amount));
  } else {
    userFinancial.currencies.push({ code: to.code, amount: roundToPrecision(to.amount) });
  }

  return userFinancial;
}

const handleExchangeErrors = (err) => {
  const errors = {
    status: err.statusCode || 500,
    message: err.statusCode ? err.message : "An unexpected error occurred",
  };

  return errors;
}

module.exports = {
  handleFinancialErrors,
  checkCurrencyCode,
  exchangeValidation,
  checkExchangeCurrencies,
  performExchange,
  handleExchangeErrors,
};