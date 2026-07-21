import {iconForCategory, labelForCategory} from './serviceCategory';
import {Coordinates} from './location';

const COLOR_BY_CATEGORY: Record<string, string> = {
  towing: '#E8490F',
  battery: '#F59E0B',
  jumpstart: '#F59E0B',
  fuel: '#10B981',
  tire: '#3B82F6',
  tyre: '#3B82F6',
  winch: '#8B5CF6',
  lockout: '#8B5CF6',
};

const colorForCategory = (name: string) => {
  const key = (name ?? '').toLowerCase();
  const match = Object.keys(COLOR_BY_CATEGORY).find(k => key.includes(k));
  return match ? COLOR_BY_CATEGORY[match] : '#E8490F';
};

const timeAgoFrom = (isoDate?: string) => {
  if (!isoDate) return 'Just now';
  const minutes = Math.max(0, Math.round((Date.now() - new Date(isoDate).getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.round(minutes / 60)} hr ago`;
};

// Shapes a single row from GET /provider/jobs — {assignment_id,
// assignment_status, distance_km, service_request: {...}} — into the flat
// object ProviderIncomingJob / ProviderActiveJob render. Centralized here so
// both screens (plus ProviderJobsHistory, which hits the same endpoint) stay
// in sync with the actual API response instead of each guessing field names.
export const normalizeProviderJob = (raw: any, providerCoords?: Coordinates) => {
  const sr = raw.service_request ?? {};
  const category = sr.service_category ?? {};
  const distanceKm = parseFloat(raw.distance_km);
  const lat = parseFloat(sr.latitude);
  const lng = parseFloat(sr.longitude);

  return {
    id: sr.id,
    assignmentId: raw.assignment_id,
    assignmentStatus: raw.assignment_status,
    customerName: sr.customer?.name ?? 'Customer',
    customerPhone: sr.customer?.phone ?? null,
    customerRating: sr.customer?.rating ?? null,
    serviceType: category.name ?? 'general_assistance',
    serviceLabel: labelForCategory(category.name),
    serviceIcon: iconForCategory(category.name),
    serviceColor: colorForCategory(category.name),
    timeAgo: timeAgoFrom(sr.created_at),
    location: sr.address ?? 'Unknown location',
    distance: Number.isFinite(distanceKm) ? `${distanceKm.toFixed(1)} km` : null,
    estimatedMinutes: Number.isFinite(distanceKm)
      ? Math.max(3, Math.round(distanceKm * 4))
      : null,
    eta: Number.isFinite(distanceKm)
      ? `${Math.max(3, Math.round(distanceKm * 4))} mins`
      : null,
    price: `PKR ${sr.final_price ?? category.base_price ?? sr.estimated_price ?? 0}`,
    notes: sr.description ?? '',
    vehicle: sr.vehicle ?? null,
    customerCoords:
      Number.isFinite(lat) && Number.isFinite(lng)
        ? {latitude: lat, longitude: lng}
        : null,
    providerCoords: providerCoords ?? null,
  };
};

export const findPendingJob = (jobs: any[]) =>
  jobs.find(j => j.assignment_status === 'pending') ?? null;
