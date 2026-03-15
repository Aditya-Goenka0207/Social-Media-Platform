import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 50,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      // match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"], // CHANGED: basic email validation
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6, 
    },
    profilePicture: {
      type: String,
      default: "default.jpg",
    },
    token: {
      type: String,
      default: "",
      index: true,
    },
  },
  { timestamps: true }
);

UserSchema.index({ username: 1, email: 1 });

const User = mongoose.model("User", UserSchema);

export default User;