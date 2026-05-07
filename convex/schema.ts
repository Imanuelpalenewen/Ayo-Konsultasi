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

    /** Set to true once the user has read and dismissed the onboarding guide.
     *  undefined / false → show onboarding overlay on first login. */
    hasSeenGuide: v.optional(v.boolean()),

    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  /**
   * Consultations Table
   * US-06, US-07, US-09
   */
  consultations: defineTable({
    studentId: v.id("users"),
    lecturerId: v.id("users"),
    date: v.string(), // ISO date string "YYYY-MM-DD"
    time: v.string(), // "HH:mm" format
    topic: v.string(),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("completed"),
      v.literal("cancelled")
    ),

    // Required on all new bookings; optional only to allow pre-existing documents without the field
    locationType: v.optional(v.union(v.literal("online"), v.literal("tatap_muka"))),
    // "Google Meet" | "Zoom" for online; free-text location for tatap_muka
    locationDetail: v.optional(v.string()),
    // Auto-generated when lecturer accepts an online booking
    meetLink: v.optional(v.string()),

    // Reassign trail — populated by reassignConsultation (Task 9)
    reassignedFrom: v.optional(v.id("users")),
    reassignedTo: v.optional(v.id("users")),
    reassignReason: v.optional(v.string()),

    // "ai" | "manual" — which path the student used to pick the lecturer
    bookingSource: v.optional(v.union(v.literal("ai"), v.literal("manual"))),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_lecturer", ["lecturerId"])
    .index("by_status", ["status"])
    .index("by_lecturer_date", ["lecturerId", "date"]),

  /**
   * Notifications Table
   * US-08
   */
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // e.g., "booking_accepted", "new_booking"
    message: v.string(),
    relatedId: v.optional(v.id("consultations")),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"]),
});
