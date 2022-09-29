const Joi = require('joi');

module.exports = {
  signUpValidation: Joi.object({
    name: Joi.string().max(20).min(3).required(),
    email: Joi.string().email().required(),
    role: Joi.string().required(),
    password: Joi.string().min(8).required(),
    passwordConfirm: Joi.string().min(8).required(),
    language:Joi.string(),
    level:Joi.number(),
  }),
  loginValidation: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
  updateValidation: Joi.object({
    name: Joi.string().max(20).min(2),
    email: Joi.string().email(),
  }),
};
