import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import type { DataModel } from "./_generated/dataModel";

/**
 * Configure Convex Auth with the Password provider.
 *
 * Key design:
 * 1. Password `profile` function transforms signIn params → user record fields.
 *    Extra fields (name, role, nim, nip) from the Register form are included
 *    here and passed through to `createOrUpdateUser`.
 * 2. `createOrUpdateUser` creates the `users` row (required by Convex Auth)
 *    AND inserts the `userProfiles` row in one atomic step.
 *    This eliminates the race-condition where the old code called
 *    `createUserProfile` AFTER `signIn`, before the session was active.
 *
 * Security: passwords are hashed by Scrypt (Lucia) — never stored plain-text.
 * Pressman: R-01 (auth reliability), R-02 (role-based access)
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      /**
       * Transform the raw signIn params into the profile stored on the user.
       * This is called for EVERY flow (signUp, signIn, reset…).
       * For signIn, only `email` is needed; extra fields are ignored.
       */
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
    /**
     * Called once during sign-up (existingUserId === null).
     * Skipped on sign-in (existingUserId is set → return it as-is).
     *
     * We're responsible for:
     * 1. Inserting the `users` row (Convex Auth uses this ID going forward)
     * 2. Inserting the `userProfiles` row with app-specific fields
     */
    async createOrUpdateUser(ctx, args) {
      // ── Sign-IN: user already exists, nothing to do ──────────────────
      if (args.existingUserId) {
        return args.existingUserId;
      }

      // ── Sign-UP: create the auth user row ────────────────────────────
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

      // Insert the base auth user record (Convex Auth requirement)
      const userId = await ctx.db.insert("users", {
        email,
        name,
        emailVerificationTime: Date.now(),
      });

      // Insert our extended app profile
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
