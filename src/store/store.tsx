import { configureStore } from "@reduxjs/toolkit";
import fileTreeSlice from "./fileTreeSlice.ts";

export const store = configureStore({
  reducer: {
    fileTree: fileTreeSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch