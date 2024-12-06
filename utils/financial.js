const handleErrors = (err) => {
  const errors = { status: 500, message: "An unexpected error occurred" };

  if(err.statusCode === 404) {
    errors.status = 404;
    errors.message = err.message;
  }

  return errors;
}

module.exports = { handleErrors };