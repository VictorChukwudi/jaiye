import pkg from "mongoose";
const { model, Schema } = pkg;

const userSchema = Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      // required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // Google and Facebook IDs for Social Signins
    google_ID: {
    type: String,
    sparse: true,
  },
  facebook_ID: {
    type: String,
    sparse: true,
  }
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

export default User;
