import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { createAccount } from "@convex-dev/auth/server";

/**
 * Seed official UNKLAB lecturer and student accounts for development/demo.
 *
 * Lecturer password: dosen123
 * Student password:  student123
 *
 * HOW TO RUN (run clearLecturers first to remove stale data):
 *   npx convex run seed:clearLecturers
 *   npx convex run seed:seedTestAccounts
 *   — OR — Convex Dashboard → Functions → seed → Run
 *
 * Pressman traceability: US-01, US-02 (reliability / test coverage)
 * Security: passwords are hashed by Convex Auth — never stored plain-text.
 */
export const seedTestAccounts = action({
  args: {},
  handler: async (ctx) => {
    // Aturan ketersediaan UNKLAB (universitas Advent):
    // - Sabtu: TIDAK tersedia (Sabbath)
    // - Jumat malam (≥18:00): TIDAK tersedia
    // - Jumat sore: max endTime 16:00
    // - Minggu: tersedia (siang/sore, 09:00–16:00)
    // - Pimpinan (Dekan + 3 Kaprodi): hanya 2 hari (sibuk)
    // - Dosen lain: 2–3 hari, jam bervariasi tapi masuk akal

    const accounts = [
      // ── Dosen UNKLAB FILKOM (24 orang, data resmi Datadummy.xlsx) ──────────

      // PIMPINAN — hanya 2 hari karena jabatan struktural
      {
        name: "Stenly R. Pungus, S.Kom., MT., M.M., Ph.D",
        email: "stenly.pungus@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "198501012010011000",
        expertise: ["Dean", "Software Engineering", "Thesis Supervision", "Research Methodology"],
        availability: [
          { day: "monday", startTime: "09:00", endTime: "11:00" },
          { day: "wednesday", startTime: "13:00", endTime: "15:00" },
        ],
      },
      {
        name: "Semmy W. Taju, S.Kom., M.S., Ph.D",
        email: "semmy.taju@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "197912152008011002",
        expertise: ["Head of Informatics", "AI", "Machine Learning", "Thesis Supervision"],
        availability: [
          { day: "tuesday", startTime: "10:00", endTime: "12:00" },
          { day: "friday", startTime: "09:00", endTime: "11:00" },
        ],
      },
      {
        name: "Jimmy H. Moedjahedy, S.Kom., M.M., M.Kom",
        email: "jimmy.moedjahedy@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "198307212011012003",
        expertise: ["Head of Information Systems", "Web Development", "Computer Networks", "Thesis Supervision"],
        availability: [
          { day: "wednesday", startTime: "09:00", endTime: "11:00" },
          { day: "friday", startTime: "08:00", endTime: "10:00" },
        ],
      },
      {
        name: "Ir. Marchel Timothy Tombeng, S.Kom., MS",
        email: "marchel.tombeng@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "197805062007011004",
        expertise: ["Head of Information Technology", "Web Development", "Database Management", "Thesis Supervision"],
        availability: [
          { day: "monday", startTime: "13:00", endTime: "15:00" },
          { day: "wednesday", startTime: "10:00", endTime: "12:00" },
        ],
      },  

      // DOSEN REGULER 
      {
        name: "Prof. Andrew T. Liem, S.Si., MT., Ph.D",
        email: "andrew.liem@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "198912112015012005",
        expertise: ["Informatics", "Computer Networks", "Software Engineering", "System Analysis and Design", "AI", "Thesis Supervision"],
        availability: [
          { day: "monday", startTime: "09:00", endTime: "12:00" },
          { day: "wednesday", startTime: "09:00", endTime: "11:00" },
          { day: "thursday", startTime: "14:00", endTime: "16:00" },
        ],
      },
      {
        name: "Debby E. Sondakh, S.Kom., M.T., Ph.D",
        email: "debby.sondakh@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "198104092009011006",
        expertise: ["Informatics", "Data Analytics", "Research Methodology", "Automata", "Proposal Writing", "Thesis Supervision"],
        availability: [
          { day: "tuesday", startTime: "09:00", endTime: "11:30" },
          { day: "thursday", startTime: "13:00", endTime: "15:30" },
        ],
      },
      {
        name: "Ir. Edson Y. Putra, M.Kom",
        email: "edson.putra@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "198606172012012007",
        expertise: ["Information Systems", "Database Management", "Computer Ethics", "Project Capstone", "Thesis Supervision"],
        availability: [
          { day: "monday", startTime: "10:00", endTime: "12:00" },
          { day: "thursday", startTime: "13:00", endTime: "16:00" },
        ],
      },
      {
        name: "Oktoverano H. Lengkong, S.Kom., M.Ds., M.M.",
        email: "oktoverano.lengkong@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "197711252006011008",
        expertise: ["Information Technology", "Web Development", "UI/UX Design", "Graphic Design", "Thesis Supervision"],
        availability: [
          { day: "tuesday", startTime: "13:00", endTime: "15:00" },
          { day: "friday", startTime: "09:00", endTime: "11:00" },
          { day: "sunday", startTime: "14:00", endTime: "16:00" },
        ],
      },
      {
        name: "Green Ferry Mandias, S.Kom., M.Cs., M.M",
        email: "green.mandias@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "199001032016012009",
        expertise: ["Informatics", "Database Management", "Thesis Supervision"],
        availability: [
          { day: "monday", startTime: "13:00", endTime: "15:30" },
          { day: "wednesday", startTime: "13:00", endTime: "15:00" },
          { day: "friday", startTime: "10:00", endTime: "12:00" },
        ],
      },
      {
        name: "Green A. Sandag, S.Kom., M.S",
        email: "green.sandag@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "198208142010011010",
        expertise: ["Informatics", "Artificial Intelligence", "Natural Language Processing", "Thesis Supervision"],
        availability: [
          { day: "tuesday", startTime: "10:00", endTime: "12:00" },
          { day: "thursday", startTime: "09:00", endTime: "11:00" },
          { day: "friday", startTime: "13:00", endTime: "15:30" },
        ],
      },
      {
        name: "Jacquline M. Waworundeng, S.T., M.T",
        email: "jacquline.waworundeng@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "198711192013012011",
        expertise: ["Informatics", "Robotics", "Internet of Things", "Thesis Supervision"],
        availability: [
          { day: "monday", startTime: "08:00", endTime: "10:00" },
          { day: "wednesday", startTime: "13:00", endTime: "15:30" },
        ],
      },
      {
        name: "Reynoldus A. Sahulata, S.Kom., M.M.",
        email: "reynoldus.sahulata@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "198203152009011012",
        expertise: ["Information Systems", "Management Information Systems", "IT Governance", "Automata", "Thesis Supervision"],
        availability: [
          { day: "tuesday", startTime: "13:00", endTime: "15:00" },
          { day: "thursday", startTime: "10:00", endTime: "12:00" },
          { day: "sunday", startTime: "10:00", endTime: "12:00" },
        ],
      },
      {
        name: "Joe Y. Y. Mambu, B.IT., MCIS",
        email: "joe.mambu@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "197909082007012013",
        expertise: ["Information Systems", "Enterprise Resource Planning (ERP)", "Thesis Supervision"],
        availability: [
          { day: "wednesday", startTime: "09:00", endTime: "11:00" },
          { day: "thursday", startTime: "14:00", endTime: "16:00" },
        ],
      },
      {
        name: "Lidya C. Laoh, S.Kom, M.Msi",
        email: "lidya.laoh@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "198611232012011014",
        expertise: ["Information Systems", "Data Structures", "Computer Programming", "Thesis Supervision"],
        availability: [
          { day: "monday", startTime: "09:00", endTime: "11:00" },
          { day: "thursday", startTime: "13:00", endTime: "15:00" },
          { day: "friday", startTime: "10:00", endTime: "12:00" },
        ],
      },
      {
        name: "Wilsen Grivin Mokodaser, S.Kom., M.Kom",
        email: "wilsen.mokodaser@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "197512302005011015",
        expertise: ["Informatics", "Computer Networks", "Computer Ethics", "Thesis Supervision"],
        availability: [
          { day: "monday", startTime: "10:00", endTime: "12:00" },
          { day: "wednesday", startTime: "14:00", endTime: "16:00" },
        ],
      },
      {
        name: "Reymon Rotikan, S.Kom., M.S., M.M.",
        email: "reymon.rotikan@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "198907142014012016",
        expertise: ["Information Systems", "Database Management", "Web Development", "Thesis Supervision"],
        availability: [
          { day: "tuesday", startTime: "08:00", endTime: "10:00" },
          { day: "thursday", startTime: "13:00", endTime: "15:30" },
          { day: "friday", startTime: "09:00", endTime: "11:00" },
        ],
      },
      {
        name: "Rolly J. Lontaan, S.Kom., M.Kom",
        email: "rolly.lontaan@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "198001252008011017",
        expertise: ["Informatics", "System Programming", "Visual Programming", "Calculus", "Internet of Things", "Thesis Supervision"],
        availability: [
          { day: "monday", startTime: "10:00", endTime: "12:00" },
          { day: "wednesday", startTime: "10:00", endTime: "12:30" },
          { day: "friday", startTime: "09:00", endTime: "11:00" },
        ],
      },
      {
        name: "Stenly I. Adam, S.Kom., M.Sc",
        email: "stenly.adam@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "197811092006012018",
        expertise: ["Informatics", "Mobile App Development", "Front End", "Thesis Supervision"],
        availability: [
          { day: "monday", startTime: "09:00", endTime: "11:30" },
          { day: "thursday", startTime: "09:00", endTime: "11:00" },
          { day: "sunday", startTime: "10:00", endTime: "12:00" },
        ],
      },
      {
        name: "George M. W. Tangka, S.Kom., MBA",
        email: "george.tangka@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "199102182017011019",
        expertise: ["Information Systems", "Business Intelligence", "Data Analytics", "Management Information Systems", "Data Structure", "Thesis Supervision"],
        availability: [
          { day: "tuesday", startTime: "13:00", endTime: "15:30" },
          { day: "thursday", startTime: "13:00", endTime: "16:00" },
        ],
      },
      {
        name: "Andria K. Wahyudi, SKom, M.Eng",
        email: "andria.wahyudi@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "198405062010012020",
        expertise: ["Informatics", "Computer Graphic", "Game Development", "Thesis Supervision"],
        availability: [
          { day: "monday", startTime: "13:00", endTime: "15:00" },
          { day: "wednesday", startTime: "08:00", endTime: "10:00" },
          { day: "friday", startTime: "10:00", endTime: "12:00" },
        ],
      },
      {
        name: "Raissa Camila Maringka, S.Kom., M.Kom",
        email: "raissa.maringka@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "198712212013011021",
        expertise: ["Informatics", "Algorithms", "Thesis Supervision"],
        availability: [
          { day: "tuesday", startTime: "09:00", endTime: "11:00" },
          { day: "wednesday", startTime: "13:00", endTime: "15:30" },
          { day: "sunday", startTime: "14:00", endTime: "16:00" },
        ],
      },
      {
        name: "Argha O. Silitonga, S.Kom., M.S",
        email: "argha.silitonga@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "198305172009011023",
        expertise: ["Informatics", "Machine Learning", "Mobile App Development", "Thesis Supervision"],
        availability: [
          { day: "monday", startTime: "13:00", endTime: "15:30" },
          { day: "thursday", startTime: "10:00", endTime: "12:00" },
        ],
      },
      {
        name: "Regi F. Najoan, S.Kom., M.Kom",
        email: "regi.najoan@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "197912082007012024",
        expertise: ["Informatics", "Web Development", "Back End", "Thesis Supervision"],
        availability: [
          { day: "wednesday", startTime: "13:00", endTime: "15:30" },
          { day: "friday", startTime: "10:00", endTime: "12:00" },
          { day: "sunday", startTime: "13:00", endTime: "15:00" },
        ],
      },
      {
        name: "Julio Kolapitawondal, S.Kom., M.I",
        email: "julio.kolapitawondal@unklab.ac.id",
        password: "dosen123",
        role: "lecturer" as const,
        nip: "199104252018011025",
        expertise: ["Information Technology", "Graphic Design", "Video Editing", "Animation", "UI/UX", "Thesis Supervision"],
        availability: [
          { day: "tuesday", startTime: "13:00", endTime: "15:00" },
          { day: "thursday", startTime: "08:00", endTime: "10:30" },
          { day: "friday", startTime: "13:00", endTime: "15:30" },
        ],
      },

      // Mahasiswa UNKLAB 24 orang
      {
        name: "Noel Palenewen",
        email: "s22310473@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051001",
        major: "Informatics",
      },
      {
        name: "Budi Pratama",
        email: "s2222051002@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051002",
        major: "Informatics",
      },
      {
        name: "Citra Lestari",
        email: "s2222051003@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051003",
        major: "Informatics",
      },
      {
        name: "Dimas Saputra",
        email: "s2222051004@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051004",
        major: "Information Systems",
      },
      {
        name: "Tinusmar Sheptia",
        email: "s2222051005@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051005",
        major: "DKV",
      },
      {
        name: "Nona Umboh",
        email: "s2222051006@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051006",
        major: "Informatics",
      },
      {
        name: "Valerie Liogu",
        email: "s2222051007@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051007",
        major: "Informatics",
      },
      {
        name: "Nobel Situmorang",
        email: "s2222051008@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051008",
        major: "Informatics",
      },
      {
        name: "Septian Rantung",
        email: "s2122051009@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051009",
        major: "Information Systems",
      },
      {
        name: "Intan Sari",
        email: "s2222051010@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051010",
        major: "Information Systems",
      },
      {
        name: "Budi Marloy",
        email: "s2222051011@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051011",
        major: "Informatics",
      },
      {
        name: "Kevin Sartono",
        email: "s2222051012@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051012",
        major: "Information Systems",
      },
      {
        name: "Novian Susanto",
        email: "s2222051013@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051013",
        major: "DKV",
      },
      {
        name: "Ivana Sondakh",
        email: "s2222051014@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051014",
        major: "Information Systems",
      },
      {
        name: "Caren Kaunang",
        email: "s2222051015@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051015",
        major: "Information Systems",
      },
      {
        name: "Lemmy Lengkong",
        email: "s2222051016@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051016",
        major: "Informatics",
      },
      {
        name: "Dodi Gerungan",
        email: "s2222051017@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051018",
        major: "DKV",
      },
      {
        name: "Marshel Lawitan",
        email: "s2222051018@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051019",
        major: "DKV",
      },
      {
        name: "Adam Maengkong",
        email: "s2222051019@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051017",
        major: "Informatics",
      },
      {
        name: "Stenly Pangelewen",
        email: "s2222051020@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051020",
        major: "Information Systems",
      },
      {
        name: "Iman Permata Kandow",
        email: "s2222051021@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051022",
        major: "DKV",
      },
      {
        name: "Jeremmiah Kuagow",
        email: "s2122051022@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051023",
        major: "Informatics",
      },
      {
        name: "Andrew Lenzun",
        email: "s2222051023@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051024",
        major: "Information Systems",
      },
      {
        name: "Marsel Wijaya",
        email: "s2222051024@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051025",
        major: "Informatics",
      },
      {
        name: "Wilson Alow",
        email: "s2222051025@student.unklab.ac.id",
        password: "student123",
        role: "student" as const,
        nim: "22051026",
        major: "Informatics",
      },
    ];

    const results: string[] = [];

    for (const account of accounts) {
      try {
        const { user } = await createAccount(ctx, {
          provider: "password",
          account: {
            id: account.email,
            secret: account.password,
          },
          profile: {
            email: account.email,
            name: account.name,
            emailVerificationTime: Date.now(),
          },
          shouldLinkViaEmail: false,
        });

        await ctx.runMutation(internal.seed._upsertProfile, {
          userId: user._id as Id<"users">,
          email: account.email,
          name: account.name,
          role: account.role,
          nim: (account as any).nim,
          nip: (account as any).nip,
          major: (account as any).major,
          expertise: (account as any).expertise,
          availability: (account as any).availability,
        });

        results.push(`✅ Created: ${account.email} (${account.role})`);
      } catch (e) {
        const msg = (e as Error).message ?? String(e);
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
 */
export const _upsertProfile = internalMutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("student"), v.literal("lecturer")),
    nim: v.optional(v.string()),
    nip: v.optional(v.string()),
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
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        role: args.role,
        nim: args.nim,
        nip: args.nip,
        major: args.major,
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
      major: args.major,
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

/**
 * Hapus semua data konsultasi dari database (termasuk notifikasi terkait).
 * Berguna untuk membersihkan data dummy sebelum demo.
 * HOW TO RUN:
 *   npx convex run seed:clearConsultations
 */
export const clearConsultations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const consultations = await ctx.db.query("consultations").collect();
    let consultationCount = 0;
    for (const c of consultations) {
      await ctx.db.delete(c._id);
      consultationCount++;
    }

    const notifications = await ctx.db.query("notifications").collect();
    let notificationCount = 0;
    for (const n of notifications) {
      await ctx.db.delete(n._id);
      notificationCount++;
    }

    console.log(`🗑️  Deleted ${consultationCount} consultations and ${notificationCount} notifications.`);
    return { consultations: consultationCount, notifications: notificationCount };
  },
});
