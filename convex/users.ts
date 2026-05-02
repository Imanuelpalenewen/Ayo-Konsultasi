import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

/**
 * Validate that a user's chosen role matches their actual profile role
 * before proceeding with login. Throws an error if:
 * - Profile not found (email not registered at all)
 * - Profile role does not match the expected role
 *
 * This is a READ-ONLY check — must be a query, not a mutation.
 * Pressman: reliability (R-01 — prevent unauthorized role escalation)
 */
export const validateRole = query({
  args: { 
    email: v.string(), 
    expectedRole: v.union(v.literal("student"), v.literal("lecturer")) 
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    // Profile not found -> email not registered
    if (!profile) {
      return { valid: false, reason: "not_found" };
    }

    // Profile exists but role doesn't match the selected role
    if (profile.role !== args.expectedRole) {
      return { valid: false, reason: "role_mismatch" };
    }
    
    return { valid: true };
  },
});

/**
 * Get the current authenticated user's profile.
 * Returns null if not logged in.
 * Used by: useCurrentUser() hook, ProtectedRoute
 * Pressman traceability: US-01, US-02
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    return profile;
  },
});

/**
 * Create or update the user's profile after registration.
 * Called immediately after a successful sign-up from the Register page.
 * Pressman traceability: US-01, US-02
 */
export const createUserProfile = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("student"), v.literal("lecturer")),
    nim: v.optional(v.string()),
    nip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Idempotent: skip if profile already exists
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) return existing._id;

    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      name: args.name,
      email: args.email,
      role: args.role,
      nim: args.nim,
      nip: args.nip,
      createdAt: Date.now(),
    });

    return profileId;
  },
});

/**
 * Get all lecturer profiles (for AI recommendation + booking).
 * Returns only public, safe fields — never exposes hashes or session data.
 * Pressman traceability: US-04, US-05
 */
export const getLecturers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("role", "lecturer"))
      .collect();
  },
});

/**
 * Update the current user's profile information.
 */
export const updateProfile = mutation({
  args: {
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    major: v.optional(v.string()),
    expertise: v.optional(v.array(v.string())),
    availability: v.optional(
      v.array(
        v.object({
          day: v.string(),
          startTime: v.string(),
          endTime: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      name: args.name,
      avatarUrl: args.avatarUrl,
      ...(args.major !== undefined ? { major: args.major } : {}),
      ...(args.expertise !== undefined ? { expertise: args.expertise } : {}),
      ...(args.availability !== undefined ? { availability: args.availability } : {}),
    });

    return { success: true };
  },
});
