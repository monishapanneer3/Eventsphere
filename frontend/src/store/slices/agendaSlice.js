import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agendaService from "../../services/agendaService";

const initialState = { content: [], loading: false, error: null };

export const fetchAgenda = createAsyncThunk("agenda/fetchAgenda", async (_, { rejectWithValue }) => {
  try { return (await agendaService.getAgenda()).data; }
  catch (error) { return rejectWithValue(error.response?.data?.message || "Failed to load your agenda"); }
});

export const addToAgenda = createAsyncThunk("agenda/addToAgenda", async (sessionId, { rejectWithValue }) => {
  try { return (await agendaService.addToAgenda(sessionId)).data; }
  catch (error) { return rejectWithValue(error.response?.data?.message || "Failed to add session to your agenda"); }
});

export const removeFromAgenda = createAsyncThunk("agenda/removeFromAgenda", async (sessionId, { rejectWithValue }) => {
  try { await agendaService.removeFromAgenda(sessionId); return sessionId; }
  catch (error) { return rejectWithValue(error.response?.data?.message || "Failed to remove session from your agenda"); }
});

const agendaSlice = createSlice({
  name: "agenda",
  initialState,
  reducers: { clearAgendaError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgenda.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAgenda.fulfilled, (state, action) => { state.loading = false; state.content = action.payload || []; })
      .addCase(fetchAgenda.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addToAgenda.fulfilled, (state, action) => { state.content.push(action.payload); state.error = null; })
      .addCase(addToAgenda.rejected, (state, action) => { state.error = action.payload; })
      .addCase(removeFromAgenda.fulfilled, (state, action) => { state.content = state.content.filter((session) => session.id !== action.payload); state.error = null; })
      .addCase(removeFromAgenda.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearAgendaError } = agendaSlice.actions;
export default agendaSlice.reducer;