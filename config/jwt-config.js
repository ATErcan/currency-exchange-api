require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_MAX_AGE = parseInt(process.env.JWT_MAX_AGE, 10) || 3600;

if(!JWT_SECRET) {
  throw new Error("JWT_SECRET is required but not set in the environment");
}

module.exports = { JWT_SECRET, JWT_MAX_AGE };