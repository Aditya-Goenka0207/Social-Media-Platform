import { createSlice } from "@reduxjs/toolkit";
import {
  getAboutUser,
  getAllUsers,
  getConnectionRequest,
  getMyConnectionRequest,
  loginUser,
  registerUser,
} from "../../action/authAction";

const initialState = {
  user: undefined,
  isError: false,
  isSuccess: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  isTokenThere: false,
  profileFetched: false,
  connections: [],
  connectionRequest: [],
  all_users: [],
  all_profiles_fetched: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,

    handleLoginUser: (state) => {
      state.message = "hello";
    },

    emptyMessage: (state) => {
      state.message = "";
      state.isError = false;
      state.isSuccess = false;
    },

    setTokenIsThere: (state) => {
      state.isTokenThere = true;
    },

    setTokenIsNotThere: (state) => {
      state.isTokenThere = false;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------------- LOGIN ---------------- */

      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "Logging in";
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.isTokenThere = true;
        state.message = "Login Successful!";

        // backend response shape: { message, token, user }
        state.user = action.payload.user || state.user;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.loggedIn = false;
        state.message = action.payload?.message || action.payload || "Login failed";
      })

      /* ---------------- REGISTER ---------------- */

      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "Registering you...";
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.message =
          action.payload?.message || "Registration Successful, Please login";
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message =
          action.payload?.message || action.payload || "Registration failed";
      })

      /* ---------------- USER PROFILE ---------------- */

      .addCase(getAboutUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })

      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.loggedIn = true;
        state.isTokenThere = true;

        state.user = action.payload.userProfile;
      })

      .addCase(getAboutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.profileFetched = false; 
        state.message =
          action.payload?.message || action.payload || "Failed to fetch profile";
      })

      /* ---------------- ALL USERS ---------------- */

      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })

      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.all_profiles_fetched = true;
        state.all_users = action.payload.profiles || [];
      })

      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.all_profiles_fetched = false;
        state.message =
          action.payload?.message || action.payload || "Failed to fetch users";
      })

      /* ---------------- CONNECTIONS ---------------- */

      .addCase(getConnectionRequest.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })

      .addCase(getConnectionRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.connections = action.payload || [];
      })

      .addCase(getConnectionRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          action.payload?.message ||
          action.payload ||
          "Failed to fetch connection requests";
      })

      /* ---------------- MY CONNECTION REQUESTS ---------------- */

      .addCase(getMyConnectionRequest.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })

      .addCase(getMyConnectionRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.connectionRequest = action.payload || [];
      })

      .addCase(getMyConnectionRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          action.payload?.message ||
          action.payload ||
          "Failed to fetch my connection requests";
      });
  },
});

export const {
  reset,
  emptyMessage,
  setTokenIsThere,
  setTokenIsNotThere,
} = authSlice.actions;

export default authSlice.reducer;