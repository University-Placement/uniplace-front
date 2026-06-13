import { apiFetch } from "@/lib/api";
import type { AttemptState, LiveMockday } from "@/lib/types";

export function listLiveMockdays() {
  return apiFetch<LiveMockday[]>("/mockdays/live");
}

export function startAttempt(mockdayId: number) {
  return apiFetch<{ attempt_id: number; mockday_id: number; status: string }>(
    `/mockdays/${mockdayId}/attempts`,
    { method: "POST" },
  );
}

export function getAttemptState(attemptId: number) {
  return apiFetch<AttemptState>(`/attempts/${attemptId}/state`);
}

export function startModule(attemptId: number) {
  return apiFetch<AttemptState>(`/attempts/${attemptId}/start-module`, {
    method: "POST",
  });
}

export function saveResponse(
  moduleId: number,
  body: {
    question_id: number;
    selected_answer?: string | null;
    is_flagged?: boolean;
  },
) {
  return apiFetch<{ ok: boolean }>(`/attempt-modules/${moduleId}/responses`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function submitModule(moduleId: number) {
  return apiFetch<{
    module_raw_score: number;
    attempt_complete: boolean;
    next_section: string | null;
    next_module: number | null;
    is_break: boolean;
  }>(`/attempt-modules/${moduleId}/submit`, { method: "POST" });
}
