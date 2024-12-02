const createUser = require("../services/userService");
const { createToken, handleErrors } = require("../utils/auth");

const signup_post = async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    const user = await createUser({ name, email, password });
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