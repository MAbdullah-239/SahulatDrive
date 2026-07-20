import apiClient from './apiClient';

// Every route/field below matches "Sahulat Drive API.postman_collection.json"
// exactly — check the collection first if a call 404s or 422s.

// ─── Auth (session-cookie based, no Bearer token) ───────────────────────────

// Registration is a two-step, cookie-based flow:
// 1. POST /auth/register — creates a pending account, sends an OTP (currently
//    delivered to a Discord webhook on the backend for testing), and returns
//    only {message}. No session cookie yet at this point.
// 2. POST /auth/verify_registration_otp — takes {phone, otp_code}. Returns the
//    created {user} on success.
export const registerUser = (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'provider';
  vehicle?: {
    make: string;
    model: string;
    year: number;
    registration_number: string;
  };
}) => apiClient.post<{message: string}>('/auth/register', data);

export const verifyRegistrationOtp = (data: {phone: string; otp_code: string}) =>
  apiClient.post<{
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      role: 'customer' | 'provider';
      otp_verified: boolean;
      created_at: string;
    };
  }>('/auth/verify_registration_otp', data);

// Confirmed against a real GET /me response for a provider — there is no
// provider_profile.is_verified field (despite earlier backend guidance);
// approval is reflected as status: "active" at the top level instead.
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'provider' | 'admin';
  status?: string;
  provider_type?: string | null;
  otp_verified?: boolean;
}

export const loginUser = (data: {login: string; password: string}) =>
  apiClient.post<{user: ApiUser}>('/session', data);

export const logoutUser = () => apiClient.delete('/session');

export const getCurrentUser = () => apiClient.get<{user: ApiUser}>('/me');

// ─── Device token (FCM) ──────────────────────────────────────────────────────
// Call immediately after login / OTP verification once the Firebase SDK has
// provided the FCM token. Requires an active session cookie (Authenticatable).
export const updateDeviceToken = (fcmToken: string) =>
  apiClient.patch('/me/device_token', {fcm_token: fcmToken});

// ─── Notifications ───────────────────────────────────────────────────────────
// apiClient's baseURL already ends in /api/v1 (see .env), so this is just
// /notifications — do not add the /api/v1 prefix again here.
export interface ApiNotification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const getNotifications = () =>
  apiClient.get<{notifications: ApiNotification[]; unread_count: number}>(
    '/notifications',
  );

// ─── Customer Vehicles ───────────────────────────────────────────────────────

export const getVehicles = () => apiClient.get('/vehicles');

export const addVehicle = (data: {
  make: string;
  model: string;
  year: number;
  registration_number: string;
}) => apiClient.post('/vehicles', data);

export const updateVehicle = (
  vehicleId: string,
  data: Partial<{
    make: string;
    model: string;
    year: number;
    registration_number: string;
  }>,
) => apiClient.patch(`/vehicles/${vehicleId}`, data);

// ─── Service Categories (admin-only per the collection — no public route) ──

export const getAllServiceCategories = () =>
  apiClient.get('/admin/service_categories');

// ─── Service Requests ────────────────────────────────────────────────────────

export const getServiceRequests = () => apiClient.get('/service_requests');

export const createServiceRequest = (data: {
  service_category_id: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  vehicle_id?: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    registration_number: string;
  };
}) => apiClient.post('/service_requests', data);

export const updateServiceRequest = (
  requestId: string,
  data: {
    status: 'accepted' | 'on_the_way' | 'completed' | 'cancelled';
    final_price?: number;
    payment_method?: string;
  },
) => apiClient.patch(`/service_requests/${requestId}`, data);

// ─── Provider Status ─────────────────────────────────────────────────────────

export const setProviderType = (data: {
  provider_type: 'two_driver' | 'workshop';
}) => apiClient.patch('/provider/type', data);

export const setProviderOnlineStatus = (data: {
  is_online: boolean;
  current_lat?: number;
  current_lng?: number;
}) => apiClient.patch('/provider/online', data);

// ─── Provider Documents ──────────────────────────────────────────────────────

// Backend stores the file as an Active Storage attachment ("File must be
// attached" 422 if it's missing) — this must be multipart/form-data with the
// actual file, not a JSON file_url string.
export const uploadProviderDocument = (data: {
  document_type: 'cnic' | 'license' | 'business';
  document_number: string;
  file: {uri: string; type: string; name: string};
  expiry_date: string;
}) => {
  const formData = new FormData();
  formData.append('document_type', data.document_type);
  formData.append('document_number', data.document_number);
  formData.append('expiry_date', data.expiry_date);
  formData.append('file', {
    uri: data.file.uri,
    type: data.file.type,
    name: data.file.name,
  } as any);

  return apiClient.post('/provider/documents', formData, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
};

// ─── Provider Vehicles (Tow Truck) ──────────────────────────────────────────

export const registerTowTruck = (data: {
  vehicle_type: string;
  make: string;
  model: string;
  plate_number: string;
  capacity_tons: number;
}) => apiClient.post('/provider/vehicles', data);

// ─── Provider Jobs ────────────────────────────────────────────────────────────

export const getProviderJobs = () => apiClient.get('/provider/jobs');

// ─── Admin ────────────────────────────────────────────────────────────────────

export const getProviders = () => apiClient.get('/admin/providers');

export const approveDocument = (documentId: string) =>
  apiClient.patch(`/admin/documents/${documentId}/approve`);

export const rejectDocument = (documentId: string) =>
  apiClient.patch(`/admin/documents/${documentId}/reject`);

export const approveProvider = (providerId: string) =>
  apiClient.patch('/admin/providers/approve', {provider_id: providerId});

export const rejectProvider = (providerId: string, reason: string) =>
  apiClient.patch('/admin/providers/reject', {
    provider_id: providerId,
    reason,
  });

export const createServiceCategory = (data: {
  name: string;
  base_price: number;
}) => apiClient.post('/admin/service_categories', data);

export const updateServiceCategory = (
  categoryId: string,
  data: {base_price: number},
) => apiClient.patch(`/admin/service_categories/${categoryId}`, data);
