import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import type { DataModel } from "./_generated/dataModel";

// Passwords are hashed by Scrypt internally — never stored plain-text.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        return {
          email: (params.email as string).toLowerCase().trim(),
          name: (params.name as string | undefined) ?? "",
          // Custom app fields passed from Register form:
          // These land in `profile` inside createOrUpdateUser ↓
          role: (params.role as string | undefined) ?? "student",
          nim: params.nim as string | undefined,
          nip: params.nip as string | undefined,
        };
      },
    }),
  ],

  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }

      const profile = args.profile as {
        email?: string;
        name?: string;
        role?: "student" | "lecturer";
        nim?: string;
        nip?: string;
        emailVerified?: boolean;
      };

      const email = profile.email ?? "";
      const name = profile.name ?? "";
      const role = profile.role ?? "student";

      const userId = await ctx.db.insert("users", {
        email,
        name,
        emailVerificationTime: Date.now(),
      });

      const existingProfile = await ctx.db
        .query("userProfiles")
        // @ts-ignore - generated types might not be updated yet
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();

      if (!existingProfile) {
        await ctx.db.insert("userProfiles", {
          userId,
          name,
          email,
          role,
          nim: profile.nim,
          nip: profile.nip,
          createdAt: Date.now(),
        });
      }

      return userId;
    },
  },
});
