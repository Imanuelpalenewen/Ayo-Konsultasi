import { action, mutation, query } from "./_generated/server";
import { getAuthUserId, retrieveAccount, modifyAccountCredentials } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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

const DAY_NAMES_LC = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/**
 * Get all lecturers annotated with availability status for a given date+time.
 * Used by the manual lecturer picker to show/disable unavailable lecturers.
 * Returns: "available" | "outside_hours" | "already_booked" per lecturer.
 * Pressman traceability: US-06 (booking flow UX)
 */
export const getLecturersWithAvailability = query({
  args: {
    date: v.string(), // "YYYY-MM-DD"
    time: v.string(), // "HH:mm"
  },
  handler: async (ctx, args) => {
    const lecturers = await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("role", "lecturer"))
      .collect();

    const dayOfWeek = DAY_NAMES_LC[new Date(args.date + "T00:00:00Z").getUTCDay()];

    const annotated = await Promise.all(
      lecturers.map(async (lecturer) => {
        const availability = lecturer.availability ?? [];

        if (availability.length > 0) {
          const hasSlot = availability.some(
            (slot) =>
              slot.day === dayOfWeek &&
              slot.startTime <= args.time &&
              args.time <= slot.endTime
          );

          if (!hasSlot) {
            return {
              ...lecturer,
              availabilityStatus: "outside_hours" as const,
              availabilityReason: `Tidak ada jadwal pada hari ${dayOfWeek} pukul ${args.time}`,
            };
          }
        }

        // Check for an existing pending/accepted booking at the exact same slot
        const sameSlotBookings = await ctx.db
          .query("consultations")
          .withIndex("by_lecturer_date", (q) =>
            q.eq("lecturerId", lecturer.userId).eq("date", args.date)
          )
          .collect();

        const hasConflict = sameSlotBookings.some(
          (c) =>
            c.time === args.time &&
            (c.status === "pending" || c.status === "accepted")
        );

        if (hasConflict) {
          return {
            ...lecturer,
            availabilityStatus: "already_booked" as const,
            availabilityReason: "Sudah ada janji terkonfirmasi pada waktu ini",
          };
        }

        return {
          ...lecturer,
          availabilityStatus: "available" as const,
          availabilityReason: undefined,
        };
      })
    );

    return annotated;
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
      ...(args.avatarUrl !== undefined ? { avatarUrl: args.avatarUrl } : {}),
      ...(args.major !== undefined ? { major: args.major } : {}),
      ...(args.expertise !== undefined ? { expertise: args.expertise } : {}),
      ...(args.availability !== undefined ? { availability: args.availability } : {}),
    });

    return { success: true };
  },
});

export const markGuideAsSeen = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");
    await ctx.db.patch(profile._id, { hasSeenGuide: true });
  },
});

/**
 * Resolves a Convex storageId to a public download URL.
 * Also handles legacy HTTP avatarUrls so the UI doesn't need to branch.
 * useStorageUrl does not exist in convex@1.36 — this query is the correct replacement.
 */
export const resolveStorageUrl = query({
  args: { storageId: v.union(v.string(), v.null()) },
  handler: async (ctx, args) => {
    if (!args.storageId) return null;
    if (args.storageId.startsWith("http")) return args.storageId;
    try {
      // storageId is a string at runtime; cast satisfies the Id<"_storage"> type.
      return await ctx.storage.getUrl(args.storageId as any);
    } catch {
      return null;
    }
  },
});

/**
 * Returns a Convex storage pre-signed URL for direct file upload from the browser.
 * The client POSTs the file to this URL, then calls updateAvatar with the storageId.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Saves a Convex storageId to the user's avatarUrl field.
 * Frontend resolves the display URL via useStorageUrl(storageId).
 */
export const updateAvatar = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Profile not found");
    await ctx.db.patch(profile._id, { avatarUrl: args.storageId });
    return { success: true };
  },
});

/**
 * Change the current user's password via Convex Auth.
 * Must be an action — retrieveAccount and modifyAccountCredentials require action context.
 * Flow: verify current password → update to new password (auto-hashed by provider).
 * Pressman traceability: US-03 (security)
 */
export const changePassword = action({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get the user's email — used as the account ID for the Password provider
    const profile = await ctx.runQuery(api.users.getCurrentUser);
    if (!profile) throw new Error("User profile not found");

    // Verify current password — throws ConvexError if incorrect
    await retrieveAccount(ctx, {
      provider: "password",
      account: { id: profile.email, secret: args.currentPassword },
    });

    // Update to new password — provider handles hashing automatically
    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: profile.email, secret: args.newPassword },
    });

    return { success: true };
  },
});
