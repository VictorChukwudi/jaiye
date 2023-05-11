import Jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const generateToken = (id) => {
  return Jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
};

export default generateToken;
