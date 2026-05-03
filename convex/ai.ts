"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from "./_generated/api";

export const recommendLecturers = action({
  args: {
    topic: v.string(),
    description: v.string(),
    preferredDates: v.string(),
  },
  handler: async (ctx, args) => {
    // Fetch all lecturers from the database
    const lecturers = await ctx.runQuery(api.users.getLecturers);

    // Filter out those with no expertise set, maybe? Or send all.
    const lecturerData = lecturers.map(l => ({
      id: l.userId, // use userId so we can book
      name: l.name,
      expertise: l.expertise || [],
      availability: l.availability || [],
    }));

    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY environment variable not set");

    const modelName = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

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
`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean the response just in case the model returns markdown
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (error) {
      console.error("AI Recommendation failed:", error);
      throw new Error("Failed to generate recommendations. Please try again.");
    }
  },
});
