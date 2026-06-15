// Shared types mirroring the uniplace-api schemas.

export type Section = "rw" | "math";
export type QuestionType = "mc" | "spr";
export type Tier = "base" | "easier" | "harder";
export type Difficulty = "easy" | "medium" | "hard";
export type MockdayStatus = "draft" | "scheduled" | "live" | "closed";

export interface Choice {
  id: string; // "A" | "B" | ...
  text?: string;
  image?: string; // URL when the choice is typeset content rendered as an image
}

export interface Question {
  id: number;
  section: Section;
  type: QuestionType;
  passage: string | null;
  stem: string;
  stem_image: string | null;
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

// ---- Exam (student-facing) ----------------------------------------------- //
export interface LiveMockday {
  id: number;
  name: string;
  open_at: string | null;
  close_at: string | null;
  attempt_id: number | null;
  attempt_status: string | null;
  requires_code: boolean;
}

export interface PublicQuestion {
  id: number;
  section: Section;
  type: QuestionType;
  passage: string | null;
  stem: string;
  stem_image: string | null;
  choices: Choice[] | null;
}

export interface ResponseState {
  question_id: number;
  selected_answer: string | null;
  is_flagged: boolean;
}

export interface ScoreOut {
  rw_raw: number | null;
  math_raw: number | null;
  rw_scaled: number | null;
  math_scaled: number | null;
  total_scaled: number | null;
}

export type ExamPhase = "module" | "ready" | "break" | "complete";

export interface AttemptState {
  attempt_id: number;
  status: string;
  phase: ExamPhase;
  // module phase
  module_id: number | null;
  section: Section | null;
  module: number | null;
  seconds_remaining: number | null;
  total_seconds: number | null;
  questions: PublicQuestion[];
  responses: ResponseState[];
  // ready / break phase
  next_section: Section | null;
  next_module: number | null;
  break_seconds: number | null;
  // complete phase
  score: ScoreOut | null;
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
  access_code: string | null;
  created_at: string;
}
