import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Hook: returns the current authenticated user's profile.
 *
 * - `undefined` → still loading
 * - `null`      → not authenticated
 * - profile object → authenticated, profile available
 *
 * Components should use this hook instead of calling the query directly.
 * Follows Repository pattern: components never talk to Convex directly.
 */
export function useCurrentUser() {
  return useQuery(api.users.getCurrentUser);
}
