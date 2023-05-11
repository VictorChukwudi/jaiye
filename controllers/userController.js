import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import generateToken from "../utils/generateToken.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { signupEmail } from "../utils/emails/signupEmail.js";
import { generateSecret } from "../utils/generateSecret.js";
import Verification from "../models/mailVerify.js";
import PasswordToken from "../models/passwordToken.js";
import { passwordEmail } from "../utils/emails/passwordEmail.js";
// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json(errors.array());
  } else {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.password) {
      if (await bcrypt.compare(password, user.password)) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user._id),
        });
      } else {
        res.status(401);
        throw new Error("Invalid email or password.");
      }
    } else {
      res.status(401);
      throw new Error("Signup or Login with socials");
    }
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, password, confirmpassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json(errors.array());
  } else {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("Email is already registered. User already exists");
    }

    const user = new User({
      fullname, //fullname is required ,e.g Firstname Lastname
      email,
      password,
    });

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          res.status(500);
          throw new Error("error occurred while password hashing");
        } else {
          user.password = hash;
          user.save().then((result) => {
            const fullname = user.fullname.split("")[1];
            const email = user.email;
            // generating secret for email verification
            const secret = generateSecret();
            //hashing secret and storing it synchronously for email verification
            const secretSalt = bcrypt.genSaltSync(10);
            const secretHash = bcrypt.hashSync(secret, secretSalt);

            //Verification code, created date and expiration date
            new Verification({
              userID: result._id,
              secret: secretHash,
              createdAt: Date.now(),
              expiresAt: Date.now() + 900000,
            }).save();
            signupEmail({ fullname, email, secret }, req, res);
          });
        }
      });
    });
  }
});

// @desc verify email on signup
// @route Get /api/users/verify
// @access Private
const verifySignupMail = asyncHandler(async (req, res) => {
  const { userID, secret } = req.params;
  const user = await User.findById(userID).select(["-password", "-__v"]);
  //Check whether user exists or not
  if (!user) {
    res.status(404);
    throw new Error("user does not exists");
  } else {
    if (user.emailVerified) {
      res.status(200).json({
        status: "success",
        msg: "email has already been verified",
      });
    } else {
      const details = await Verification.findOne({ userID: userID });
      console.log(details.expiresAt);
      //checking if verification token has expired
      if (details.expiresAt < Date.now()) {
        Verification.deleteMany({ userID });
        res.status(400);
        throw new Error("Verification link has expired");
      } else {
        console.log(secret);
        console.log(details.secret);
        const checkSecret = await bcrypt.compare(
          secret.toString(),
          details.secret
        );
        if (!checkSecret) {
          res.status(400);
          throw new Error("Invalid verification link");
        } else {
          const updateUser = await User.findByIdAndUpdate(
            userID,
            {
              emailVerified: true,
            },
            { new: true }
          ).select(["-password", "-__v"]);
          await Verification.findOneAndDelete({ userID });
          res.status(200).json({
            status: "success",
            msg: "email successfully verified",
            data: updateUser,
          });
        }
      }
    }
  }
});

// @desc resend verification mail
// @route POST /api/users/resendMail
// @access Private
const resendSignupMail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("enter your registered email address");
  } else {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error("email is not registered. signup");
    } else {
      const fullname = user.fullname.split("")[1];
      // generating secret for email verification
      const secret = generateSecret();
      //hashing secret and storing it synchronously for email verification
      const secretSalt = bcrypt.genSaltSync(10);
      const secretHash = bcrypt.hashSync(secret, secretSalt);

      await new Verification({
        userID: user._id,
        secret: secretHash,
        createdAt: Date.now(),
        expiresAt: Date.now() + 180000,
      }).save();
      signupEmail({ fullname, email, secret }, req, res);
    }
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("enter your registered email address");
  } else {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error("email is not registered. signup");
    } else {
      // generating secret for email verification
      const secret = generateSecret();
      //hashing secret and storing it synchronously for email verification
      const secretSalt = bcrypt.genSaltSync(10);
      const secretHash = bcrypt.hashSync(secret, secretSalt);
      console.log(secret);
      console.log(secretHash);
      new PasswordToken({
        userID: user._id,
        secret: secretHash,
        createdAt: Date.now(),
        expiresAt: Date.now() + 900000,
      }).save();

      passwordEmail({ email, secret }, req, res);
    }
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { userID, secret } = req.params;
  const { password, confirmpassword } = req.body;
  if (!password || !confirmpassword) {
    res.status(400);
    throw new Error("password and confirmpassword fields are empty");
  } else {
    const user = await User.findById(userID);
    if (!user) {
      res.status(404);
      throw new Error("user does not exist");
    } else {
      const token = await PasswordToken.findOne({ userID });
      if (!token) {
        res.status(400);
        throw new Error("invalid link");
      } else {
        if (
          token.expiresAt < Date.now() ||
          !(await bcrypt.compare(secret, token.secret))
        ) {
          await PasswordToken.deleteMany({ userID });
          res.status(400);
          throw new Error("Invalid link or link has expired");
        } else {
          const newPassword = await bcrypt.hash(password, 10);
          await User.findByIdAndUpdate(userID, {
            $set: { password: newPassword },
          });
          await PasswordToken.findOneAndDelete({ userID });
          res.status(200).json({
            status: "success",
            msg: "password successfully reset.",
          });
        }
      }
    }
  }
});
//
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.remove();
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  authUser,
  registerUser,
  verifySignupMail,
  resendSignupMail,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
};
