import { userServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await userServer.post("/login", {
        email: user.email,
        password: user.password,
      });

      if (response.data.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", response.data.token);
        }
      } else {
        return thunkAPI.rejectWithValue({
          message: "Token not provided",
        });
      }

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message }
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const request = await userServer.post("/register", {
        username: user.username,
        password: user.password,
        email: user.email,
        name: user.name,
      });

      return thunkAPI.fulfillWithValue(request.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message }
      );
    }
  }
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (user, thunkAPI) => {
    try {
      const response = await userServer.get("/get_user_and_profile", {
        params: {
          token: user.token,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message }
      );
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await userServer.get("/user/get_all_users");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message }
      );
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async (user, thunkAPI) => {
    try {
      const response = await userServer.post("/user/send_connection_request", {
        token: user.token,
        connectionId: user.user_id,
      });

      //refresh both sent and received requests after sending
      thunkAPI.dispatch(getConnectionRequest({ token: user.token }));
      thunkAPI.dispatch(getMyConnectionRequest({ token: user.token }));

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message }
      );
    }
  }
);

export const getConnectionRequest = createAsyncThunk(
  "user/getConnectionRequests",
  async (user, thunkAPI) => {
    try {
      const response = await userServer.post("/user/getConnectionRequests", {
        token: user.token,
      });
      return thunkAPI.fulfillWithValue(response.data.connections || []);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message }
      );
    }
  }
);

export const getMyConnectionRequest = createAsyncThunk(
  "user/getMyConnectionRequests",
  async (user, thunkAPI) => {
    try {
      const response = await userServer.get("/user/user_connection_request", {
        params: {
          token: user.token,
        },
      });

      return thunkAPI.fulfillWithValue(response.data.connections || []);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message }
      );
    }
  }
);

export const AcceptConnection = createAsyncThunk(
  "user/acceptConnection",
  async (user, thunkAPI) => {
    try {
      const response = await userServer.post(
        "/user/accept_connection_request",
        {
          token: user.token,
          requestId: user.connectionId,
          action_type: user.action,
        }
      );

      //refresh both request lists after accept/reject
      thunkAPI.dispatch(getConnectionRequest({ token: user.token }));
      thunkAPI.dispatch(getMyConnectionRequest({ token: user.token }));

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message }
      );
    }
  }
);