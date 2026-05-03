import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

// @ts-ignore - import.meta.glob is provided by vite
const modules = import.meta.glob("./**/*.*s");

describe("Consultations Backend", () => {
  test("createConsultation requires authentication", async () => {
    const t = convexTest(schema, modules);
    
    // Generate a valid ID by inserting a dummy user
    const lecturerId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {});
    });
    
    // We expect it to throw since we haven't provided an identity
    await expect(
      t.mutation(api.consultations.createConsultation, {
        lecturerId,
        date: "2030-01-01",
        time: "10:00",
        topic: "Testing",
        locationType: "online",
      })
    ).rejects.toThrow("Not authenticated");
  });

  test("updateStatus requires authentication", async () => {
    const t = convexTest(schema, modules);
    
    const studentId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {});
    });

    const lecturerId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {});
    });

    const consultationId = await t.run(async (ctx) => {
      return await ctx.db.insert("consultations", {
        studentId,
        lecturerId,
        date: "2030-01-01",
        time: "10:00",
        topic: "Testing",
        locationType: "online",
        status: "pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });
    
    await expect(
      t.mutation(api.consultations.updateStatus, {
        consultationId,
        status: "accepted",
      })
    ).rejects.toThrow("Not authenticated");
  });

  test("getLecturerRequests returns empty array for unauthenticated users", async () => {
    const t = convexTest(schema, modules);
    
    const requests = await t.query(api.consultations.getLecturerRequests);
    expect(requests).toEqual([]);
  });

  test("getStudentHistory returns empty array for unauthenticated users", async () => {
    const t = convexTest(schema, modules);
    
    const history = await t.query(api.consultations.getStudentHistory);
    expect(history).toEqual([]);
  });
});
