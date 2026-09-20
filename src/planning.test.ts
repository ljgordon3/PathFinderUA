import { describe, expect, it } from "vitest";
import { courses, emptyProfile } from "./data";
import { isEligible, parseProfile, rankCourses } from "./planning";

describe("demo planning rules", () => {
  it("requires all AND groups and accepts alternatives within OR groups", () => {
    const robotics = courses.find((c) => c.id === "CS 430")!;
    expect(isEligible(robotics, ["CS 201"])).toBe(false);
    expect(isEligible(robotics, ["CS 201", "CS 202"])).toBe(true);
    const databases = courses.find((c) => c.id === "CS 340")!;
    expect(isEligible(databases, ["CS 200"])).toBe(true);
    expect(isEligible(databases, ["CS 201"])).toBe(true);
    expect(isEligible(databases, [])).toBe(false);
  });
  it("excludes completed and ineligible courses and ranks consistently", () => {
    const profile = {
      ...emptyProfile,
      career: "software" as const,
      completed: ["CS 100", "CS 101"],
    };
    const results = rankCourses(profile, courses);
    expect(results.map((r) => r.course.id)).toEqual([
      "CS 201",
      "CS 200",
      "CS 202",
    ]);
    expect(rankCourses(profile, courses)).toEqual(results);
    expect(
      rankCourses({ ...emptyProfile, career: "software" }, courses).map(
        (r) => r.course.id,
      ),
    ).toEqual(["CS 100"]);
  });
  it("sanitizes saved values and removes completed or ineligible planned courses", () => {
    const profile = parseProfile(
      JSON.stringify({
        name: "Taylor",
        completed: ["CS 100", "CS 100", "invalid"],
        schedule: ["CS 100", "CS 101", "CS 430"],
        creditTarget: -2,
        career: "unknown",
      }),
    );
    expect(profile.completed).toEqual(["CS 100"]);
    expect(profile.schedule).toEqual(["CS 101"]);
    expect(profile.creditTarget).toBe(12);
    expect(profile.career).toBeNull();
    expect(() => parseProfile("{broken")).toThrow();
  });
});
