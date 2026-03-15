import { Router } from "express";
import {
  acceptConnectionRequest,
  downloadProfile,
  getAllUserProfile,
  getMyConnectionRequest,
  getUserAndProfile,
  getUserProfileAndUserBasedOnUsername,
  login,
  register,
  sendConnectionRequest,
  updateProfileData,
  updateUserProfile,
  uploadProfilePicture,
  whatAreMyConnections,
} from "../controllers/user.controller.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

//ensure uploads folder exists before saving files
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Multer storage config for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder to save uploaded files
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
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Routes

// Upload profile picture
router
  .route("/update_profile_picture")
  .post(upload.single("profile_picture"), uploadProfilePicture);

// Authentication
router.route("/register").post(register);
router.route("/login").post(login);

// User updates
router.route("/user_update").post(updateUserProfile);
router.route("/update_profile_data").post(updateProfileData);

// Fetch user/profile data
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/user/get_all_users").get(getAllUserProfile);
router.route("/user/download_resume").get(downloadProfile);
router
  .route("/user/get_profile_based_on_username")
  .get(getUserProfileAndUserBasedOnUsername);

// Connection requests
router.route("/user/send_connection_request").post(sendConnectionRequest);
router.route("/user/getConnectionRequests").post(getMyConnectionRequest);
router.route("/user/user_connection_request").get(whatAreMyConnections);
router.route("/user/accept_connection_request").post(acceptConnectionRequest);

export default router;