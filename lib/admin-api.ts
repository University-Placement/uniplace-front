import { apiFetch } from "@/lib/api";
import type {
  Form,
  FormWithQuestions,
  Mockday,
  Question,
  QuestionInput,
} from "@/lib/types";

// ---- Questions ----------------------------------------------------------- //
export function listQuestions(
  params: {
    section?: string;
    type?: string;
    search?: string;
    mockday_id?: number;
    module?: number;
    reviewed?: boolean;
  } = {},
) {
  const q = new URLSearchParams();
  if (params.section) q.set("section", params.section);
  if (params.type) q.set("type", params.type);
  if (params.search) q.set("search", params.search);
  if (params.mockday_id != null) q.set("mockday_id", String(params.mockday_id));
  if (params.module != null) q.set("module", String(params.module));
  if (params.reviewed != null) q.set("reviewed", String(params.reviewed));
  const qs = q.toString();
  return apiFetch<Question[]>(`/admin/questions${qs ? `?${qs}` : ""}`);
}

export function createQuestion(body: QuestionInput) {
  return apiFetch<Question>("/admin/questions", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateQuestion(id: number, body: Partial<QuestionInput>) {
  return apiFetch<Question>(`/admin/questions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteQuestion(id: number) {
  return apiFetch<void>(`/admin/questions/${id}`, { method: "DELETE" });
}

// ---- Forms --------------------------------------------------------------- //
export function listForms(params: { section?: string; module?: number } = {}) {
  const q = new URLSearchParams();
  if (params.section) q.set("section", params.section);
  if (params.module) q.set("module", String(params.module));
  const qs = q.toString();
  return apiFetch<Form[]>(`/admin/forms${qs ? `?${qs}` : ""}`);
}

export function createForm(body: {
  name: string;
  section: string;
  module: number;
  difficulty_tier: string;
}) {
  return apiFetch<Form>("/admin/forms", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getForm(id: number) {
  return apiFetch<FormWithQuestions>(`/admin/forms/${id}`);
}

export function setFormQuestions(id: number, questionIds: number[]) {
  return apiFetch<FormWithQuestions>(`/admin/forms/${id}/questions`, {
    method: "PUT",
    body: JSON.stringify({ question_ids: questionIds }),
  });
}

export function deleteForm(id: number) {
  return apiFetch<void>(`/admin/forms/${id}`, { method: "DELETE" });
}

// ---- Mockdays ------------------------------------------------------------ //
export function listMockdays() {
  return apiFetch<Mockday[]>("/admin/mockdays");
}

export function createMockday(body: { name: string }) {
  return apiFetch<Mockday>("/admin/mockdays", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getMockday(id: number) {
  return apiFetch<Mockday>(`/admin/mockdays/${id}`);
}

export function updateMockday(id: number, body: Partial<Mockday>) {
  return apiFetch<Mockday>(`/admin/mockdays/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteMockday(id: number) {
  return apiFetch<void>(`/admin/mockdays/${id}`, { method: "DELETE" });
}

export interface MockdayResults {
  mockday: { id: number; name: string; status: string };
  summary: {
    total_attempts: number;
    submitted: number;
    in_progress: number;
    avg_total_raw: number | null;
    avg_total_scaled: number | null;
  };
  attempts: {
    attempt_id: number;
    email: string | null;
    full_name: string | null;
    status: string;
    started_at: string | null;
    submitted_at: string | null;
    modules_completed: number;
    rw_raw: number;
    math_raw: number;
    total_raw: number;
    rw_scaled: number | null;
    math_scaled: number | null;
    total_scaled: number | null;
    released: boolean;
    current: { section: string; module: number; seconds_remaining: number } | null;
    module_scores: {
      section: string;
      module: number;
      raw_score: number | null;
      submitted: boolean;
    }[];
  }[];
}

export function getMockdayResults(id: number) {
  return apiFetch<MockdayResults>(`/admin/mockdays/${id}/results`);
}

export interface AttemptReviewQuestion {
  number: number;
  section: string;
  module: number;
  type: string;
  domain: string | null;
  skill: string | null;
  difficulty: string | null;
  stem_image: string | null;
  choices: { id: string; image?: string | null; text?: string | null }[] | null;
  selected_answer: string | null;
  correct_answer: string | null;
  is_correct: boolean;
  answered: boolean;
  explanation: string | null;
  explanation_image: string | null;
}

export interface AttemptReview {
  attempt: {
    id: number;
    status: string;
    started_at: string | null;
    submitted_at: string | null;
  };
  student: { full_name: string | null; email: string | null };
  mockday: { id: number; name: string } | null;
  summary: {
    correct: number;
    answered: number;
    total: number;
    rw: { correct: number; answered: number; total: number };
    math: { correct: number; answered: number; total: number };
  };
  questions: AttemptReviewQuestion[];
}

export function getAttemptReview(attemptId: number) {
  return apiFetch<AttemptReview>(`/admin/attempts/${attemptId}/review`);
}

export function editScore(
  attemptId: number,
  body: { rw_scaled?: number; math_scaled?: number; total_scaled?: number },
) {
  return apiFetch(`/admin/attempts/${attemptId}/score`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function releaseScore(attemptId: number) {
  return apiFetch(`/admin/attempts/${attemptId}/release`, { method: "POST" });
}

export function unreleaseScore(attemptId: number) {
  return apiFetch(`/admin/attempts/${attemptId}/unrelease`, { method: "POST" });
}

export function releaseAll(mockdayId: number) {
  return apiFetch<{ released_count: number }>(
    `/admin/mockdays/${mockdayId}/release-all`,
    { method: "POST" },
  );
}

export interface Student {
  id: string;
  email: string;
  full_name: string | null;
}

export function listStudents() {
  return apiFetch<Student[]>("/admin/students");
}

export function assignHomework(body: {
  title: string;
  notes?: string;
  category?: string;
  student_ids?: string[];
}) {
  return apiFetch<{ assigned_to: number; assignment_id: string }>(
    "/admin/homework",
    { method: "POST", body: JSON.stringify(body) },
  );
}

export interface HomeworkAssignment {
  assignment_id: string;
  title: string;
  category: string;
  created_at: string | null;
  total: number;
  counts: { todo: number; doing: number; done: number };
  students: { full_name: string | null; email: string | null; status: string }[];
}

export function getHomeworkTracking() {
  return apiFetch<HomeworkAssignment[]>("/admin/homework");
}

export function deleteHomework(assignmentId: string) {
  return apiFetch<void>(`/admin/homework/${assignmentId}`, {
    method: "DELETE",
  });
}
