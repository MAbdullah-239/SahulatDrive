import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'customer' | 'provider';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  token: string;
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<User>) {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      // Persist token — fire-and-forget (can't await in reducer)
      AsyncStorage.setItem('auth_token', action.payload.token).catch(() => {});
      AsyncStorage.setItem('auth_user', JSON.stringify(action.payload)).catch(() => {});
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      // Clear persisted auth data
      AsyncStorage.multiRemove(['auth_token', 'auth_user']).catch(() => {});
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
});

export const {loginStart, loginSuccess, loginFailure, logout, setUser} =
  authSlice.actions;
export default authSlice.reducer;
