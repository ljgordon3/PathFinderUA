import {
  apiId,
  backendCareerId,
  displayId,
  mapCourse,
  skillName,
  type ApiCourse,
} from "./data";
import type { Career, Course, Profile, Recommendation } from "./types";

async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || "/api"}${path}`,
    {
      method: body === undefined ? "GET" : "POST",
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
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

export async function getEligibility(
  completed: string[],
): Promise<Record<string, boolean>> {
  const results = await request<{ course_id: string; eligible: boolean }[]>(
    "/eligibility",
    {
      completed_course_ids: completed.map(apiId),
    },
  );
  return Object.fromEntries(
    results.map((item) => [displayId(item.course_id), item.eligible]),
  );
}

export async function getRecommendations(
  profile: Profile,
): Promise<Recommendation[]> {
  if (!profile.career) return [];
  const result = await request<{
    recommendations: {
      course: ApiCourse;
      score: number;
      why_eligible: string;
      explanation: {
        degree_relevance: string;
        unlocks_course_ids: string[];
        learning_objectives: string[];
        career_skills: string[];
        sources: string[];
      };
    }[];
  }>("/recommendations", {
    completed_course_ids: profile.completed.map(apiId),
    career_id: backendCareerId[profile.career],
    target_credit_hours: profile.creditTarget,
    workload_preference: profile.workload,
  });
  return result.recommendations.map((item) => ({
    course: mapCourse(item.course),
    score: item.score,
    reasons: [item.why_eligible, item.explanation.degree_relevance],
    explanation: {
      whyEligible: item.why_eligible,
      degreeRelevance: item.explanation.degree_relevance,
      unlocks: item.explanation.unlocks_course_ids.map(displayId),
      learningObjectives: item.explanation.learning_objectives,
      careerSkills: item.explanation.career_skills.map(skillName),
      sources: item.explanation.sources,
    },
  }));
}

export interface ScheduleSummary {
  totalCredits: number;
  careerSkills: string[];
  warnings: { code: string; message: string }[];
}

export async function getScheduleSummary(
  profile: Profile,
): Promise<ScheduleSummary> {
  const result = await request<{
    total_credit_hours: number;
    career_skill_ids_covered: string[];
    warnings: { code: string; message: string }[];
  }>("/schedule/summary", {
    course_ids: profile.schedule.map(apiId),
    target_credit_hours: profile.creditTarget,
    career_id: profile.career ? backendCareerId[profile.career] : null,
  });
  return {
    totalCredits: result.total_credit_hours,
    careerSkills: result.career_skill_ids_covered.map(skillName),
    warnings: result.warnings,
  };
}

export async function getComparison(ids: string[]): Promise<Course[]> {
  if (!ids.length) return [];
  const records = await request<ApiCourse[]>("/courses/compare", {
    course_ids: ids.map(apiId),
  });
  return records.map(mapCourse);
}
