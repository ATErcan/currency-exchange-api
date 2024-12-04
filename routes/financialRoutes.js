const { Router } = require("express");

const { user_financial_get } = require('../controllers/financialController');

const router = Router();

router.get("/financial", user_financial_get);

module.exports = router;
