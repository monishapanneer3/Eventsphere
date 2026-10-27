import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import speakerService from "../../services/speakerService";

const initialState = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: 10,
  loading: false,
  error: null,
  statusMessage: null,
};

export const fetchSpeakers = createAsyncThunk(
  "speakers/fetchSpeakers",
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await speakerService.getAllSpeakers(page, size);
      return response.data;
    } catch (err) {
      if (!err.response) {
        return rejectWithValue("Server Unreachable");
      }
      const messages = {
        401: "Authentication required. Please log in again.",
        403: "You do not have permission to view speakers.",
        404: "Speaker endpoint not found.",
        500: "Speaker service is unavailable. Please try again.",
      };
      return rejectWithValue(messages[err.response.status] || "Failed to GET data");
    }
  }
);

export const createSpeaker = createAsyncThunk(
  "speakers/createSpeaker",
  async (speakerDto, { rejectWithValue }) => {
    try {
      const response = await speakerService.createSpeaker(speakerDto);
      return response.data;
    } catch (err) {
      const message =
        (err.response && err.response.data && err.response.data.message) ||
        "Failed to GET data";
      return rejectWithValue(message);
    }
  }
);

export const updateSpeaker = createAsyncThunk(
  "speakers/updateSpeaker",
  async ({ id, speakerDto }, { rejectWithValue }) => {
    try {
      const response = await speakerService.updateSpeaker(id, speakerDto);
      return response.data;
    } catch (err) {
      const message =
        (err.response && err.response.data && err.response.data.message) ||
        "Failed to update speaker";
      return rejectWithValue(message);
    }
  }
);

export const deleteSpeaker = createAsyncThunk(
  "speakers/deleteSpeaker",
  async (id, { rejectWithValue }) => {
    try {
      await speakerService.deleteSpeaker(id);
      return id;
    } catch (err) {
      const message =
        (err.response && err.response.data && err.response.data.message) ||
        "Failed to delete speaker";
      return rejectWithValue(message);
    }
  }
);

const speakerSlice = createSlice({
  name: "speakers",
  initialState,
  reducers: {
    setSpeakerPage: (state, action) => {
      state.page = action.payload;
    },
    clearSpeakerStatus: (state) => {
      state.statusMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpeakers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpeakers.fulfilled, (state, action) => {
        state.loading = false;
        state.content = action.payload.content || [];
        state.totalElements = action.payload.totalElements || 0;
        state.totalPages = action.payload.totalPages || 0;
        state.page = action.payload.number || 0;
      })
      .addCase(fetchSpeakers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Server Unreachable";
        state.content = [];
      })
      .addCase(createSpeaker.fulfilled, (state, action) => {
        state.content.push(action.payload);
        state.statusMessage = "Speaker created successfully.";
      })
      .addCase(createSpeaker.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateSpeaker.fulfilled, (state, action) => {
        const idx = state.content.findIndex(
          (s) => s.id === action.payload.id
        );
        if (idx !== -1) state.content[idx] = action.payload;
        state.statusMessage = "Speaker updated successfully.";
      })
      .addCase(updateSpeaker.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteSpeaker.fulfilled, (state, action) => {
        state.content = state.content.filter((s) => s.id !== action.payload);
        state.statusMessage = "Speaker deleted successfully.";
      })
      .addCase(deleteSpeaker.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setSpeakerPage, clearSpeakerStatus } = speakerSlice.actions;
export default speakerSlice.reducer;
