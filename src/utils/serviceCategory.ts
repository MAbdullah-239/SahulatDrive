// Shared between the customer-side category picker (RequestHelp) and the
// provider-side job screens — both render the same `service_categories`
// rows (see GET /service_categories in the Postman collection) and should
// label/icon them identically.

const ICON_BY_CATEGORY: Record<string, string> = {
  towing: '🚛',
  tow: '🚛',
  flat_tyre: '⚙️',
  flat_tire: '⚙️',
  tyre: '⚙️',
  tire: '⚙️',
  battery: '🔋',
  jumpstart: '🔋',
  overheating: '🌡️',
  fuel: '⛽',
  ac: '💨',
  winch: '🪝',
  lockout: '🔑',
  mechanic: '🔧',
};

export const iconForCategory = (name: string) => {
  const key = (name ?? '').toLowerCase();
  const match = Object.keys(ICON_BY_CATEGORY).find(k => key.includes(k));
  return match ? ICON_BY_CATEGORY[match] : '🛠️';
};

export const labelForCategory = (name: string) =>
  (name ?? '')
    .split('_')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'Service';
