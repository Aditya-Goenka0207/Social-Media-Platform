import { createSlice } from "@reduxjs/toolkit";
import { getAllComments, getAllPosts } from "../../action/postAction";

const initialState = {
  posts: [],
  isError: false,
  postFetched: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  comments: [],
  postId: "",
};

const postSlice = createSlice({
  name: "post",
  initialState,

  reducers: {
    reset: () => initialState,

    resetPostId: (state) => {
      state.postId = "";
      state.comments = [];
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------------- FETCH POSTS ---------------- */

      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "Fetching all the posts";
      })

      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.postFetched = true;
        state.posts = action.payload.posts || [];
        state.message = "";
      })

      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.postFetched = false;
        state.message =
          action.payload?.message || action.payload || "Failed to fetch posts";
      })

      /* ---------------- FETCH COMMENTS ---------------- */

      .addCase(getAllComments.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })

      .addCase(getAllComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.postId = action.payload.post_id;
        state.comments = action.payload.comments || [];
      })

      .addCase(getAllComments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          action.payload?.message || action.payload || "Failed to fetch comments";
      });
  },
});

export const { resetPostId, reset } = postSlice.actions;
export default postSlice.reducer;