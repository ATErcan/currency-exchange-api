const NBP_WEB_API = "https://api.nbp.pl/api/exchangerates";

const PRECISION = 6;
const TOLERANCE = 0.000001;

const TRANSACTION_PAGE_LIMIT = 8;
const TRANSACTION__SORT = '{"createdAt": -1}';

module.exports = {
  NBP_WEB_API,
  PRECISION,
  TOLERANCE,
  TRANSACTION_PAGE_LIMIT,
  TRANSACTION__SORT,
};