import { Router } from "express";
import {
  activeCheck,
  commentPost,
  createPost,
  delete_comment_of_user,
  deletePost,
  get_comments_by_post,
  getAllPosts,
  increment_likes,
} from "../controllers/posts.controller.js";
import multer from "multer";
import path from "path"; 
import fs from "fs";

const router = Router();

//ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");
    cb(null, Date.now() + "_" + name + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "video/mp4",
    "video/webm",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

router.route("/").get(activeCheck);

// Create a post with optional media
router.route("/post").post(upload.single("media"), createPost);

// Get all posts
router.route("/posts").get(getAllPosts);

// Delete a post
router.route("/delete_post").delete(deletePost);

// Comment on a post
router.route("/comment").post(commentPost);

// Get comments for a post
router.route("/get_comments").get(get_comments_by_post);

// Delete a comment
router.route("/delete_comment").post(delete_comment_of_user);

// Increment likes on a post
router.route("/increment_post_likes").post(increment_likes);

export default router;