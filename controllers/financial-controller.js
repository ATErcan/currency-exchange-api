const Financial = require("../models/Financial");

const { createError } = require("../utils/common");
const { decodeToken } = require("../utils/auth");
const { handleErrors } = require("../utils/financial");

const user_financial_get = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ status: "error", message: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = decodeToken(token);
    } catch (error) {
      throw error;
    }

    const userId = decoded.id;

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

module.exports = { user_financial_get }