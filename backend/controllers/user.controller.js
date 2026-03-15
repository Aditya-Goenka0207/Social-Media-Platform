import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import ConnectionRequest from "../models/connections.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";

// utility to generate PDF and wait until file writing finishes
const convertUserDataToPDF = async (userData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
    const fullOutputPath = path.join("uploads", outputPath);
    const stream = fs.createWriteStream(fullOutputPath);

    doc.pipe(stream);

    if (
      userData?.userId?.profilePicture &&
      fs.existsSync(path.join("uploads", userData.userId.profilePicture))
    ) {
      doc.image(path.join("uploads", userData.userId.profilePicture), {
        align: "center",
        width: 100,
      });
      doc.moveDown();
    }

    doc.fontSize(14).text(`Name: ${userData?.userId?.name || ""}`);
    doc.fontSize(14).text(`Username: ${userData?.userId?.username || ""}`);
    doc.fontSize(14).text(`Email: ${userData?.userId?.email || ""}`);
    doc.fontSize(14).text(`Bio: ${userData?.bio || ""}`);
    doc.fontSize(14).text(`Current Position: ${userData?.currentPost || ""}`);
    doc.fontSize(14).text(`Past Work:`);

    if (userData.pastWork && userData.pastWork.length > 0) {
      userData.pastWork.forEach((work) => {
        doc.fontSize(14).text(`Company Name: ${work.company || ""}`);
        doc.fontSize(14).text(`Position: ${work.position || ""}`);
        doc.fontSize(14).text(`Years: ${work.years || ""}`);
        doc.moveDown(0.5);
      });
    } else {
      doc.fontSize(14).text("No past work added");
    }

    doc.end();

    //wait for stream to finish before returning filename
    stream.on("finish", () => resolve(outputPath));
    stream.on("error", (error) => reject(error));
  });
};

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim().toLowerCase();

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long!" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: trimmedEmail }, { username: trimmedUsername }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: trimmedName,
      email: trimmedEmail,
      username: trimmedUsername,
      password: hashedPassword,
    });

    await newUser.save();

    const profile = new Profile({ userId: newUser._id });
    await profile.save();

    return res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    if (!user.password) {
      return res.status(500).json({ message: "Stored password not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.token = token;
    await user.save();

    return res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture || "",
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ message: "Token is required!" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Profile picture is required!" });
    }

    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found!" });

    user.profilePicture = req.file.filename;
    await user.save();

    return res.status(200).json({
      message: "Profile Picture Updated!",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update user basic data
export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required!" });
    }

    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found!" });

    if (newUserData.username) {
      newUserData.username = newUserData.username.trim().toLowerCase();
    }

    if (newUserData.email) {
      newUserData.email = newUserData.email.trim().toLowerCase();
    }

    if (newUserData.name) {
      newUserData.name = newUserData.name.trim();
    }

    const orConditions = [];
    if (newUserData.username)
      orConditions.push({ username: newUserData.username });
    if (newUserData.email) orConditions.push({ email: newUserData.email });

    // only run duplicate check if username/email is being updated
    if (orConditions.length > 0) {
      const existingUser = await User.findOne({
        $or: orConditions,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Username or email already taken" });
      }
    }

    Object.assign(user, newUserData);
    await user.save();

    return res.status(200).json({ message: "User Profile Updated!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get user and profile
export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required!" });
    }

    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found!" });

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture bio currentPost",
    );

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found!" });
    }

    return res.status(200).json({ userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update profile data
export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required!" });
    }

    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found!" });

    let profileToUpdate = await Profile.findOne({ userId: user._id });

    if (!profileToUpdate) {
      profileToUpdate = new Profile({ userId: user._id });
    }

    Object.assign(profileToUpdate, newProfileData);
    await profileToUpdate.save();

    return res.status(200).json({ message: "Profile Updated!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all profiles
export const getAllUserProfile = async (req, res) => {
  try {
    const profiles = await Profile.find({})
      .populate("userId", "name username email profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({ profiles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Download user profile as PDF
export const downloadProfile = async (req, res) => {
  const user_id = req.query.id;

  try {
    if (!user_id) {
      return res.status(400).json({ message: "User id is required!" });
    }

    const userProfile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name username email profilePicture",
    );

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found!" });
    }

    const outputPath = await convertUserDataToPDF(userProfile);

    return res.status(200).json({ message: outputPath });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Send connection request
export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;

  try {
    if (!token || !connectionId) {
      return res
        .status(400)
        .json({ message: "Token and connectionId are required!" });
    }

    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found!" });

    // prevent self connection request
    if (user._id.toString() === connectionId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot send a connection request to yourself" });
    }

    const connectionUser = await User.findById(connectionId);
    if (!connectionUser) {
      return res.status(404).json({ message: "Connection user not found!" });
    }

    // check request in both directions
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { userId: user._id, connectionId: connectionUser._id },
        { userId: connectionUser._id, connectionId: user._id },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Request already exists" });
    }

    const request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    await request.save();

    return res.status(201).json({ message: "Request Sent", request });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get my sent connection requests
export const getMyConnectionRequest = async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ message: "Token is required!" });
    }

    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found!" });

    const connections = await ConnectionRequest.find({
      userId: user._id,
    })
      .populate("connectionId", "name username email profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({ connections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get connections where I am the receiver
export const whatAreMyConnections = async (req, res) => {
  const { token } = req.query;

  try {
    if (!token) {
      return res.status(400).json({ message: "Token is required!" });
    }

    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found!" });

    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    })
      .populate("userId", "name username email profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({ connections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Accept or reject connection request
export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.body;

  try {
    if (!token || !requestId || !action_type) {
      return res.status(400).json({
        message: "Token, requestId and action_type are required!",
      });
    }

    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found!" });

    const connection = await ConnectionRequest.findById(requestId);
    if (!connection) {
      return res.status(404).json({ message: "Connection not found!" });
    }

    // only receiver can accept/reject request
    if (connection.connectionId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    if (action_type === "accept") {
      connection.status_accepted = true;
      await connection.save();
      return res.status(200).json({ message: "Request Accepted!" });
    }

    if (action_type === "reject") {
      await ConnectionRequest.deleteOne({ _id: requestId });
      return res.status(200).json({ message: "Request Rejected!" });
    }

    return res
      .status(400)
      .json({ message: "Invalid action_type. Use accept or reject" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Comment on post
export const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body;

  try {
    if (!token || !post_id || !commentBody || !commentBody.trim()) {
      return res.status(400).json({
        message: "Token, post_id and commentBody are required!",
      });
    }

    const user = await User.findOne({ token }).select("_id");
    if (!user) return res.status(404).json({ message: "User not found!" });

    const post = await Post.findById(post_id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = new Comment({
      userId: user._id,
      postId: post._id,
      comment: commentBody.trim(),
    });

    await comment.save();

    return res.status(201).json({
      message: "Comment added",
      comment,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get user profile by username
export const getUserProfileAndUserBasedOnUsername = async (req, res) => {
  const { username } = req.query;

  try {
    if (!username) {
      return res.status(400).json({ message: "Username is required!" });
    }

    const user = await User.findOne({
      username: username.trim().toLowerCase(),
    });
    if (!user) return res.status(404).json({ message: "User not found!" });

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture bio currentPost",
    );

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found!" });
    }

    return res.status(200).json({ profile: userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
