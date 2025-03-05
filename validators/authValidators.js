const { body, validationResult } = require("express-validator");

// signup validation
const signupValidationRules = [
  body("firstname")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isAlpha()
    .withMessage("First name must be alphabetic")
    .isLength({ min: 2, max: 30 })
    .withMessage("First name must be between 2 and 30 characters"),
  body("lastname")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isAlpha()
    .withMessage("Last name must be alphabetic")
    .isLength({ min: 2, max: 30 })
    .withMessage("Last name must be between 2 and 30 characters"),

  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isAlphanumeric()
    .withMessage("Username must be alphanumeric")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 9 })
    .withMessage("Password must be at least 9 characters"),
];

// sign in validation
const signinValidationRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),
  body("username").trim().notEmpty().withMessage("Username Required"),

  body("password").trim().notEmpty().withMessage("Password Required"),
];

//middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, errors: errors.array().map((err) => err.msg) });
  }
  next();
};

module.exports = {
  signupValidationRules,
  signinValidationRules,
  validate,
};