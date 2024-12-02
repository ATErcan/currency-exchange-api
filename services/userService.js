const argon2 = require("argon2");

const Financial = require("../models/Financial");
const User = require("../models/User");

const hashPassword = async (userData) => {
  const user = new User(userData);

  try {
    const hashedPwd = await argon2.hash(user.password, {
      type: argon2.argon2id,
    });
    user.password = hashedPwd;
    return user;
  } catch (error) {
    throw {
      message: "Failed to hash the password",
      statusCode: 500,
    };
  }
}

const createUser = async (userData) => {
  try {
    const user = await hashPassword(userData);
    await user.save();
    
    await Financial.create({
      userId: user._id,
      balance: 0,
      currencies: [],
    });
    return user;
  } catch (error) {
    // duplicate email error
    if (error.code === 11000) {
      throw {
        message: "Email already in use",
        statusCode: 409, // Conflict
      };
    }

    // Other errors
    throw error;
  }
}

module.exports = createUser;