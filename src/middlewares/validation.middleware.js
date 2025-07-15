const validateSchema = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.sendResponse(400, {
        message: "Validation failed",
        errors: errors,
      });
    }

    // Only set the property if it's not 'query' (which is read-only)
    if (property !== "query") {
      req[property] = value;
    } else {
      // For query parameters, we can add validated values to a new property
      req.validatedQuery = value;
    }
    next();
  };
};

export default validateSchema;
