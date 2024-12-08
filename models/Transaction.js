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
      default: null
    },
    from: {
      currency: {
        type: String,
        required: [isExchange, "Missing sold currency data"],
      },
      amount: {
        type: Number,
        required: [isExchange, "Missing sold currency data"],
      },
      default: null,
    },
    to: {
      currency: {
        type: String,
        required: [isExchange, "Missing bought currency data"],
      },
      amount: {
        type: Number,
        required: [isExchange, "Missing bought currency data"],
      },
      default: null,
    },
    exchangeRate: {
      type: Number,
      required: [isExchange, "Missing exchange rate data"],
      default: null,
    },
  },
  { timestamps: { createdAt: true } }
);

const Transaction = mongoose.model("transaction", transactionSchema);

module.exports = Transaction;