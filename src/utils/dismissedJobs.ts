import AsyncStorage from '@react-native-async-storage/async-storage';

// Declining a job only cancels *this provider's* interest in it — there's no
// backend endpoint yet to reject a single assignment (declining currently has
// to avoid touching the customer's service_request at all, see
// ProviderIncomingJob). Until that endpoint exists, the assignment's
// assignment_status stays "pending" on the backend even after a decline, so
// the in-memory dedupe in ProviderHome isn't enough — it resets on every app
// restart and the same declined job resurfaces as "new". Persisting the
// declined ids here survives restarts and closes that gap from the client side.
const STORAGE_KEY = 'provider_dismissed_assignment_ids';

export const loadDismissedAssignmentIds = async (): Promise<Set<string>> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (error) {
    return new Set();
  }
};

export const persistDismissedAssignmentId = async (
  assignmentId: string,
  current: Set<string>,
) => {
  current.add(assignmentId);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(current)));
  } catch (error) {
    // Best-effort — worst case this specific id isn't remembered across a
    // restart, same as before this fix existed.
  }
};
