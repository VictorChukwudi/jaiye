import { check } from "express-validator";

const validator = {
  signup: [
    check("fullname", "Fullname field is required")
      .exists()
      .bail()
      .notEmpty()
      .isLength({ min: 6 })
      .trim(),
    check("email", "Email is required (e.g johndoe@email.com) ")
      .exists()
      .bail()
      .notEmpty()
      .isEmail()
      .normalizeEmail(),
    check("password", "Password must be at least 6 characters long")
      .exists()
      .bail()
      .notEmpty()
      .isLength({ min: 6 })
      .matches(/\d/)
      .withMessage("Password must contain at least a digit"),
    check("confirmpassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password does not match");
      }
      return true;
    }),
  ],
  login: [
    check("email", "Email is required")
      .exists()
      .bail()
      .isEmail()
      .normalizeEmail(),
    check("password", "Password is required").exists().bail().not().isEmpty(),
  ],
};

export default validator;
