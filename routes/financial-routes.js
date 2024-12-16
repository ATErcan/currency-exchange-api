const { Router } = require("express");

const {
  user_financial_get,
  add_funds_patch,
} = require("../controllers/financial-controller");

const router = Router();

router.get("/financial", user_financial_get);
router.patch("/financial/fund", add_funds_patch);

module.exports = router;
