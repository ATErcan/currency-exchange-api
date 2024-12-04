const handleErrors = (err) => {
  const errors = { status: 500, message: "An unexpected error occurred" };

  if (err.message === "Invalid or expired token") {
    errors.status = 401;
    errors.message = err.message;
    return errors;
  }

  if (err.message === "Failed to decode token") {
    errors.message = "Something went wrong! Please try again later";
    return errors
  }

  return errors;
}

module.exports = { handleErrors };