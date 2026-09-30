import { courses, emptyProfile } from "./data";
import type { Course, Profile } from "./types";

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
