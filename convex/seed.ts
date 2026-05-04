import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { createAccount } from "@convex-dev/auth/server";

/**
 * Seed testing accounts for development.
 *
 * Test Accounts:
 *   Student → student.test@student.unklab.ac.id / student67
 *
 * Dosen UNKLAB Prodi Ilmu Komputer:
 *   andrew.liem@unklab.ac.id / dosen123
 *   debby.sondakh@unklab.ac.id / dosen123
 *   ... (semua dosen di bawah)
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
    const defaultAvailability = [
      { day: "monday", startTime: "09:00", endTime: "12:00" },
      { day: "wednesday", startTime: "13:00", endTime: "15:00" },
      { day: "friday", startTime: "10:00", endTime: "14:00" },
    ];

    const accounts = [
      // ── Dosen UNKLAB Prodi Ilmu Komputer 
      {
        name: "Prof. Andrew T. Liem, M.T., Ph.D",
        email: "andrew.liem@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-001",
        expertise: ["Artificial Intelligence", "Machine Learning", "Algoritma", "Komputasi Paralel"],
        availability: defaultAvailability,
      },
      {
        name: "Debby E. Sondakh, S.Kom., M.T., Ph.D",
        email: "debby.sondakh@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-002",
        expertise: ["Image Processing", "Computer Vision", "Pengolahan Citra Digital", "Penelitian Ilmiah"],
        availability: defaultAvailability,
      },
      {
        name: "Ir. Edson Y. Putra, M.Kom.",
        email: "edson.putra@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-003",
        expertise: ["Sistem Informasi", "Rekayasa Perangkat Lunak", "Pemrograman Web", "Basis Data"],
        availability: defaultAvailability,
      },
      {
        name: "George M. W. Tangka, S.Kom., MBA",
        email: "george.tangka@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-004",
        expertise: ["Manajemen Teknologi Informasi", "E-Commerce", "Sistem Informasi Bisnis", "Kewirausahaan Digital"],
        availability: defaultAvailability,
      },
      {
        name: "Green A. Sandag, S.Kom., M.S.",
        email: "green.sandag@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-005",
        expertise: ["Jaringan Komputer", "Keamanan Jaringan", "Sistem Terdistribusi", "Network Engineering"],
        availability: defaultAvailability,
      },
      {
        name: "Jacquline M. S. Waworundeng, M.T.",
        email: "jacquline.waworundeng@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-006",
        expertise: ["Human-Computer Interaction", "UI/UX Design", "Interaksi Manusia-Komputer", "Desain Antarmuka"],
        availability: defaultAvailability,
      },
      {
        name: "Joe Y. Mambu, BSIT, MCIS",
        email: "joe.mambu@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-007",
        expertise: ["Pemrograman", "Algoritma", "Struktur Data", "Software Development", "Skripsi"],
        availability: defaultAvailability,
      },
      {
        name: "Lidya C. Laoh, S.Kom., MMSi",
        email: "lidya.laoh@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-008",
        expertise: ["Sistem Informasi Manajemen", "Basis Data", "Analisis Sistem", "Database Administration"],
        availability: defaultAvailability,
      },
      {
        name: "Oktoverano H. Lengkong, S.Kom., M.Ds., MM",
        email: "oktoverano.lengkong@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-009",
        expertise: ["Desain Grafis", "Multimedia", "Animasi Digital", "Teknologi Kreatif", "UI Design"],
        availability: defaultAvailability,
      },
      {
        name: "Reymon Rotikan, S.Kom., M.S., M.M.",
        email: "reymon.rotikan@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-010",
        expertise: ["Basis Data", "Data Mining", "Business Intelligence", "Skripsi", "Metodologi Penelitian"],
        availability: defaultAvailability,
      },
      {
        name: "Reynoldus A. Sahulata, S.Kom., M.M.",
        email: "reynoldus.sahulata@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-011",
        expertise: ["Manajemen Proyek IT", "Sistem Informasi", "Tata Kelola IT", "Project Management"],
        availability: defaultAvailability,
      },
      {
        name: "Rolly Lontaan, M.Kom.",
        email: "rolly.lontaan@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-012",
        expertise: ["Pemrograman Mobile", "Android Development", "Rekayasa Perangkat Lunak", "Skripsi"],
        availability: defaultAvailability,
      },
      {
        name: "Stenly I. Adam, S.Kom., M.Sc.",
        email: "stenly.adam@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-013",
        expertise: ["Kecerdasan Buatan", "Natural Language Processing", "Riset Komputasi", "Deep Learning"],
        availability: defaultAvailability,
      },
      {
        name: "Wilsen Mokodaser, S.Kom.",
        email: "wilsen.mokodaser@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-014",
        expertise: ["Pemrograman Dasar", "Algoritma", "Web Development", "JavaScript"],
        availability: defaultAvailability,
      },
      {
        name: "Raissa Camila, S.Kom.",
        email: "raissa.camila@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-015",
        expertise: ["Pemrograman", "Frontend Development", "Desain UI", "React"],
        availability: defaultAvailability,
      },
      {
        name: "Andria K. Wahyudi, S.Kom., M.Eng.",
        email: "andria.wahyudi@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-016",
        expertise: ["Internet of Things (IoT)", "Embedded Systems", "Jaringan Sensor", "Mikrokontroler"],
        availability: defaultAvailability,
      },
      {
        name: "Steven Lolong, S.Kom., MT",
        email: "steven.lolong@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-017",
        expertise: ["Rekayasa Perangkat Lunak", "Pemrograman", "Software Testing"],
        availability: [], // sedang studi lanjut
      },
      {
        name: "Jein Rewah, S.Kom., MBA",
        email: "jein.rewah@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "UNKLAB-018",
        expertise: ["Sistem Informasi Bisnis", "E-Business", "Manajemen"],
        availability: [], // sedang studi lanjut
      },

      // ── Mahasiswa test ────────────────────────────────────────────────────
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
          nim: (account as any).nim,
          nip: (account as any).nip,
          expertise: (account as any).expertise,
          availability: (account as any).availability,
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
        expertise: args.expertise,
        availability: args.availability,
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
      expertise: args.expertise,
      availability: args.availability,
      createdAt: Date.now(),
    });
  },
});

/**
 * Hapus semua profil dosen dari database.
 * JALANKAN INI DULU sebelum seedTestAccounts untuk mengganti dosen lama.
 *
 * HOW TO RUN:
 *   npx convex run seed:clearLecturers
 *   — OR — Convex Dashboard → Functions → seed → clearLecturers → Run
 */
export const clearLecturers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const lecturers = await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("role", "lecturer"))
      .collect();

    let count = 0;
    for (const lecturer of lecturers) {
      await ctx.db.delete(lecturer._id);
      count++;
    }

    console.log(`🗑️  Deleted ${count} lecturer profiles.`);
    return { deleted: count };
  },
});

