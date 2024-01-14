import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type FileTree = {
  name: string;
  children: FileTree[]
}

type State = FileTree[]

const initialState: State = [];
const fileTreeSlice = createSlice({
  name: "fileTree",
  initialState,
  reducers: {
    setFileTree: (_, action: PayloadAction<State>) => {
      return action.payload;
    },
  },
});

export const { setFileTree } = fileTreeSlice.actions;

export default fileTreeSlice.reducer;