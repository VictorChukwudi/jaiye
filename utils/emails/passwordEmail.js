import { transporter } from "../../config/nodemailer.js";
import User from "../../models/userModel.js";
import dotenv from "dotenv";
import generateToken from "../generateToken.js";

dotenv.config();
export const passwordEmail = async ({ email, secret }, req, res) => {
  const protocol = process.env.NODE_ENV == "development" ? "http" : "https";
  const user = await User.findOne({ email });
  const link = `${protocol}://${req.get("host")}/api/users/reset-password/${
    user._id
  }/${secret}`;

  const mailOptions = {
    from: process.env.STARTUP_EMAIL,
    to: email,
    subject: "Request To Reset Password",
    html: `<p>Click <a href="${link}">here</a> to reset password. Link expires in 15 minutes.</p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.status(500);
      res.json({
        status: "error",
        msg: " Password reset mail not sent. Check internet connectivity",
      });
    } else {
      res.status(201).json({
        status: "success",
        msg: "Check email for to reset your password.",
      });
    }
  });
};
