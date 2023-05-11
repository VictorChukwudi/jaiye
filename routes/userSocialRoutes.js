import express from "express";
import passport from "passport";
const router = express.Router();

import {googleRedirect} from "../controllers/userSocialController.js"

router.get("/social/google",passport.authenticate("google", { scope: ["profile", "email"] }))

router.get(
  "/social/google.auth",
  passport.authenticate("google"),
  googleRedirect
);




export default router;