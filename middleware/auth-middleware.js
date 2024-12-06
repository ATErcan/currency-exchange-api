const { decodeToken } = require("../utils/auth");

const verifyUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: "error", error: "Unauthorized access" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = decodeToken(token);
    req.userId = decoded.id;
    next();
  } catch (error) {
    const { message, statusCode } = error;
    return res.status(statusCode).json({ status: "error", message });
  }
}

module.exports = verifyUser;