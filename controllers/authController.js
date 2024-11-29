const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { JWT_SECRET, JWT_MAX_AGE } = require('../config/jwtConfig')

const createToken = (data) => {
  try {
    return jwt.sign(data, JWT_SECRET, { expiresIn: JWT_MAX_AGE });
  } catch (error) {
    throw new Error("Failed to create token");
  }
}

const handleErrors = (err) => {
  const errors = { name: "", email: "", password: "" };
  let status = 400;

  // duplicate email error
  if (err.code === 11000) {
    status = 409;
    errors.email = "Email already in use";
    return {
      status,
      message: errors,
    };
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  // Handle token creation errors
  if (err.message === "Failed to create token") {
    status = 500;
    return {
      status,
      message:
        "An error occurred while generating the token. Please try again.",
    };
  }

  return {
    status,
    message: errors,
  };
}

const signup_post = async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    const user = await User.create({ name, email, password });
    const token = createToken({
      id: user._id,
      name: user.name,
      email: user.email
    });

    res.status(201).json({
      status: "success",
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
    res.status(status).json({ status: "error", error: message });
  }
};

const login_post = async (req, res) => {
  // TODO: create login logic
};

const logout_get = (req, res) => {
  // TODO: create logout logic
};

module.exports = { signup_post, login_post, logout_get };