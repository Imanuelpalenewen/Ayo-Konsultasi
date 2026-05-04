import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const createConsultation = mutation({
  args: {
    lecturerId: v.id("users"),
    date: v.string(),
    time: v.string(),
    topic: v.string(),
    notes: v.optional(v.string()),
    locationType: v.union(v.literal("online"), v.literal("tatap_muka")),
    locationDetail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const studentId = await getAuthUserId(ctx);
    if (!studentId) throw new Error("Not authenticated");

    const selectedDateTime = new Date(`${args.date}T${args.time}`);
    if (selectedDateTime.getTime() < Date.now()) {
      throw new Error("Cannot book a consultation in the past");
    }

    const consultationId = await ctx.db.insert("consultations", {
      studentId,
      lecturerId: args.lecturerId,
      date: args.date,
      time: args.time,
      topic: args.topic,
      notes: args.notes,
      locationType: args.locationType,
      locationDetail: args.locationDetail,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const studentProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", studentId))
      .unique();

    // Notify lecturer
    await ctx.runMutation(internal.notifications.createNotification, {
      userId: args.lecturerId,
      type: "new_booking",
      message: `Mahasiswa ${studentProfile?.name || "seseorang"} mengajukan konsultasi tentang ${args.topic}.`,
      relatedId: consultationId,
    });

    return consultationId;
  },
});

export const updateStatus = mutation({
  args: {
    consultationId: v.id("consultations"),
    status: v.union(
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) throw new Error("Consultation not found");

    if (consultation.lecturerId !== userId && consultation.studentId !== userId) {
      throw new Error("Unauthorized to update this consultation");
    }

    await ctx.db.patch(args.consultationId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Determine who to notify
    const notifyUserId = userId === consultation.lecturerId ? consultation.studentId : consultation.lecturerId;
    const actorProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const statusText = {
      accepted: "menerima",
      rejected: "menolak",
      completed: "menyelesaikan",
      cancelled: "membatalkan",
    }[args.status];

    await ctx.runMutation(internal.notifications.createNotification, {
      userId: notifyUserId,
      type: `booking_${args.status}`,
      message: `${actorProfile?.name || "Seseorang"} ${statusText} sesi konsultasi Anda.`,
      relatedId: consultation._id,
    });

    return { success: true };
  },
});

export const getLecturerRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const requests = await ctx.db
      .query("consultations")
      .withIndex("by_lecturer", (q) => q.eq("lecturerId", userId))
      .collect();

    // Filter out completed and cancelled for the dashboard view, 
    // or maybe just return all and let frontend filter
    // Let's attach student profiles
    const withProfiles = await Promise.all(
      requests.map(async (req) => {
        const student = await ctx.db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", req.studentId))
          .unique();
        return { ...req, student };
      })
    );

    return withProfiles.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getConsultationById = query({
  args: { consultationId: v.id("consultations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.consultationId);
  },
});

export const reassignConsultation = mutation({
  args: {
    consultationId: v.id("consultations"),
    newLecturerId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) throw new Error("Consultation not found");
    if (consultation.lecturerId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(args.consultationId, {
      lecturerId: args.newLecturerId,
      status: "pending",
      reassignedFrom: userId,
      reassignedTo: args.newLecturerId,
      reassignReason: args.reason,
      updatedAt: Date.now(),
    });

    const reassigningLecturerProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const newLecturerProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.newLecturerId))
      .unique();

    // Notify student
    await ctx.runMutation(internal.notifications.createNotification, {
      userId: consultation.studentId,
      type: "booking_reassigned",
      message: `Konsultasi Anda tentang "${consultation.topic}" telah dialihkan ke ${newLecturerProfile?.name || "dosen lain"} oleh ${reassigningLecturerProfile?.name || "dosen"}.`,
      relatedId: consultation._id,
    });

    // Notify new lecturer
    await ctx.runMutation(internal.notifications.createNotification, {
      userId: args.newLecturerId,
      type: "new_booking",
      message: `Anda menerima permintaan konsultasi yang dialihkan dari ${reassigningLecturerProfile?.name || "dosen lain"} tentang "${consultation.topic}".`,
      relatedId: consultation._id,
    });

    return { success: true };
  },
});

export const getStudentHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const history = await ctx.db
      .query("consultations")
      .withIndex("by_student", (q) => q.eq("studentId", userId))
      .collect();

    const withProfiles = await Promise.all(
      history.map(async (req) => {
        const lecturer = await ctx.db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", req.lecturerId))
          .unique();
        return { ...req, lecturer };
      })
    );

    return withProfiles.sort((a, b) => b.createdAt - a.createdAt);
  },
});
