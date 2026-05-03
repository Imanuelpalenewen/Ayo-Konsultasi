import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyNotifications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;
    
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", userId).eq("isRead", false))
      .collect();
      
    return unread.length;
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.optional(v.id("notifications")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.notificationId) {
      const notif = await ctx.db.get(args.notificationId);
      if (notif?.userId === userId) {
        await ctx.db.patch(args.notificationId, { isRead: true });
      }
    } else {
      // Mark all as read
      const unread = await ctx.db
        .query("notifications")
        .withIndex("by_user_unread", (q) => q.eq("userId", userId).eq("isRead", false))
        .collect();
      
      for (const notif of unread) {
        await ctx.db.patch(notif._id, { isRead: true });
      }
    }
  },
});

export const createNotification = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    message: v.string(),
    relatedId: v.optional(v.id("consultations")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});
