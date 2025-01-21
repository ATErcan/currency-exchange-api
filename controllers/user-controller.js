const { TRANSACTION_PAGE_LIMIT, TRANSACTION__SORT } = require("../lib/constants");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { createError } = require("../utils/common");
const { handleErrors, validateSortParam } = require("../utils/user");

const user_get = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findOne({ _id: userId });
    if(!user) {
      throw createError("User not found! If this error persist, please contact support", 404)
    }
    const { password, ...userData } = user._doc;
    res.status(200).json({
      data: userData
    });
  } catch (error) {
    const { status, message } = handleErrors(error);
    res.status(status).json({ message });
  }
}

const all_transactions_get = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findOne({ _id: userId });
    if(!user) {
      throw createError("User not found! If this error persist, please contact support", 404)
    }

    const { page = 1, limit = TRANSACTION_PAGE_LIMIT, sort = TRANSACTION__SORT } = req.query;
    
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    
    const sortObj = validateSortParam(sort);

    const totalTransactions = await Transaction.countDocuments({ userId });

    const transactions = await Transaction.find({ userId })
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      currentPage: pageNum,
      totalPages: Math.ceil(totalTransactions / limitNum),
      totalTransactions,
      data: transactions,
    });
  } catch (error) {
    const { status, message } = handleErrors(error);
    res.status(status).json({ message });
  }
}

module.exports = { user_get, all_transactions_get };