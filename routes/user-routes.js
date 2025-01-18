const { Router } = require("express");

const userController = require("../controllers/user-controller");

const router = Router();

router.get("/users/me", userController.user_get);

module.exports = router;