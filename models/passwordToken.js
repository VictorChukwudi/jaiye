import mongoose from "mongoose";
const Schema = mongoose.Schema;
const passwordTokenSchema = Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    trim: true,
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

const passwordToken = mongoose.model("passwordToken", passwordTokenSchema);
export default passwordToken;
