import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: null,
  role: null,        // Add role here
  isLoggedIn: false,
  email: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action) {
      // Expect payload to be an object with username and role
      state.username = action.payload.username;
      state.role = action.payload.role;  
      state.email = action.payload.email; // Set role here
      state.isLoggedIn = true;
    },
    logout(state) {
      state.username = null;
      state.role = null;   // Clear role on logout
      state.isLoggedIn = false;
      state.email = null;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
