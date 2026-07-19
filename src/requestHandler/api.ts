import apiClient from './apiClient';

// Every route/field below matches "Sahulat Drive API.postman_collection.json"
// exactly — check the collection first if a call 404s or 422s.

// ─── Auth (session-cookie based, no Bearer token) ───────────────────────────

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
}) => apiClient.post('/auth/register', data);

export const loginUser = (data: {login: string; password: string}) =>
  apiClient.post('/session', data);

export const logoutUser = () => apiClient.delete('/session');

export const getCurrentUser = () => apiClient.get('/me');

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

export const setProviderOnlineStatus = (data: {
  is_online: boolean;
  current_lat?: number;
  current_lng?: number;
}) => apiClient.patch('/provider/online', data);

// ─── Provider Documents ──────────────────────────────────────────────────────

export const uploadProviderDocument = (data: {
  document_type: 'cnic' | 'license' | 'business';
  document_number: string;
  file_url: string;
  expiry_date: string;
}) => apiClient.post('/provider/documents', data);

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
