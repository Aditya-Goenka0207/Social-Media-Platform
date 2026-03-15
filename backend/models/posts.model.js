import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensures every post is linked to a user
      index: true, 
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000, 
    },
    likes: {
      type: Number,
      default: 0,
      min: 0, // prevents negative like values
    },
    media: {
      type: String,
      default: "",
    },
    fileType: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);


PostSchema.index({ createdAt: -1 });
PostSchema.index({ userId: 1, createdAt: -1 });

const Post = mongoose.model("Post", PostSchema);

export default Post;