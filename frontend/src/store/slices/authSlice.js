import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const storedToken = localStorage.getItem("token");
const storedUsername = localStorage.getItem("username");
const storedRole = localStorage.getItem("role");

export const normalizeRole = (role) =>
  role === "ADMIN" || role === "ROLE_ADMIN" ? "ROLE_ADMIN" : "ROLE_USER";

const initialState = {
  token: storedToken || null,
  username: storedUsername || null,
  role: normalizeRole(storedRole),
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { username, password });
      return { token: response.data.token, username, role: normalizeRole(response.data.role) };
    } catch (err) {
      const message =
        (err.response && err.response.data && err.response.data.message) ||
        "Invalid credentials";
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ username, password, role }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", {
        username,
        password,
        role,
      });
      return response.data;
    } catch (err) {
      const responseData = err.response && err.response.data;
      const message =
        (typeof responseData === "string" && responseData) ||
        (responseData && responseData.message) ||
        (err.response?.status === 409 && "Username already exists") ||
        "Registration failed";
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.username = null;
      state.role = "ROLE_USER";
      state.isAuthenticated = false;
      // Explicitly flush persisted credentials.
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        // Explicitly persist the JWT on successful login.
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("username", action.payload.username);
        localStorage.setItem("role", action.payload.role);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Invalid credentials";
        state.isAuthenticated = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
