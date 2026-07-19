import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type ServiceCategoryName =
  | 'towing'
  | 'battery_jump'
  | 'fuel_delivery'
  | 'tire_change'
  | 'locksmith';

export interface ServiceCategory {
  id: string;
  name: ServiceCategoryName;
  label: string;
  icon: string;
  description: string;
}

export interface TowTruck {
  plateNumber: string;
  truckType: string;
  capacity: string;
  make: string;
  model: string;
  year: string;
}

export interface ProviderDocument {
  type: 'cnic' | 'license' | 'business';
  uri: string;
  name: string;
  uploaded: boolean;
}

interface ProviderState {
  isOnline: boolean;
  isVerified: boolean;
  selectedCategories: ServiceCategoryName[];
  documents: ProviderDocument[];
  towTruck: TowTruck | null;
  currentLat: number | null;
  currentLng: number | null;
  rating: number;
  totalJobs: number;
  onboardingStep: 'services' | 'documents' | 'tow_truck' | 'pending' | 'done';
}

const initialState: ProviderState = {
  isOnline: false,
  isVerified: false,
  selectedCategories: [],
  documents: [],
  towTruck: null,
  currentLat: null,
  currentLng: null,
  rating: 0,
  totalJobs: 0,
  onboardingStep: 'services',
};

const providerSlice = createSlice({
  name: 'provider',
  initialState,
  reducers: {
    setOnlineStatus(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    setVerified(state, action: PayloadAction<boolean>) {
      state.isVerified = action.payload;
    },
    setSelectedCategories(
      state,
      action: PayloadAction<ServiceCategoryName[]>,
    ) {
      state.selectedCategories = action.payload;
    },
    toggleCategory(state, action: PayloadAction<ServiceCategoryName>) {
      const cat = action.payload;
      const idx = state.selectedCategories.indexOf(cat);
      if (idx >= 0) {
        state.selectedCategories.splice(idx, 1);
      } else {
        state.selectedCategories.push(cat);
      }
    },
    setTowTruck(state, action: PayloadAction<TowTruck>) {
      state.towTruck = action.payload;
    },
    addDocument(state, action: PayloadAction<ProviderDocument>) {
      const idx = state.documents.findIndex(
        d => d.type === action.payload.type,
      );
      if (idx >= 0) {
        state.documents[idx] = action.payload;
      } else {
        state.documents.push(action.payload);
      }
    },
    setLocation(
      state,
      action: PayloadAction<{lat: number; lng: number}>,
    ) {
      state.currentLat = action.payload.lat;
      state.currentLng = action.payload.lng;
    },
    setOnboardingStep(
      state,
      action: PayloadAction<ProviderState['onboardingStep']>,
    ) {
      state.onboardingStep = action.payload;
    },
  },
});

export const {
  setOnlineStatus,
  setVerified,
  setSelectedCategories,
  toggleCategory,
  setTowTruck,
  addDocument,
  setLocation,
  setOnboardingStep,
} = providerSlice.actions;
export default providerSlice.reducer;
