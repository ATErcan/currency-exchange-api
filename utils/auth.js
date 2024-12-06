const jwt = require("jsonwebtoken");

const { JWT_SECRET, JWT_MAX_AGE } = require("../config/jwt-config");
const { createError } = require("./common");

const createToken = (data) => {
  try {
    return jwt.sign(data, JWT_SECRET, { expiresIn: JWT_MAX_AGE });
  } catch (error) {
    throw new Error("Failed to create token");
  }
};

const decodeToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw createError("Token has expired", 401);
    }
    if (error.name === "JsonWebTokenError") {
      throw createError("Invalid token", 401);
    }
    throw createError("Failed to decode token", 500);
  }
}

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

  // invalid credentials
  if(err.message === "Invalid email or password") {
    status = err.statusCode || 500;
    return {
      status,
      message: err.message
    }
  }

  return {
    status,
    message: err.message || "An unexpected error occurred",
  };
};

module.exports = { createToken, decodeToken, handleErrors };
