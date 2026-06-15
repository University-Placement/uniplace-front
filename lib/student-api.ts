import { apiFetch } from "@/lib/api";

export interface DomainStat {
  domain: string;
  correct: number;
  total: number;
  pct: number;
}

export interface MyResult {
  attempt_id: number;
  mockday: string;
  submitted_at: string | null;
  rw_scaled: number | null;
  math_scaled: number | null;
  total_scaled: number | null;
  rw_raw: number | null;
  math_raw: number | null;
  domains: DomainStat[];
}

export type TaskCategory = "task" | "study" | "goal";
export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: number;
  title: string;
  notes: string | null;
  category: TaskCategory;
  status: TaskStatus;
  position: number;
  assigned: boolean;
}

export interface ReviewQuestion {
  number: number;
  section: "rw" | "math";
  module: number;
  type: "mc" | "spr";
  domain: string | null;
  skill: string | null;
  difficulty: string | null;
  stem_image: string | null;
  choices: { id: string; image?: string; text?: string }[] | null;
  selected_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
  explanation: string | null;
  explanation_image: string | null;
}

export function getMyResults() {
  return apiFetch<MyResult[]>("/me/results");
}

export function getMyReview(attemptId: number) {
  return apiFetch<ReviewQuestion[]>(`/me/attempts/${attemptId}/review`);
}

export function listTasks() {
  return apiFetch<Task[]>("/me/tasks");
}

export function createTask(body: {
  title: string;
  notes?: string;
  category: TaskCategory;
}) {
  return apiFetch<Task>("/me/tasks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateTask(
  id: number,
  body: Partial<{
    title: string;
    notes: string;
    category: TaskCategory;
    status: TaskStatus;
    position: number;
  }>,
) {
  return apiFetch<Task>(`/me/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteTask(id: number) {
  return apiFetch<void>(`/me/tasks/${id}`, { method: "DELETE" });
}
