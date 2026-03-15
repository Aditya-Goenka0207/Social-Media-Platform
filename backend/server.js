import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import postRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

const app = express();

//ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Middleware
app.use(
  cors({
    origin: "*", //allows frontend apps to access API (adjust in production)
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploads folder statically
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.send("API is running!");
});

//global error handler for multer / server errors
app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }

  return res.status(500).json({ message: err.message || "Server Error" });
});

// Start server and connect to DB
const startServer = async () => {
  try {
    if (!MONGO_URL) {
      throw new Error("MONGO_URL is missing in environment variables");
    }

    await mongoose.connect(MONGO_URL);

    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit process if DB fails
  }
};

startServer();