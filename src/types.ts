export type CareerId = "software" | "data" | "robotics";
export type Workload = "balanced" | "lighter";
export type Page = "overview" | "courses" | "careers" | "compare" | "schedule";

export interface Profile {
  name: string;
  completed: string[];
  career: CareerId | null;
  creditTarget: number;
  workload: Workload;
  schedule: string[];
  setupComplete: boolean;
}

export interface Course {
  id: string;
  title: string;
  credits: number;
  category: string;
  description: string;
  objectives: string[];
  skills: string[];
  prerequisites: string[][];
  careers: CareerId[];
  effort: "Not assessed";
  source: string;
}

export interface Career {
  id: CareerId;
  title: string;
  shortTitle: string;
  description: string;
  skills: string[];
  roles: string[];
}

export interface Recommendation {
  course: Course;
  score: number;
  reasons: string[];
  explanation: {
    whyEligible: string;
    degreeRelevance: string;
    unlocks: string[];
    learningObjectives: string[];
    careerSkills: string[];
    sources: string[];
  };
}

export interface PlanningService {
  recommend(profile: Profile): Promise<Recommendation[]>;
}
