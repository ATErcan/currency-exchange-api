const handleErrors = (err) => {
  const errors = { status: 500, message: "An unexpected error occurred" };

  if (err.message.includes("User not found!")) {
    errors.status = err.statusCode;
    errors.message = err.message;
    return errors;
  }

  return errors;
}

module.exports = { handleErrors }