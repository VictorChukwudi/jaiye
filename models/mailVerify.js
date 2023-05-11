import mongoose from "mongoose";
const Schema = mongoose.Schema;
const verificationSchema = Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    trim: true,
    unique: false,
  },
  secret: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
});

const Verification = mongoose.model("Verification", verificationSchema);
export default Verification;
