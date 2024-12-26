const Financial = require("../models/Financial");
const { createError } = require("../utils/common");
const { handleErrors, checkCurrencyCode } = require("../utils/financial");
const { addFunds } = require("../services/financial-service");
const { getAllCurrencies } = require("../utils/api");

const user_financial_get = async (req, res) => {
  try {
    const userId = req.userId;

    const userFinancial = await Financial.findOne({ userId });
    if(!userFinancial) {
      throw createError("User financial data not found! If this error persist, please contact support", 404)
    }

    res.status(200).json({
      data: userFinancial
    })
  } catch (error) {
    const { status, message } = handleErrors(error);
    res.status(status).json({ status: "error", error: message });
  }
}

const add_funds_patch = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount } = req.body;
    const type = "fund";

    const { newTransaction, userFinancial } = await addFunds(userId, type, amount);

    res.status(200).json({
      data: {
        transaction: newTransaction,
        balance: userFinancial.balance,
      },
    });
  } catch (error) {
    const { status, message } = handleErrors(error);
    res.status(status).json({ status: "error", error: message })
  }
}

const exchange_currency_post = async (req, res) => {
  const userId = req.userId;
  const { from, to, rate } = req.body;

  try {
    const exchangeRate = Number((from.mid / to.mid).toFixed(3));
    if(rate !== exchangeRate) {
      throw createError("Exchange rate is outdated or tampered", 400);
    }
  
    const [tableA, tableB] = await getAllCurrencies();
  
    const fromCurrency =
      checkCurrencyCode(tableA?.value?.rates, from.code) ??
      checkCurrencyCode(tableB?.value?.rates, from.code);
    const toCurrency =
      checkCurrencyCode(tableA?.value?.rates, to.code) ??
      checkCurrencyCode(tableB?.value?.rates, to.code);
  
    if(!fromCurrency || !toCurrency) {
      throw createError(
        `Currency not found: ${
          !fromCurrency ? `${from.code}` : `${to.code}`
        } Currency is not valid or is not currently available.`,
        400
      );
    }
    
    res.send("Hello");
  } catch (error) {
    
  }
}

module.exports = {
  user_financial_get,
  add_funds_patch,
  exchange_currency_post,
};