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
    res.send("Hello");
  } catch (error) {
    
  }
}

module.exports = {
  user_financial_get,
  add_funds_patch,
  exchange_currency_post,
};