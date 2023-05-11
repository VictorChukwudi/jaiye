import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: process.env.SERVICE,
  auth: {
    user: process.env.STARTUP_EMAIL,
    pass: process.env.STARTUP_EMAIL_PASSWORD,
  },
});
