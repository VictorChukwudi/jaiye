import passport from "passport"
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "express-async-handler"


const googleRedirect =asyncHandler( async (req, res) => {
    const user= await User.findOne({ email: req.user.email })
    const token=generateToken()
    if(!user){
        res.status(500)
        throw new Error("server error")
    }else{
        res.status(200).json({
      status: "Success",
      msg: "Logged In",
      data: {
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        token,
      },
    });
    }
})


export {
    googleRedirect
}