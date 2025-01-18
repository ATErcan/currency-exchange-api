const argon2 = require("argon2");

const User = require("../models/User");
const createUser = require("../services/user-service");
const { createToken, handleErrors } = require("../utils/auth");
const { createError } = require("../utils/common");

const signup_post = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await createUser({ name, email, password });
    const token = createToken({
      id: user._id,
      name: user.name,
      email: user.email,
    });

    res.status(201).json({
      jwt: {
        token,
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    const { status, message } = handleErrors(error);
    res.status(status).json({ message });
  }
};

const login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      throw createError("Invalid email or password", 401);
    }

    if (await argon2.verify(user.password, password)) {
      const token = createToken({
        id: user._id,
        name: user.name,
        email: user.email,
      });
      res.status(200).json({
        jwt: {
          token,
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      throw createError("Invalid email or password", 401);
    }
  } catch (error) {
    const { status, message } = handleErrors(error);
    res.status(status).json({ message })
  }
};

const logout_get = (req, res) => {
  // TODO: create logout logic
};

module.exports = { signup_post, login_post, logout_get };
