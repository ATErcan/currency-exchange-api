const mongoose = require("mongoose");

const Financial = require("../models/Financial");
const Transaction = require("../models/Transaction");
const { createError } = require("../utils/common");
const { handleErrors } = require("../utils/financial");

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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.userId;
    const { amount } = req.body;

    if (amount < 1 || typeof amount !== "number" || isNaN(amount)) {
      throw createError("Invalid fund amount", 400);
    }

    const userFinancial = await Financial.findOne({ userId }).session(session);
    if (!userFinancial) {
      throw createError("User financial data not found! If this error persist, please contact support", 404);
    }

    userFinancial.balance += amount;
    const newTransaction = new Transaction({
      userId,
      type: "fund",
      amount,
    })

    await userFinancial.save({ session });
    await newTransaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      data: {
        transaction: newTransaction,
        balance: userFinancial.balance,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    const { status, message } = handleErrors(error);
    res.status(status).json({ status: "error", error: message })
  }
}

module.exports = { user_financial_get, add_funds_patch };