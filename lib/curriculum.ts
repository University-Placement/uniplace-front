// Weekly class plan: pre-class videos + recommended material per week.
// Edit here to update the plan (links open in a new tab). Items without a known
// URL render as plain text.

export const SYLLABUS_URL =
  "https://docs.google.com/document/d/1ezkRZFlXbIIQlRuhRSjLe7mjmD2MhyVJbZTWUbp4rVg/edit?usp=sharing";

// Common, stable resource links reused across weeks.
const KHAN_SAT = "https://www.khanacademy.org/test-prep/sat";
const KHAN = "https://www.khanacademy.org/";
const SUPERTUTOR = "https://www.youtube.com/@SupertutorTV";
const PREPSCHOLAR = "https://www.youtube.com/@PrepScholarSAT";
const SCALAR = "https://www.youtube.com/@ScalarLearning";
const PENGUIN = "https://www.youtube.com/@PenguinTestPrep";
const OCT = "https://www.youtube.com/@TheOrganicChemistryTutor";
const BLUEBOOK_PRACTICE =
  "https://satsuite.collegeboard.org/practice/practice-tests/bluebook";
const BLUEBOOK_APP = "https://bluebook.collegeboard.org/";
const QUESTION_BANK = "https://satsuitequestionbank.collegeboard.org/";
const SCHOOLHOUSE = "https://schoolhouse.world/";

export type Subject = "rw" | "math";

export interface Resource {
  subject?: Subject;
  label: string;
  url?: string;
}

export interface Week {
  n: number;
  date: string;
  videos: Resource[];
  material: Resource[];
  tip?: string;
}

