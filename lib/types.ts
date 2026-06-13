// Shared types mirroring the uniplace-api schemas.

export type Section = "rw" | "math";
export type QuestionType = "mc" | "spr";
export type Tier = "base" | "easier" | "harder";
export type Difficulty = "easy" | "medium" | "hard";
export type MockdayStatus = "draft" | "scheduled" | "live" | "closed";

export interface Choice {
  id: string; // "A" | "B" | ...
  text: string;
}

export interface Question {
  id: number;
  section: Section;
  type: QuestionType;
  passage: string | null;
  stem: string;
  choices: Choice[] | null;
  correct_answer: string;
  explanation: string | null;
  domain: string | null;
  skill: string | null;
  difficulty: Difficulty | null;
  source: string | null;
  created_at: string;
}

export type QuestionInput = Omit<Question, "id" | "created_at">;

export interface Form {
  id: number;
  name: string;
  section: Section;
  module: number; // 1 | 2
  difficulty_tier: Tier;
  question_count: number;
  created_at: string;
}

export interface FormWithQuestions extends Form {
  questions: Question[];
}

export interface Mockday {
  id: number;
  name: string;
  status: MockdayStatus;
  open_at: string | null;
  close_at: string | null;
  rw_m1_form_id: number | null;
  rw_m2_easy_form_id: number | null;
  rw_m2_hard_form_id: number | null;
  math_m1_form_id: number | null;
  math_m2_easy_form_id: number | null;
  math_m2_hard_form_id: number | null;
  rw_routing_threshold: number;
  math_routing_threshold: number;
  created_at: string;
}
