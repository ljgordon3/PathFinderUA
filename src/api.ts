import {
  apiId,
  backendCareerId,
  displayId,
  mapCourse,
  skillName,
  type ApiCourse,
} from "./data";
import type { Career, Course, Profile, Recommendation, Roadmap } from "./types";

async function request<T>(
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || "/api"}${path}`,
    {
      method: body === undefined ? "GET" : "POST",
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    },
  );
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function getCourses(): Promise<Course[]> {
  const records = await request<ApiCourse[]>("/courses");
  return records
    .map(mapCourse)
    .sort(
      (a, b) =>
        Number(b.category === "B.S. required") -
          Number(a.category === "B.S. required") || a.id.localeCompare(b.id),
    );
}

export async function getCareers(): Promise<Career[]> {
  const records = await request<
    {
      id: string;
      description: string;
      responsibilities: string[];
      relevant_skill_ids: string[];
    }[]
  >("/careers");
  const careerIds = Object.entries(backendCareerId) as [Career["id"], string][];
  return careerIds.flatMap(([id, apiId]) => {
    const record = records.find((item) => item.id === apiId);
    if (!record) return [];
    const titles = {
      software: "Software engineering",
      data: "Data science & AI",
      robotics: "Robotics",
    };
    return [
      {
        id,
        title: titles[id],
        shortTitle: titles[id],
        description: record.description,
        skills: record.relevant_skill_ids.map(skillName),
        roles: record.responsibilities,
      },
    ];
  });
}

export interface EligibilityStatus {
  eligible: boolean;
  matchedPrerequisites: string[];
  missingPrerequisites: string[];
}

export async function getEligibility(
  completed: string[],
): Promise<Record<string, EligibilityStatus>> {
  const results = await request<
    {
      course_id: string;
      eligible: boolean;
      matched_prerequisites: string[];
      missing_prerequisites: string[];
    }[]
  >("/eligibility", { completed_course_ids: completed.map(apiId) });
  return Object.fromEntries(
    results.map((item) => [
      displayId(item.course_id),
      {
        eligible: item.eligible,
        matchedPrerequisites: item.matched_prerequisites.map(displayId),
        missingPrerequisites: item.missing_prerequisites.map(displayId),
      },
    ]),
  );
}

interface ApiRoadmapItem {
  course: ApiCourse;
  matched_prerequisites: string[];
  missing_prerequisites: string[];
  explanation: { career_skills: string[] };
}

export async function getRoadmap(
  profile: Pick<Profile, "career" | "completed">,
  signal?: AbortSignal,
): Promise<Roadmap> {
  if (!profile.career)
    return { stronglyRecommended: [], worthConsidering: [], broadenSkills: [] };
  const result = await request<{
    strongly_recommended: ApiRoadmapItem[];
    worth_considering: ApiRoadmapItem[];
    broaden_skills: ApiRoadmapItem[];
  }>(
    "/roadmap",
    {
      completed_course_ids: profile.completed.map(apiId),
      career_id: backendCareerId[profile.career],
    },
    signal,
  );
  const mapItem = (item: ApiRoadmapItem): Recommendation => ({
    course: mapCourse(item.course),
    missingPrerequisites: item.missing_prerequisites.map(displayId),
    matchedPrerequisites: item.matched_prerequisites.map(displayId),
    careerSkills: item.explanation.career_skills.map(skillName),
  });
  return {
    stronglyRecommended: result.strongly_recommended.map(mapItem),
    worthConsidering: result.worth_considering.map(mapItem),
    broadenSkills: result.broaden_skills.map(mapItem),
  };
}

export async function getComparison(ids: string[]): Promise<Course[]> {
  if (!ids.length) return [];
  const records = await request<ApiCourse[]>("/courses/compare", {
    course_ids: ids.map(apiId),
  });
  return records.map(mapCourse);
}
