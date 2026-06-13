import { apiFetch } from "@/lib/api";
import type {
  Form,
  FormWithQuestions,
  Mockday,
  Question,
  QuestionInput,
} from "@/lib/types";

// ---- Questions ----------------------------------------------------------- //
export function listQuestions(params: {
  section?: string;
  type?: string;
  search?: string;
} = {}) {
  const q = new URLSearchParams();
  if (params.section) q.set("section", params.section);
  if (params.type) q.set("type", params.type);
  if (params.search) q.set("search", params.search);
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
