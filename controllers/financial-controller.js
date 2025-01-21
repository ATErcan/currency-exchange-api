const Financial = require("../models/Financial");
const { createError } = require("../utils/common");
const { handleFinancialErrors, handleExchangeErrors } = require("../utils/financial");
const { addFunds, exchangeCurrency } = require("../services/financial-service");

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
    const { status, message } = handleFinancialErrors(error);
    res.status(status).json({ message });
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
        baseCurrency: userFinancial.baseCurrency
      },
    });
  } catch (error) {
    const { status, message } = handleFinancialErrors(error);
    res.status(status).json({ message });
  }
}

const exchange_currency_post = async (req, res) => {
  try {
    const userId = req.userId;
    const { from, to, rate } = req.body;
    const type = "exchange";

    const { userFinancial, newTransaction } = await exchangeCurrency(userId, type, from, to, rate);

    res.status(200).json({
      data: {
        financial: {
          balance: userFinancial.balance,
          baseCurrency: userFinancial.baseCurrency,
          currencies: userFinancial.currencies
        },
        transaction: newTransaction
      }
    })
  } catch (error) {
    const { status, message } = handleExchangeErrors(error);
    res.status(status).json({ message });
  }
}

module.exports = {
  user_financial_get,
  add_funds_patch,
  exchange_currency_post,
};