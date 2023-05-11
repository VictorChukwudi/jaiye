import { transporter } from "../../config/nodemailer.js";
import User from "../../models/userModel.js";
import dotenv from "dotenv";
import generateToken from "../generateToken.js";

dotenv.config();
export const signupEmail = async ({ name, email, secret }, req, res) => {
  const protocol = process.env.NODE_ENV == "development" ? "http" : "https";
  const user = await User.findOne({ email });
  const data = {
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  };
  const link = `${protocol}://${req.get("host")}/api/users/${
    user._id
  }/${secret}`;

  const mailOptions = {
    from: process.env.STARTUP_EMAIL,
    to: email,
    subject: "Jaiye Account Verification",
    html: `<p>Click <a href="${link}">here</a> to verify your email. Verification link expires in 15 minutes.</p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.status(500);
      res.json({
        status: "error",
        msg: "verification mail not sent. Check internet connectivity",
      });
    } else {
      res.status(201).json({
        status: "success",
        msg: "Check email for verification",
        data,
      });
    }
  });
};
