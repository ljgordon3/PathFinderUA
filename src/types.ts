export type CareerId = "software" | "data" | "robotics";
export type Page = "courses" | "careers" | "compare" | "roadmap";

export interface Profile {
  name: string;
  completed: string[];
  career: CareerId | null;
  saved: string[];
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
  missingPrerequisites: string[];
  matchedPrerequisites: string[];
  careerSkills: string[];
}

export interface Roadmap {
  stronglyRecommended: Recommendation[];
  worthConsidering: Recommendation[];
  broadenSkills: Recommendation[];
}
