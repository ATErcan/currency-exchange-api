const handleErrors = (err) => {
  const errors = { status: 500, message: "An unexpected error occurred" };

  if (err.message.includes("User financial data not found!")) {
    errors.status = err.statusCode;
    errors.message = err.message;
    return errors;
  }

  if(err.message === "Invalid fund amount") {
    errors.status = err.statusCode;
    errors.message = err.message;
    return errors;
  }

  return errors;
}

const checkCurrencyCode = (table, code) =>
  table.find((currency) => currency.code === code);

module.exports = { handleErrors, checkCurrencyCode };