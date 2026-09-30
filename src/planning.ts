import { courses, emptyProfile } from "./data";
import type { Course, PlanningService, Profile, Recommendation } from "./types";

export function isEligible(course: Course, completed: string[]) {
  // The curated backend data uses OR between groups and AND within a group.
  return (
    course.prerequisites.length === 0 ||
    course.prerequisites.some((group) =>
      group.every((id) => completed.includes(id)),
    )
  );
}

export function formatPrerequisites(course: Course) {
  if (!course.prerequisites.length) return "No modeled CS/ECE prerequisites";
  return course.prerequisites
    .map((group) => group.join(" and "))
    .map((text) => `(${text})`)
    .join(" or ");
}

export function rankCourses(
  profile: Profile,
  catalog: Course[],
): Recommendation[] {
  if (!profile.career) return [];
  return catalog
    .filter(
      (course) =>
        !profile.completed.includes(course.id) &&
        isEligible(course, profile.completed),
    )
    .map((course) => {
      const aligned = course.careers.includes(profile.career!);
      const unlocks = catalog.filter((next) =>
        next.prerequisites.some((group) => group.includes(course.id)),
      ).length;
      return {
        course,
        score:
          (aligned ? 10 : 0) +
          unlocks +
          (profile.workload === "lighter" ? 4 - course.credits : 0),
        reasons: [
          aligned
            ? "Builds skills for your career interest"
            : "Broadens your computing foundation",
          course.prerequisites.length
            ? "Your selected courses match the modeled prerequisites; confirm full requirements with UA"
            : "No modeled CS/ECE prerequisites",
          ...(unlocks
            ? [
                `Connects to ${unlocks} later ${unlocks === 1 ? "course" : "courses"}`,
              ]
            : []),
        ],
      };
    })
    .sort(
      (a, b) =>
        Number(b.course.category === "B.S. required") -
          Number(a.course.category === "B.S. required") ||
        b.score - a.score ||
        a.course.id.localeCompare(b.course.id),
    )
    .slice(0, 5);
}

export const localPlanningService: PlanningService = {
  async recommend(profile, catalog) {
    return rankCourses(profile, catalog);
  },
};

// Prior demo IDs described different subjects; do not silently reuse them.
export const legacyStorageKey = "pathfinder-ua:profile:v1";
export const storageKey = "pathfinder-ua:profile:curated:v2";

export function parseProfile(raw: string | null): Profile {
  if (!raw) return { ...emptyProfile };
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object")
    throw new Error("Invalid saved profile");
  const p = value as Record<string, unknown>;
  const ids = (input: unknown): string[] =>
    Array.isArray(input)
      ? [
          ...new Set(
            input.filter(
              (id): id is string =>
                typeof id === "string" && courses.some((c) => c.id === id),
            ),
          ),
        ]
      : [];
  const completed = ids(p.completed);
  return {
    name: typeof p.name === "string" ? p.name.slice(0, 40) : "",
    completed,
    career:
      p.career === "software" || p.career === "data" || p.career === "robotics"
        ? p.career
        : null,
    creditTarget:
      typeof p.creditTarget === "number" &&
      Number.isInteger(p.creditTarget) &&
      p.creditTarget >= 1 &&
      p.creditTarget <= 21
        ? p.creditTarget
        : 12,
    workload: p.workload === "lighter" ? "lighter" : "balanced",
    schedule: ids(p.schedule).filter(
      (id) =>
        !completed.includes(id) &&
        isEligible(
          courses.find((c) => c.id === id)!,
          completed,
        ),
    ),
    setupComplete: p.setupComplete === true,
  };
}
