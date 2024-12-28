const Financial = require("../models/Financial");
const { getAllCurrencies } = require("./api");
const { createError } = require("./common");

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

const exchangeValidation = (from, to, rate) => {
  if (from.code === to.code) {
    throw createError("Invalid currency transaction", 400);
  }

  // TODO: small exchange rates like 0.00034 will break the calculation, fix it
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
    userFinancial.balance -= from.amount;
  } else {
    if (!fromCurrencyBalance || fromCurrencyBalance.amount < from.amount) {
      throw createError("You do not have sufficient funds in the currency you selected.", 400);
    }
    fromCurrencyBalance.amount -= from.amount;
  }

  if (to.code === userFinancial.baseCurrency) {
    userFinancial.balance += to.amount;
  } else if (toCurrencyBalance) {
    toCurrencyBalance.amount += to.amount;
  } else {
    userFinancial.currencies.push({ code: to.code, amount: to.amount });
  }

  return userFinancial;
}

const handleExchangeErrors = (err) => {
  const errors = { status: 500, message: "An unexpected error occurred" };

  if (err.message.includes("User financial data not found!")) {
    errors.status = err.statusCode;
    errors.message = err.message;
    return errors;
  }

  if(err.message === "Invalid currency transaction") {
    errors.status = err.statusCode;
    errors.message = err.message;
    return errors;
  }

  if (err.message.includes("NBP API tables are unavailable")) {
    errors.status = err.statusCode;
    errors.message = err.message;
    return errors;
  }

  if (err.message.includes("Failed to fetch currency rates")) {
    errors.status = err.statusCode;
    errors.message = err.message;
    return errors;
  }

  if (err.message.includes("Currency not found")) {
    errors.status = err.statusCode;
    errors.message = err.message;
    return errors;
  }

  if (err.message === "Exchange rate is outdated or tampered") {
    errors.status = err.statusCode;
    errors.message = err.message;
    return errors;
  }

  if (err.message === "Exchange rate is outdated or tampered") {
    errors.status = err.statusCode;
    errors.message = err.message;
    return errors;
  }

  if (err.message.includes("The exchange amounts do not match the expected calculation")) {
    errors.status = err.statusCode;
    errors.message = err.message;
    return errors;
  }

  if (err.message.includes("The amount is too low to process with the current exchange rate")) {
    errors.status = err.statusCode;
    errors.message = err.message;
    return errors;
  }

  if (err.message.includes("You do not have sufficient funds")) {
    errors.status = err.statusCode;
    errors.message = err.message;
    return errors;
  }

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