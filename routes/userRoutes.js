import express from "express";
import passport from "passport";
const router = express.Router();
import {
  authUser,
  registerUser,
  verifySignupMail,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  resendSignupMail,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import validator from "../middleware/validator.js";

router
  .route("/")
  .post(validator.signup, registerUser)
  .get(protect, admin, getUsers);
router.get("/:userID/:secret", validator.login, verifySignupMail);
router.post("/resend-mail", resendSignupMail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:userID/:secret", resetPassword);
router.post("/login", validator.login,authUser);


router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router
  .route("/:id")
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

export default router;
