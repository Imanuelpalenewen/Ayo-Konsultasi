import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { createAccount } from "@convex-dev/auth/server";

/**
 * Seed testing accounts for development.
 *
 * Test Accounts:
 *   Dosen   → dosen.test@unklab.ac.id              / dosen123
 *   Student → student.test@student.unklab.ac.id    / student67
 *
 * HOW TO RUN (one-time, never auto-runs on deploy):
 *   npx convex run seed:seedTestAccounts
 *   — OR — Convex Dashboard → Functions → seed → seedTestAccounts → Run
 *
 * Pressman traceability: US-01, US-02 (reliability / test coverage)
 * Security: passwords are hashed by Convex Auth — never stored plain-text.
 */
export const seedTestAccounts = action({
  args: {},
  handler: async (ctx) => {
    const accounts = [
      {
        name: "Dr. Budi Santoso",
        email: "dosen.test@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "198501012010011001",
      },
      {
        name: "Anisa Putri",
        email: "student.test@student.unklab.ac.id",
        password: "student67",
        role: "student" as const,
        nim: "22051001",
      },
    ];

    const results: string[] = [];

    for (const account of accounts) {
      try {
        // createAccount must be called from an Action context (not a Mutation)
        // It hashes the password via the Password provider crypto config
        const { user } = await createAccount(ctx, {
          provider: "password",
          account: {
            id: account.email,       // email is the unique account ID
            secret: account.password, // will be hashed internally
          },
          profile: {
            email: account.email,
            name: account.name,
            emailVerificationTime: Date.now(),
          },
          shouldLinkViaEmail: false,
        });

        // After the auth user is created, insert our custom profile
        await ctx.runMutation(internal.seed._upsertProfile, {
          userId: user._id as Id<"users">,
          email: account.email,
          name: account.name,
          role: account.role,
          nim: account.nim,
          nip: account.nip,
        });

        results.push(
          `✅ Created: ${account.email} / ${account.password} (${account.role})`
        );
      } catch (e) {
        const msg = (e as Error).message ?? String(e);
        // "Account already exists" is not a failure — skip gracefully
        if (msg.includes("already exists") || msg.includes("duplicate")) {
          results.push(`⚠️  Skipped (already exists): ${account.email}`);
        } else {
          results.push(`❌ Failed: ${account.email} — ${msg}`);
        }
      }
    }

    console.log("\n=== Seed Results ===");
    results.forEach((r) => console.log(r));
    console.log("====================\n");

    return results;
  },
});

/**
 * Internal mutation: create or update the userProfile for a seeded account.
 * Separated from the Action because DB writes must be in Mutations.
 */
export const _upsertProfile = internalMutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("student"), v.literal("lecturer")),
    nim: v.optional(v.string()),
    nip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      // Idempotent: update role/extra fields so re-running seed is safe
      await ctx.db.patch(existing._id, {
        role: args.role,
        nim: args.nim,
        nip: args.nip,
      });
      return existing._id;
    }

    return await ctx.db.insert("userProfiles", {
      userId: args.userId,
      email: args.email,
      name: args.name,
      role: args.role,
      nim: args.nim,
      nip: args.nip,
      createdAt: Date.now(),
    });
  },
});
