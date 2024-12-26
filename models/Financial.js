const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
  },
  { timestamps: true }
);

const financialSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  baseCurrency: {
    type: String,
    default: "PLN",
    immutable: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, "Balance cannot be negative"],
  },
  currencies: {
    type: [currencySchema],
    default: [],
  },
});

const Financial = mongoose.model("financial", financialSchema);

module.exports = Financial;
