const User = require("../models/User");
const { createError } = require("../utils/common");
const { handleErrors } = require("../utils/user");

const user_get = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findOne({ _id: userId });
    if(!user) {
      throw createError("User not found! If this error persist, please contact support", 404)
    }
    const { password, ...userData } = user._doc;
    res.status(200).json({
      data: userData
    });
  } catch (error) {
    const { status, message } = handleErrors(error);
    res.status(status).json({ message });
  }
}

module.exports = { user_get }