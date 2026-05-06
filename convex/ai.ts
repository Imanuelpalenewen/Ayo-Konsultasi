"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { callAI } from "./aiProvider";
import type { Doc } from "./_generated/dataModel";

export const recommendLecturers = action({
  args: {
    topic: v.string(),
    description: v.string(),
    preferredDates: v.string(),
  },
  handler: async (ctx, args) => {
    const lecturers = await ctx.runQuery(api.users.getLecturers);

    const lecturerData = lecturers.map((l) => ({
      id: l.userId,
      name: l.name,
      expertise: l.expertise || [],
      availability: l.availability || [],
    }));

    const prompt = `
You are an academic consultation assistant. Given a student's consultation need and a list of lecturers with their expertise and availability, return the top 3 best-matched lecturers.

Student Need:
Topic: ${args.topic}
Description: ${args.description}
Preferred Dates: ${args.preferredDates}

Lecturers Data:
${JSON.stringify(lecturerData, null, 2)}

Respond ONLY in valid JSON format. Do not use markdown blocks like \`\`\`json. Return an array of up to 3 objects. IMPORTANT: Do NOT duplicate lecturers. If there is only 1 or 2 lecturers provided in the Lecturers Data, return an array of exactly that size.
Format:
[
  {
    "lecturerId": "id",
    "lecturerName": "name",
    "matchScore": 95,
    "matchReason": "Short explanation of why this is a good match based on expertise.",
    "suggestedSlots": ["Monday 09:00", "Tuesday 10:00"]
  }
]
`.trim();

    try {
      const responseText = await callAI(prompt);
      console.log("[ai:recommendLecturers] Raw response:", responseText.slice(0, 300));

      // Strip any markdown code fences the model may have included
      const cleaned = responseText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      // Find the JSON array in the response (model sometimes adds prose)
      const arrayStart = cleaned.indexOf("[");
      const arrayEnd = cleaned.lastIndexOf("]");
      if (arrayStart === -1 || arrayEnd === -1) {
        console.error("[ai:recommendLecturers] No JSON array found in response:", cleaned);
        throw new Error("Response did not contain a JSON array.");
      }
      const jsonStr = cleaned.slice(arrayStart, arrayEnd + 1);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("[ai:recommendLecturers] Failed:", error);
      throw new Error("Gagal menghasilkan rekomendasi. Silakan coba lagi.");
    }
  },
});

export const recommendReassignTargets = action({
  args: {
    consultationId: v.id("consultations"),
  },
  handler: async (ctx, args) => {
    const consultation = await ctx.runQuery(api.consultations.getConsultationById, {
      consultationId: args.consultationId,
    });
    if (!consultation) throw new Error("Consultation not found");

    const allLecturers = await ctx.runQuery(api.users.getLecturers);

    // Exclude the current lecturer who is reassigning
    const candidates = allLecturers.filter(
      (l: Doc<"userProfiles">) => l.userId !== consultation.lecturerId
    );

    const candidateData = candidates.map((l: Doc<"userProfiles">) => ({
      id: l.userId,
      name: l.name,
      expertise: l.expertise || [],
      availability: l.availability || [],
    }));

    const prompt = `
You are an academic consultation assistant. A lecturer wants to reassign a student consultation to another lecturer. Pick the top 3 best-fit candidates.

Consultation to reassign:
Topic: ${consultation.topic}
Notes: ${consultation.notes || "none"}
Scheduled Date: ${consultation.date}
Scheduled Time: ${consultation.time}

Available lecturers (excluding the current one):
${JSON.stringify(candidateData, null, 2)}

Respond ONLY in valid JSON format. Do not use markdown blocks like \`\`\`json. Return an array of up to 3 objects. IMPORTANT: Do NOT duplicate lecturers. If fewer than 3 candidates exist, return an array of exactly that size.
Format:
[
  {
    "lecturerId": "id",
    "lecturerName": "name",
    "matchScore": 90,
    "matchReason": "Short explanation of why this lecturer is a good fit for reassignment.",
    "suggestedSlots": ["Monday 09:00", "Wednesday 10:00"]
  }
]
`.trim();

    try {
      const responseText = await callAI(prompt);
      console.log("[ai:recommendReassignTargets] Raw response:", responseText.slice(0, 300));

      const cleaned = responseText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const arrayStart = cleaned.indexOf("[");
      const arrayEnd = cleaned.lastIndexOf("]");
      if (arrayStart === -1 || arrayEnd === -1) {
        console.error("[ai:recommendReassignTargets] No JSON array found:", cleaned);
        throw new Error("Response did not contain a JSON array.");
      }
      const jsonStr = cleaned.slice(arrayStart, arrayEnd + 1);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("[ai:recommendReassignTargets] Failed:", error);
      throw new Error("Gagal menghasilkan rekomendasi reassign. Silakan coba lagi.");
    }
  },
});
