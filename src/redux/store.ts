import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import providerReducer from './slices/providerSlice';
import locationReducer from './slices/locationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    provider: providerReducer,
    location: locationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
