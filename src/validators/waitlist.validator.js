import Joi from "joi";

const waitlistValidators = {
  create: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    name: Joi.string().trim().min(2).max(100).required().messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name must not exceed 100 characters",
      "any.required": "Name is required",
    }),
    extra: Joi.string().trim().max(500).optional().allow("").messages({
      "string.max": "Extra information must not exceed 500 characters",
    }),
    projectId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "Please provide a valid project ID",
        "any.required": "Project ID is required",
      }),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().optional(),
    sortBy: Joi.string()
      .valid("createdAt", "name", "email")
      .default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  }),
};

export default waitlistValidators;
