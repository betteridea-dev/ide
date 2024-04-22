import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

type AppMode = "aos" | "wrap";

interface AppState {
  appMode: AppMode;
  activeSideNavItem: string;
  activeFile: string;
  activeContract: string;
  isWalletConnected: boolean;
}

const initialState: AppState = {
  appMode: "aos",
  activeSideNavItem: "",
  activeFile: "",
  activeContract: "",
  isWalletConnected: false,
};

export const counterSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setAppMode: (state, action: PayloadAction<AppMode>) => {
      state.appMode = action.payload;

      state.activeSideNavItem = "Home";
      state.activeContract = "";
      state.activeFile = "";
    },
    setActiveSideNavItem: (state, action: PayloadAction<string>) => {
      state.activeSideNavItem = action.payload;
    },
    setActiveFile: (state, action: PayloadAction<string>) => {
      state.activeFile = action.payload;
    },
    setActiveContract: (state, action: PayloadAction<string>) => {
      state.activeContract = action.payload;
    },
    setIsWalletConnected: (state, action: PayloadAction<boolean>) => {
      state.isWalletConnected = action.payload;
    },
  },
});

export const { setAppMode, setActiveSideNavItem, setActiveFile, setActiveContract, setIsWalletConnected } = counterSlice.actions;

export const selectAppMode = (state: RootState) => state.app.appMode;

export default counterSlice.reducer;
