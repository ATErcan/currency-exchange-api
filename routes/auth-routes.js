const { Router } = require("express");

const authController = require("../controllers/auth-controller");

const router = Router();

router.post("/auth/signup", authController.signup_post);
router.post("/auth/login", authController.login_post);
router.get("/auth/logout", authController.logout_get);

module.exports = router;