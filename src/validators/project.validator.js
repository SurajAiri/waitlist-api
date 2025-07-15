import Joi from "joi";

const projectValidators = {
  create: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      "string.min": "Project name must be at least 2 characters long",
      "string.max": "Project name must not exceed 100 characters",
      "any.required": "Project name is required",
    }),
    slug: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .pattern(/^[a-z0-9-]+$/)
      .required()
      .messages({
        "string.min": "Slug must be at least 2 characters long",
        "string.max": "Slug must not exceed 50 characters",
        "string.pattern.base":
          "Slug can only contain lowercase letters, numbers, and hyphens",
        "any.required": "Slug is required",
      }),
    description: Joi.string().trim().min(10).max(500).required().messages({
      "string.min": "Description must be at least 10 characters long",
      "string.max": "Description must not exceed 500 characters",
      "any.required": "Description is required",
    }),
  }),

  update: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional().messages({
      "string.min": "Project name must be at least 2 characters long",
      "string.max": "Project name must not exceed 100 characters",
    }),
    slug: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .pattern(/^[a-z0-9-]+$/)
      .optional()
      .messages({
        "string.min": "Slug must be at least 2 characters long",
        "string.max": "Slug must not exceed 50 characters",
        "string.pattern.base":
          "Slug can only contain lowercase letters, numbers, and hyphens",
      }),
    description: Joi.string().trim().min(10).max(500).optional().messages({
      "string.min": "Description must be at least 10 characters long",
      "string.max": "Description must not exceed 500 characters",
    }),
    isActive: Joi.boolean().optional(),
  }),
};

export default projectValidators;