export const WEEKS: Week[] = [
  {
    n: 1,
    date: "Jun 15, 2026",
    videos: [
      { subject: "rw", label: "SupertutorTV", url: SUPERTUTOR },
      { subject: "math", label: "Khan Academy", url: KHAN_SAT },
    ],
    material: [
      { label: "College Board — Download Bluebook app", url: BLUEBOOK_APP },
      { label: "Create Khan Academy Account", url: KHAN },
      { label: "Create Schoolhouse Account", url: SCHOOLHOUSE },
    ],
  },
  {
    n: 2,
    date: "Jun 22, 2026",
    videos: [
      { subject: "rw", label: "Khan Academy — Worked Example", url: KHAN_SAT },
      { subject: "math", label: "Scalar Learning — Solving Linear Equations", url: SCALAR },
      { subject: "math", label: "Scalar Learning — Graphing Linear Equations", url: SCALAR },
    ],
    material: [
      { subject: "rw", label: "Khan Academy — RW: Information & Ideas (Foundations)", url: KHAN_SAT },
      { subject: "math", label: "Khan Academy — Math: Foundations: Algebra (up to graphs of linear equations)", url: KHAN_SAT },
    ],
    tip: "Complete all Foundations-level exercises. Use My Practice to link Bluebook results.",
  },
  {
    n: 3,
    date: "Jun 29, 2026",
    videos: [
      { subject: "rw", label: "Khan Academy — DSAT Craft & Structure playlist", url: KHAN_SAT },
      { subject: "math", label: "Scalar Learning — Systems of linear equations strategy", url: SCALAR },
    ],
    material: [
      { subject: "rw", label: "Khan Academy — Craft & Structure unit (all levels)", url: KHAN_SAT },
      { subject: "math", label: "Khan Academy — Foundations: Algebra (from solving systems of linear equations)", url: KHAN_SAT },
    ],
    tip: "Focus on 'Words in Context' — highest-frequency sub-type in this domain.",
  },
  {
    n: 4,
    date: "Jul 6, 2026",
    videos: [
      { subject: "rw", label: "SupertutorTV — SAT inference questions strategy", url: SUPERTUTOR },
      { subject: "rw", label: "SAT English Hacks | Inferences — Penguin Test Prep", url: PENGUIN },
      { subject: "math", label: "Khan Academy — Advanced Math: equivalent expressions & quadratics", url: KHAN_SAT },
    ],
    material: [
      { subject: "math", label: "Khan Academy — Advanced Math unit (Foundations → Medium)", url: KHAN_SAT },
      { subject: "rw", label: "Khan Academy — Information and Ideas", url: KHAN_SAT },
    ],
    tip: "This is the heaviest-tested domain (~35% of math). Allocate extra self-study time this week.",
  },
  {
    n: 5,
    date: "Jul 13, 2026",
    videos: [
      { subject: "rw", label: "Rhetorical Syntheses — Penguin Test Prep", url: PENGUIN },
      { subject: "math", label: "Scalar Learning — Non-linear functions & mixed systems", url: SCALAR },
    ],
    material: [
      { subject: "rw", label: "Khan Academy — Expression of Ideas: synthesis & transitions", url: KHAN_SAT },
      { label: "College Board — Bluebook Practice Tests 4–5 (first full-length Saturday mock)", url: BLUEBOOK_PRACTICE },
    ],
    tip: "Review your score report in My Practice and link to Khan Academy before next lecture.",
  },
  {
    n: 6,
    date: "Jul 20, 2026",
    videos: [
      { subject: "rw", label: "Khan Academy — Standard English Conventions: boundaries & punctuation", url: KHAN_SAT },
      { subject: "math", label: "Khan Academy — PS&DA: ratios, rates, percentages", url: KHAN_SAT },
    ],
    material: [
      { subject: "rw", label: "Khan Academy — SEC unit (Boundaries / Form, Structure & Sense — all levels)", url: KHAN_SAT },
      { subject: "math", label: "Khan Academy — Problem Solving and Data Analysis", url: KHAN_SAT },
    ],
    tip: "Boundaries (semicolons, colons, dashes) = ~50% of SEC questions. Drill until automatic.",
  },
  {
    n: 7,
    date: "Jul 27, 2026",
    videos: [
      { subject: "rw", label: "PrepScholar — Digital SAT RW most-missed question types", url: PREPSCHOLAR },
      { subject: "rw", label: "MUST KNOW SAT Reading Hacks — Penguin Test Prep", url: PENGUIN },
      { subject: "math", label: "Khan Academy — PS/DA: two-variable data, scatterplots & probability", url: KHAN_SAT },
    ],
    material: [
      { label: "College Board — Student Question Bank (free, domain-filtered drills)", url: QUESTION_BANK },
      { subject: "math", label: "Khan Academy — PS/DA: two-variable data, scatterplots & probability", url: KHAN_SAT },
    ],
    tip: "Filter by your lowest-scoring RW domain from the week-5 mock. Complete 20 targeted questions.",
  },
  {
    n: 8,
    date: "Aug 3, 2026",
    videos: [
      { subject: "rw", label: "SupertutorTV — Cross-text connections: paired passage strategy", url: SUPERTUTOR },
      { subject: "rw", label: "Khan Academy — Cross-text connections (worked example)", url: KHAN_SAT },
      { subject: "math", label: "The Organic Chemistry Tutor — SAT Geometry: area, volume, triangles & trig", url: OCT },
    ],
    material: [
      { subject: "math", label: "Khan Academy — Geometry & Trig unit", url: KHAN_SAT },
      { subject: "rw", label: "Khan Academy — Cross-Text Connections", url: KHAN_SAT },
    ],
    tip: "Practice the built-in Desmos calculator for geometry — students underuse this tool on test day.",
  },
  {
    n: 9,
    date: "Aug 10, 2026",
    videos: [
      { subject: "rw", label: "PrepScholar — Top SAT RW mistakes & how to fix them", url: PREPSCHOLAR },
      { subject: "math", label: "Scalar Learning — 13 critical SAT math strategies", url: SCALAR },
    ],
    material: [
      { label: "Bluebook — My Practice dashboard (score history + targeted drills)", url: BLUEBOOK_APP },
    ],
    tip: "Bring printed error logs from all prior mocks. Class splits into two groups by score band.",
  },
  {
    n: 10,
    date: "Aug 17, 2026",
    videos: [
      { subject: "rw", label: "SupertutorTV — Last-minute SAT RW tips: transitions & grammar traps", url: SUPERTUTOR },
      { subject: "math", label: "Scalar Learning — Desmos calculator shortcuts for the Digital SAT", url: SCALAR },
    ],
    material: [
      { label: "Bluebook Practice Test 6 or 7 — final full simulation", url: BLUEBOOK_PRACTICE },
    ],
    tip: "Last Saturday mock this week. Debrief using My Practice. No new content after this — review and rest.",
  },
];
