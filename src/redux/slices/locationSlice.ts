import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  permissionGranted: boolean;
  isFetching: boolean;
  error: string | null;
}

const initialState: LocationState = {
  latitude: null,
  longitude: null,
  permissionGranted: false,
  isFetching: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    fetchLocationStart(state) {
      state.isFetching = true;
      state.error = null;
    },
    fetchLocationSuccess(
      state,
      action: PayloadAction<{latitude: number; longitude: number}>,
    ) {
      state.isFetching = false;
      state.permissionGranted = true;
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
    },
    fetchLocationFailure(state, action: PayloadAction<string>) {
      state.isFetching = false;
      state.error = action.payload;
    },
    setPermissionGranted(state, action: PayloadAction<boolean>) {
      state.permissionGranted = action.payload;
    },
  },
});

export const {
  fetchLocationStart,
  fetchLocationSuccess,
  fetchLocationFailure,
  setPermissionGranted,
} = locationSlice.actions;
export default locationSlice.reducer;
