const validateSortParam = (sort) => {
  try {
    const sortObj = JSON.parse(sort);

    const validFields = ["updatedAt", "createdAt"];
    for (const field of Object.keys(sortObj)) {
      if (!validFields.includes(field)) {
        throw new Error(`Invalid sort field: ${field}`);
      }
    }
    return sortObj;
  } catch (error) {
    throw createError("Invalid sort parameter. Please provide a valid JSON object.", 400);
  }
}

const handleErrors = (err) => {
  const errors = {
    status: err.statusCode || 500,
    message: err.statusCode ? err.message : "An unexpected error occurred",
  };

  return errors;
}

module.exports = { handleErrors, validateSortParam };