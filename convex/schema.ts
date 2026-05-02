import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

// @convex-dev/auth requires its own tables (sessions, accounts, etc.)
// We merge them with our custom tables here.
export default defineSchema({
  ...authTables,

  /**
   * Extended user profile table.
   * The auth identity itself lives in authTables.users;
   * this table stores app-specific data keyed by the same userId.
   * US-01, US-02
   */
  userProfiles: defineTable({
    // Links to the Convex Auth user record
    userId: v.id("users"),

    name: v.string(),
    email: v.string(),

    /** "student" | "lecturer" */
    role: v.union(v.literal("student"), v.literal("lecturer")),

    avatarUrl: v.optional(v.string()),

    /** Student only */
    major: v.optional(v.string()),
    nim: v.optional(v.string()),

    /** Lecturer only */
    expertise: v.optional(v.array(v.string())),
    nip: v.optional(v.string()),
    availability: v.optional(
      v.array(
        v.object({
          day: v.string(),       // "monday" | "tuesday" | ...
          startTime: v.string(), // "09:00"
          endTime: v.string(),   // "17:00"
        })
      )
    ),

    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),
});
