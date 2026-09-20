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

// Illustrative fixtures, not verified UA catalog records. Replace with reviewed, sourced data.
const source =
  "Illustrative demo data — verify against the official UA catalog.";
export const courses: Course[] = [
  {
    id: "CS 100",
    title: "Foundations of programming",
    credits: 3,
    category: "Foundation",
    description:
      "Build your first programs and learn to break a problem into clear, manageable steps.",
    objectives: [
      "Write and debug small programs",
      "Use variables, conditions, and loops",
    ],
    skills: ["Programming", "Problem solving"],
    prerequisites: [],
    careers: ["software", "data", "robotics"],
    effort: "Standard",
    source,
  },
  {
    id: "CS 101",
    title: "Programming with objects",
    credits: 3,
    category: "Foundation",
    description:
      "Organize programs using objects, reusable components, and practical programming techniques.",
    objectives: [
      "Model a problem with objects",
      "Build reusable program components",
    ],
    skills: ["Programming", "Software design"],
    prerequisites: [["CS 100"]],
    careers: ["software", "robotics"],
    effort: "Standard",
    source,
  },
  {
    id: "CS 200",
    title: "Software design",
    credits: 3,
    category: "Core course",
    description:
      "Move from individual programs to maintainable software with clear interfaces and thoughtful design.",
    objectives: [
      "Design modular applications",
      "Evaluate software design tradeoffs",
    ],
    skills: ["Software design", "Programming"],
    prerequisites: [["CS 101"]],
    careers: ["software"],
    effort: "Standard",
    source,
  },
  {
    id: "CS 201",
    title: "Data structures",
    credits: 3,
    category: "Core course",
    description:
      "Explore the structures that make software efficient, from linked lists and trees to graphs.",
    objectives: [
      "Choose appropriate data structures",
      "Analyze time and space costs",
    ],
    skills: ["Algorithms", "Problem solving"],
    prerequisites: [["CS 101"]],
    careers: ["software", "data", "robotics"],
    effort: "Demanding",
    source,
  },
  {
    id: "CS 202",
    title: "Computer systems",
    credits: 3,
    category: "Core course",
    description:
      "Discover how programs interact with memory, processors, and the underlying machine.",
    objectives: [
      "Explain memory organization",
      "Connect software behavior to hardware",
    ],
    skills: ["Systems", "Programming"],
    prerequisites: [["CS 101"]],
    careers: ["software", "robotics"],
    effort: "Demanding",
    source,
  },
  {
    id: "CS 301",
    title: "Algorithms",
    credits: 3,
    category: "Core course",
    description:
      "Develop systematic approaches to complex problems and evaluate the efficiency of your solutions.",
    objectives: [
      "Compare algorithmic strategies",
      "Analyze algorithm complexity",
    ],
    skills: ["Algorithms", "Problem solving"],
    prerequisites: [["CS 201"]],
    careers: ["software", "data", "robotics"],
    effort: "Demanding",
    source,
  },
  {
    id: "CS 340",
    title: "Introduction to databases",
    credits: 3,
    category: "Elective",
    description:
      "Structure, query, and connect data to the applications that use it.",
    objectives: ["Model relational data", "Write queries and design schemas"],
    skills: ["Data analysis", "Software design"],
    prerequisites: [["CS 200", "CS 201"]],
    careers: ["software", "data"],
    effort: "Standard",
    source,
  },
  {
    id: "CS 410",
    title: "Introduction to AI",
    credits: 3,
    category: "Elective",
    description:
      "Explore search, reasoning, and intelligent decision-making through practical problems.",
    objectives: [
      "Implement search strategies",
      "Explain approaches to intelligent systems",
    ],
    skills: ["Machine learning", "Algorithms"],
    prerequisites: [["CS 201"]],
    careers: ["data", "robotics"],
    effort: "Demanding",
    source,
  },
  {
    id: "CS 415",
    title: "Software development",
    credits: 3,
    category: "Elective",
    description:
      "Bring a software product to life through requirements, implementation, testing, and teamwork.",
    objectives: [
      "Deliver an end-to-end application",
      "Apply testing and team development practices",
    ],
    skills: ["Software design", "Programming", "Problem solving"],
    prerequisites: [["CS 200"]],
    careers: ["software"],
    effort: "Standard",
    source,
  },
  {
    id: "CS 430",
    title: "Robotics foundations",
    credits: 3,
    category: "Elective",
    description:
      "Connect sensing, computation, and action to understand autonomous systems.",
    objectives: [
      "Describe perception and control systems",
      "Connect algorithms to robotic behavior",
    ],
    skills: ["Systems", "Algorithms", "Machine learning"],
    prerequisites: [["CS 201"], ["CS 202"]],
    careers: ["robotics"],
    effort: "Demanding",
    source,
  },
  {
    id: "CS 440",
    title: "Introduction to data science",
    credits: 3,
    category: "Elective",
    description:
      "Transform raw data into useful insights through exploration, visualization, and modeling.",
    objectives: [
      "Explore and prepare datasets",
      "Communicate findings from data",
    ],
    skills: ["Data analysis", "Machine learning"],
    prerequisites: [["CS 201"]],
    careers: ["data"],
    effort: "Standard",
    source,
  },
];
