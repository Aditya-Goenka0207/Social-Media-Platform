import mongoose from "mongoose";

const ConnectionRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, 
    },
    connectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status_accepted: {
      type: Boolean,
      default: null, // null = pending, true = accepted, false = rejected
    },
  },
  { timestamps: true },
);

//compound index to prevent duplicate connection requests
ConnectionRequestSchema.index(
  { userId: 1, connectionId: 1 },
  { unique: true }
);

ConnectionRequestSchema.index({ connectionId: 1, userId: 1 });

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  ConnectionRequestSchema
);

export default ConnectionRequest;