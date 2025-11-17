import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface LandingPagesUIState {
  selectedSessionId: string | null;
  statusFilter: "all" | "pending" | "generating" | "generated" | "failed";
}

const initialState: LandingPagesUIState = {
  selectedSessionId: null,
  statusFilter: "all",
};

const landingPagesSlice = createSlice({
  name: "landingPages",
  initialState,
  reducers: {
    selectSession(state, action: PayloadAction<string | null>) {
      state.selectedSessionId = action.payload;
    },
    setStatusFilter(state, action: PayloadAction<LandingPagesUIState["statusFilter"]>) {
      state.statusFilter = action.payload;
    },
  },
});

export const { selectSession, setStatusFilter } = landingPagesSlice.actions;
export default landingPagesSlice.reducer;


