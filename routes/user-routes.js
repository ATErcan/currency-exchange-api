const { Router } = require("express");

const userController = require("../controllers/user-controller");

const router = Router();

router.get("/users/me", userController.user_get);
router.patch("/users/me", userController.user_patch);
router.get("/users/me/transactions", userController.all_transactions_get);

module.exports = router;