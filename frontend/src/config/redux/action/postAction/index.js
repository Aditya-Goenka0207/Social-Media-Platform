import { postServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAllPosts = createAsyncThunk(
  "post/getAllPosts",
  async (_, thunkAPI) => {
    try {
      const response = await postServer.get("/posts");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || { message: err.message }
      );
    }
  }
);

export const createPost = createAsyncThunk(
  "post/createPost",
  async (userData, thunkAPI) => {
    const { file, body } = userData;

    try {
      const formData = new FormData();
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";

      formData.append("token", token);
      formData.append("body", body || "");

      if (file) {
        formData.append("media", file);
      }

      const response = await postServer.post("/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        thunkAPI.dispatch(getAllPosts());
        return thunkAPI.fulfillWithValue(response.data);
      } else {
        return thunkAPI.rejectWithValue({ message: "Post not uploaded" });
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || { message: err.message }
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (post_id, thunkAPI) => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";

      const response = await postServer.delete("/delete_post", {
        data: {
          token,
          post_id: post_id.post_id,
        },
      });

      thunkAPI.dispatch(getAllPosts());

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || { message: err.message }
      );
    }
  }
);

export const incrementPostLike = createAsyncThunk(
  "post/incrementLike",
  async (post, thunkAPI) => {
    try {
      const response = await postServer.post("/increment_post_likes", {
        post_id: post.post_id,
      });

      thunkAPI.dispatch(getAllPosts());

      return thunkAPI.fulfillWithValue({
        ...response.data,
        post_id: post.post_id,
      });
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || { message: err.message }
      );
    }
  }
);

export const getAllComments = createAsyncThunk(
  "post/getAllComments",
  async (postData, thunkAPI) => {
    try {
      const response = await postServer.get("/get_comments", {
        params: {
          post_id: postData.post_id,
        },
      });

      return thunkAPI.fulfillWithValue({
        comments: response.data.comments || [],
        post_id: postData.post_id,
      });
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || { message: err.message }
      );
    }
  }
);

export const postComment = createAsyncThunk(
  "post/postComment",
  async (commentData, thunkAPI) => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";

      const response = await postServer.post("/comment", {
        token,
        post_id: commentData.post_id,
        commentBody: commentData.body,
      });

      thunkAPI.dispatch(getAllComments({ post_id: commentData.post_id }));
      thunkAPI.dispatch(getAllPosts());

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data || { message: err.message }
      );
    }
  }
);