import { describe, expect, it } from "vitest";
import { courses, emptyProfile } from "./data";
import {
  formatPrerequisites,
  isEligible,
  parseProfile,
  rankCourses,
} from "./planning";

const get = (id: string) => courses.find((c) => c.id === id)!;

describe("curated UA course planning", () => {
  it("uses the same 19 course records as the backend with their credits and source", () => {
    expect(courses).toHaveLength(19);
    expect(get("CS 100").credits).toBe(4);
    expect(get("CS 301").title).toBe("Database Management Systems");
    expect(get("CS 202").title).toBe("Web Foundations");
    expect(get("CS 495").source).toContain("UA Computer Science syllabus");
  });
  it("matches an entire prerequisite path, including capstone alternatives", () => {
    expect(isEligible(get("CS 301"), ["CS 201"])).toBe(false);
    expect(isEligible(get("CS 301"), ["CS 201", "CS 200"])).toBe(true);
    expect(isEligible(get("CS 495"), ["CS 403", "CS 415"])).toBe(false);
    expect(isEligible(get("CS 495"), ["CS 403", "CS 460"])).toBe(true);
    expect(isEligible(get("CS 495"), ["CS 470", "CS 481"])).toBe(true);
    expect(formatPrerequisites(get("CS 495"))).toContain(" or ");
  });
  it("ranks core choices ahead of electives and excludes completed courses", () => {
    const profile = {
      ...emptyProfile,
      career: "software" as const,
      completed: ["CS 100", "CS 101"],
    };
    const result = rankCourses(profile, courses);
    expect(result.map((r) => r.course.id)).toContain("CS 200");
    expect(result.map((r) => r.course.id)).toContain("CS 201");
    expect(
      result.every(
        (r) =>
          !profile.completed.includes(r.course.id) &&
          isEligible(r.course, profile.completed),
      ),
    ).toBe(true);
    const firstElective = result.findIndex(
      (r) => r.course.category !== "B.S. required",
    );
    if (firstElective >= 0)
      expect(
        result
          .slice(0, firstElective)
          .every((r) => r.course.category === "B.S. required"),
      ).toBe(true);
    expect(rankCourses(profile, courses)).toEqual(result);
  });
  it("preserves a valid local plan and removes invalid selections", () => {
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
    expect(restored.schedule).toEqual(["CS 101"]);
    expect(restored.creditTarget).toBe(8);
  });
});
