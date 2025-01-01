const mongoose = require("mongoose");

const { isExchange } = require("../utils/transaction");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["fund", "exchange"],
      required: [true, "Unknown operation"],
    },
    amount: {
      type: Number,
      required: [!isExchange, "Missing fund amount"],
    },
    from: {
      code: {
        type: String,
        required: [isExchange, "Missing sold currency data"],
      },
      amount: {
        type: Number,
        required: [isExchange, "Missing sold currency data"],
      },
    },
    to: {
      code: {
        type: String,
        required: [isExchange, "Missing bought currency data"],
      },
      amount: {
        type: Number,
        required: [isExchange, "Missing bought currency data"],
      },
    },
    exchangeRate: {
      type: Number,
      required: [isExchange, "Missing exchange rate data"],
    },
  },
  { timestamps: { createdAt: true } }
);

const Transaction = mongoose.model("transaction", transactionSchema);

module.exports = Transaction;