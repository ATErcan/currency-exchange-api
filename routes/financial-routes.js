const { Router } = require("express");

const {
  user_financial_get,
  add_funds_patch,
  exchange_currency_post,
} = require("../controllers/financial-controller");

const router = Router();

router.get("/financial", user_financial_get);
router.patch("/financial/fund", add_funds_patch);
router.post("/financial/exchange", exchange_currency_post);

module.exports = router;
