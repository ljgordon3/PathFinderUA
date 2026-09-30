import type { Career, Course, Profile } from "./types";

export const emptyProfile: Profile = {
  name: "",
  completed: [],
  career: null,
  creditTarget: 12,
  workload: "balanced",
  schedule: [],
  setupComplete: false,
};

export const careers: Career[] = [
  {
    id: "software",
    title: "Software engineering",
    shortTitle: "Software engineering",
    description:
      "Turn ideas into useful software. Explore how to design, build, and improve applications that people depend on.",
    skills: ["Programming", "Software design", "Problem solving"],
    roles: ["Software developer", "Frontend engineer", "Backend engineer"],
  },
  {
    id: "data",
    title: "Data science & AI",
    shortTitle: "Data science & AI",
    description:
      "Find patterns, ask better questions, and build intelligent systems with a foundation in data and algorithms.",
    skills: ["Data analysis", "Algorithms", "Machine learning"],
    roles: ["Data analyst", "Data scientist", "Machine learning engineer"],
  },
  {
    id: "robotics",
    title: "Robotics",
    shortTitle: "Robotics",
    description:
      "Connect software to the physical world. Explore the systems, intelligence, and controls behind autonomous machines.",
    skills: ["Systems", "Algorithms", "Machine learning"],
    roles: [
      "Robotics engineer",
      "Embedded software developer",
      "Autonomy engineer",
    ],
  },
];

// The browser and API read the same curated course records.
import courseRecords from "../backend/data/courses.json";
import skillRecords from "../backend/data/skills.json";
import mappingRecords from "../backend/data/course_career_mappings.json";

const careerKeys = {
  "CAR-SWE": "software",
  "CAR-DS-AI": "data",
  "CAR-ROBOTICS": "robotics",
} as const;
export const backendCareerId = {
  software: "CAR-SWE",
  data: "CAR-DS-AI",
  robotics: "CAR-ROBOTICS",
} as const;
const skillNames = new Map(skillRecords.map((skill) => [skill.id, skill.name]));
export const displayId = (id: string) =>
  id.replace(/^([A-Z]+)([0-9]+)$/, "$1 $2");
export const apiId = (id: string) => id.replace(" ", "");
export const skillName = (id: string) => skillNames.get(id) ?? id;
// Major course slots listed in the UA B.S. CS requirements.
const requiredForBs = new Set([
  "CS100",
  "CS101",
  "CS200",
  "CS201",
  "CS301",
  "CS403",
  "CS470",
  "CS495",
  "ECE380",
  "ECE383",
]);

export interface ApiCourse {
  id: string;
  title: string;
  credit_hours: number;
  degree_category: string;
  description: string;
  learning_objectives: string[];
  skill_ids: string[];
  prerequisites: string[][];
  source: string;
}

export function mapCourse(record: ApiCourse): Course {
  return {
    id: displayId(record.id),
    title: record.title,
    credits: record.credit_hours,
    category: requiredForBs.has(record.id)
      ? "B.S. required"
      : Number(record.id.replace(/^[A-Z]+/, "")) >= 400
        ? "Upper-level option"
        : "Other course",
    description: record.description,
    objectives: record.learning_objectives,
    skills: record.skill_ids.map((id) => skillNames.get(id) ?? id),
    // Source data uses OR between groups and AND within a group.
    prerequisites: record.prerequisites.map((group) => group.map(displayId)),
    careers: [
      ...new Set(
        mappingRecords
          .filter((mapping) => mapping.course_id === record.id)
          .map(
            (mapping) =>
              careerKeys[mapping.career_id as keyof typeof careerKeys],
          ),
      ),
    ],
    effort: "Not assessed",
    source: record.source,
  };
}

export const courses: Course[] = courseRecords
  .map(mapCourse)
  .sort(
    (a, b) =>
      Number(b.category === "B.S. required") -
        Number(a.category === "B.S. required") || a.id.localeCompare(b.id),
  );
