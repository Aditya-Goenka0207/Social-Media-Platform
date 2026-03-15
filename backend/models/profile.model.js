import mongoose from "mongoose";

//schema for education
const EducationSchema = new mongoose.Schema(
  {
    school: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    degree: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    fieldOfStudy: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
  },
  { _id: false }
);

//schema for past work
const WorkSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    position: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    years: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
  },
  { _id: false }
);

// Main profile schema
const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensure profile is always linked to a user
      index: true,
      unique: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    currentPost: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    pastWork: {
      type: [WorkSchema],
      default: [],
    },
    education: {
      type: [EducationSchema],
      default: [],
    },
  },
  { timestamps: true }
);

ProfileSchema.index({ userId: 1 });

const Profile = mongoose.model("Profile", ProfileSchema);
export default Profile;