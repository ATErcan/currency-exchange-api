const Transaction = require("../models/Transaction");
const Financial = require("../models/Financial");
const { executeWithTransaction, createError } = require("../utils/common");

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

module.exports = { addFunds }