const jwt = require("jsonwebtoken");

const { JWT_SECRET, JWT_MAX_AGE } = require("../config/jwtConfig");

const createToken = (data) => {
  try {
    return jwt.sign(data, JWT_SECRET, { expiresIn: JWT_MAX_AGE });
  } catch (error) {
    throw new Error("Failed to create token");
  }
};

const handleErrors = (err) => {
  const errors = { name: "", email: "", password: "" };
  let status = 500;

  // duplicate email error
  if (err.code === 11000 || err.message === "Email already in use") {
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
    status = 400;
    return {
      status,
      message: errors,
    };
  }

  // password hashing errors
  if (err.message === "Failed to hash the password") {
    status = err.statusCode || 500;
    return {
      status,
      message:
        "An internal error occurred while processing the password. Please try again.",
    };
  }

  // Handle token creation errors
  if (err.message === "Failed to create token") {
    return {
      status,
      message:
        "An error occurred while generating the token. Please try again.",
    };
  }

  return {
    status,
    message: err.message || "An unexpected error occurred",
  };
};

module.exports = { createToken, handleErrors };
