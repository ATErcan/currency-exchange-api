const mongoose = require("mongoose");
const { isEmail } = require("validator");

const currencySchema = new mongoose.Schema({
  currency: {
    type: String,
    required: true,
    uppercase: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
}, { timestamps: true });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [30, "Name must be at most 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: [isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
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
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

module.exports = User;