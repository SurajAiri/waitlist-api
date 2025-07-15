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

    req[property] = value;
    next();
  };
};

export default validateSchema;
