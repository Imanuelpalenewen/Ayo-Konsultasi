import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";

const DAY_NAMES_LC = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export const createConsultation = mutation({
  args: {
    lecturerId: v.id("users"),
    date: v.string(),
    time: v.string(),
    topic: v.string(),
    notes: v.optional(v.string()),
    locationType: v.union(v.literal("online"), v.literal("tatap_muka")),
    locationDetail: v.optional(v.string()),
    bookingSource: v.optional(v.union(v.literal("ai"), v.literal("manual"))),
  },
  handler: async (ctx, args) => {
    const studentId = await getAuthUserId(ctx);
    if (!studentId) throw new Error("Not authenticated");

    const selectedDateTime = new Date(`${args.date}T${args.time}`);
    if (selectedDateTime.getTime() < Date.now()) {
      throw new Error("Cannot book a consultation in the past");
    }

    // Defense-in-depth: validate lecturer availability window (only if slots are configured)
    const lecturerProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.lecturerId))
      .unique();

    if (lecturerProfile) {
      const availability = lecturerProfile.availability ?? [];
      if (availability.length > 0) {
        const dayOfWeek = DAY_NAMES_LC[new Date(args.date + "T00:00:00Z").getUTCDay()];
        const hasSlot = availability.some(
          (slot) =>
            slot.day === dayOfWeek &&
            slot.startTime <= args.time &&
            args.time <= slot.endTime
        );
        if (!hasSlot) {
          throw new ConvexError({ code: "OUTSIDE_HOURS", lecturerId: args.lecturerId });
        }
      }
    }

    // Reject if lecturer already has a pending/accepted booking at the exact same slot
    const sameSlotBookings = await ctx.db
      .query("consultations")
      .withIndex("by_lecturer_date", (q) =>
        q.eq("lecturerId", args.lecturerId).eq("date", args.date)
      )
      .collect();

    const hasConflict = sameSlotBookings.some(
      (c) =>
        c.time === args.time &&
        (c.status === "pending" || c.status === "accepted")
    );

    if (hasConflict) {
      throw new ConvexError({ code: "SLOT_TAKEN", lecturerId: args.lecturerId });
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
      bookingSource: args.bookingSource,
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

    // Generate a Jitsi meet link when a lecturer accepts an online booking (idempotent)
    let meetLink = consultation.meetLink;
    if (
      args.status === "accepted" &&
      consultation.locationType === "online" &&
      !consultation.meetLink
    ) {
      const room = `ayokonsultasi-${crypto.randomUUID()}`;
      meetLink = `https://meet.jit.si/${room}`;
      await ctx.db.patch(args.consultationId, { meetLink });
    }

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

    const baseMessage = `${actorProfile?.name || "Seseorang"} ${statusText} sesi konsultasi Anda.`;
    const notifMessage =
      args.status === "accepted" && meetLink
        ? `${baseMessage} Link meeting: ${meetLink}`
        : baseMessage;

    await ctx.runMutation(internal.notifications.createNotification, {
      userId: notifyUserId,
      type: `booking_${args.status}`,
      message: notifMessage,
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
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.reason.trim().length < 10) {
      throw new Error("Alasan reassign wajib diisi minimal 10 karakter.");
    }

    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) throw new Error("Consultation not found");
    if (consultation.lecturerId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(args.consultationId, {
      lecturerId: args.newLecturerId,
      status: "pending",
      reassignedFrom: userId,
      reassignedTo: args.newLecturerId,
      reassignReason: args.reason.trim(),
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

    const reason = args.reason.trim();

    // Notify student — include reason so they know why
    await ctx.runMutation(internal.notifications.createNotification, {
      userId: consultation.studentId,
      type: "booking_reassigned",
      message: `Konsultasi Anda tentang "${consultation.topic}" dialihkan ke ${newLecturerProfile?.name || "dosen lain"} oleh ${reassigningLecturerProfile?.name || "dosen"}. Alasan: ${reason}`,
      relatedId: consultation._id,
    });

    // Notify new lecturer — include reason so they understand the context
    await ctx.runMutation(internal.notifications.createNotification, {
      userId: args.newLecturerId,
      type: "new_booking",
      message: `Anda menerima reassign dari ${reassigningLecturerProfile?.name || "dosen lain"} tentang "${consultation.topic}". Alasan: ${reason}`,
      relatedId: consultation._id,
    });

    return { success: true };
  },
});

/** Returns the Monday of the ISO week containing `now` at 00:00:00.000 UTC. */
function getISOWeekBounds(now: Date): { monday: Date; sunday: Date } {
  const day = now.getUTCDay() === 0 ? 7 : now.getUTCDay(); // Sun=7
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - (day - 1));
  monday.setUTCHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);
  return { monday, sunday };
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Real stats for the lecturer dashboard stat cards. */
export const getLecturerStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { pending: 0, acceptedThisWeek: 0, totalCompleted: 0 };

    const all = await ctx.db
      .query("consultations")
      .withIndex("by_lecturer", (q) => q.eq("lecturerId", userId))
      .collect();

    const { monday, sunday } = getISOWeekBounds(new Date());

    const inCurrentWeek = (dateStr: string) => {
      const d = new Date(dateStr);
      return d >= monday && d <= sunday;
    };

    return {
      pending: all.filter((c) => c.status === "pending").length,
      acceptedThisWeek: all.filter(
        (c) => c.status === "accepted" && inCurrentWeek(c.date)
      ).length,
      totalCompleted: all.filter((c) => c.status === "completed").length,
    };
  },
});

/** Accepted consultations for the current ISO week grouped by day, with student name. */
export const getLecturerWeeklySchedule = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const { monday, sunday } = getISOWeekBounds(new Date());

    const all = await ctx.db
      .query("consultations")
      .withIndex("by_lecturer", (q) => q.eq("lecturerId", userId))
      .collect();

    const thisWeek = all.filter(
      (c) => c.status === "accepted" && (() => {
        const d = new Date(c.date);
        return d >= monday && d <= sunday;
      })()
    );

    // Join student names
    const withStudents = await Promise.all(
      thisWeek.map(async (c) => {
        const student = await ctx.db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", c.studentId))
          .unique();
        const dayIdx = new Date(c.date).getUTCDay();
        return {
          _id: c._id,
          date: c.date,
          time: c.time,
          topic: c.topic,
          dayName: DAY_NAMES[dayIdx],
          studentName: student?.name ?? "Mahasiswa",
          locationType: c.locationType,
          locationDetail: c.locationDetail,
          meetLink: c.meetLink,
        };
      })
    );

    // Group into Mon–Fri skeleton (always return all 5 days)
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    return weekDays.map((day) => ({
      day,
      sessions: withStudents
        .filter((s) => s.dayName === day)
        .sort((a, b) => a.time.localeCompare(b.time)),
    }));
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
