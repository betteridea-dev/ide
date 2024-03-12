import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

type AppMode = "aos" | "wrap";

interface AppState {
  appMode: AppMode;
  activeSideNavItem: string;
}

const initialState: AppState = {
  appMode: "aos",
  activeSideNavItem: "",
};

export const counterSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setAppMode: (state, action: PayloadAction<AppMode>) => {
      state.appMode = action.payload;
    },
    setActiveSideNavItem: (state, action: PayloadAction<string>) => {
      state.activeSideNavItem = action.payload;
    },
  },
});

export const { setAppMode, setActiveSideNavItem } = counterSlice.actions;

export const selectAppMode = (state: RootState) => state.app.appMode;

export default counterSlice.reducer;
