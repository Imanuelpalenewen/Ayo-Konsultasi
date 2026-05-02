import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useUpdateProfile() {
  return useMutation(api.users.updateProfile);
}
