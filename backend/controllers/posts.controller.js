import User from "../models/user.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";

// Simple health check
export const activeCheck = async (req, res) => {
  return res.status(200).json({ message: "RUNNING" });
};

// Create a post
export const createPost = async (req, res) => {
  const { token, body } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ message: "Token is required!" });
    }
    if ((!body || !body.trim()) && !req.file) {
      return res
        .status(400)
        .json({ message: "Post body or media is required!" });
    }

    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found!" });

    const post = new Post({
      userId: user._id,
      body: body ? body.trim() : "",
      media: req.file ? req.file.filename : "",
      fileType:
        req.file && req.file.mimetype ? req.file.mimetype.split("/")[1] : "",
    });

    await post.save();

    return res.status(201).json({
      message: "Post Created!",
      post,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    //sorting so latest posts appear first
    const posts = await Post.find({})
      .populate("userId", "name username email profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({ posts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  const { token, post_id } = req.body;

  try {
    if (!token || !post_id) {
      return res
        .status(400)
        .json({ message: "Token and post_id are required!" });
    }

    const user = await User.findOne({ token }).select("_id");
    if (!user) return res.status(404).json({ message: "User not found!" });

    const post = await Post.findById(post_id);
    if (!post) return res.status(404).json({ message: "Post not found!" });

    if (post.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // delete related comments also when post is deleted
    await Comment.deleteMany({ postId: post_id });
    await Post.deleteOne({ _id: post_id });

    return res.status(200).json({ message: "Post Deleted!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Comment on a post
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
    if (!post) return res.status(404).json({ message: "Post not found!" });

    const comment = new Comment({
      userId: user._id,
      postId: post._id,
      comment: commentBody.trim(),
    });

    await comment.save();

    return res.status(201).json({
      message: "Comment Added!",
      comment,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get comments by post
export const get_comments_by_post = async (req, res) => {
  const { post_id } = req.query;

  try {
    if (!post_id) {
      return res.status(400).json({ message: "post_id is required!" });
    }

    const post = await Post.findById(post_id);
    if (!post) return res.status(404).json({ message: "Post not found!" });

    const comments = await Comment.find({ postId: post_id })
      .populate("userId", "username name profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({ comments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete a comment by user
export const delete_comment_of_user = async (req, res) => {
  const { token, comment_id } = req.body;

  try {
    if (!token || !comment_id) {
      return res
        .status(400)
        .json({ message: "Token and comment_id are required!" });
    }

    const user = await User.findOne({ token }).select("_id");
    if (!user) return res.status(404).json({ message: "User not found!" });

    const comment = await Comment.findById(comment_id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found!" });
    }

    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Comment.deleteOne({ _id: comment_id });
    return res.status(200).json({ message: "Comment Deleted!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Increment likes on a post
export const increment_likes = async (req, res) => {
  const { post_id } = req.body;

  try {
    if (!post_id) {
      return res.status(400).json({ message: "post_id is required!" });
    }

    const post = await Post.findByIdAndUpdate(
      post_id,
      { $inc: { likes: 1 } },
      { new: true },
    );

    if (!post) return res.status(404).json({ message: "Post not found!" });

    return res.status(200).json({
      message: "Likes Incremented!",
      likes: post.likes,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
