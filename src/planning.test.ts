import { describe, expect, it } from "vitest";
import { courses } from "./data";
import { formatPrerequisites, isEligible, parseProfile } from "./planning";

const get = (id: string) => courses.find((c) => c.id === id)!;

describe("curated UA course planning", () => {
  it("migrates removed CS 300 selections to CS 338 without duplicates", () => {
    const completed = parseProfile(
      JSON.stringify({ completed: ["CS 300", "CS 338"], saved: ["CS 300"] }),
    );
    expect(completed.completed).toEqual(["CS 338"]);
    expect(completed.saved).toEqual([]);
    const saved = parseProfile(JSON.stringify({ saved: ["CS 300", "CS 338"] }));
    expect(saved.saved).toEqual(["CS 338"]);
  });
  it("uses the same 57 course records as the backend with their credits and source", () => {
    expect(courses).toHaveLength(57);
    expect(get("CS 100").credits).toBe(4);
    expect(get("CS 301").title).toBe("Database Management Systems");
    expect(get("CS 202").title).toBe("Web Foundations");
    expect(get("CS 495").source).toContain(
      "UA undergraduate CS course catalog",
    );
  });
  it("matches an entire prerequisite path, including capstone alternatives", () => {
    expect(isEligible(get("CS 301"), ["CS 201"])).toBe(false);
    expect(isEligible(get("CS 301"), ["CS 201", "CS 200"])).toBe(true);
    expect(isEligible(get("CS 495"), ["CS 403", "CS 415"])).toBe(false);
    expect(isEligible(get("CS 495"), ["CS 403", "CS 460"])).toBe(true);
    expect(isEligible(get("CS 495"), ["CS 470", "CS 481"])).toBe(true);
    expect(formatPrerequisites(get("CS 495"))).toContain(" or ");
  });
  it("migrates semester choices into saved roadmap interests, including future courses", () => {
    const restored = parseProfile(
      JSON.stringify({
        name: "Taylor",
        completed: ["CS 100", "CS 100", "invalid"],
        schedule: ["CS 100", "CS 101", "CS 495"],
        career: "software",
        creditTarget: 8,
      }),
    );
    expect(restored.completed).toEqual(["CS 100"]);
    expect(restored.saved).toEqual(["CS 101", "CS 495"]);
    expect(restored).not.toHaveProperty("creditTarget");
  });
  it("preserves saved roadmap interests and removes courses marked completed", () => {
    const restored = parseProfile(
      JSON.stringify({
        career: "robotics",
        completed: ["CS 100"],
        saved: ["CS 100", "CS 460", "CS 460", "invalid"],
      }),
    );
    expect(restored.saved).toEqual(["CS 460"]);
  });
});
