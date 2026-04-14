/**
 * API service layer for Financial Goals.
 *
 * All requests target the Spring Boot backend whose base URL
 * is read from the NEXT_PUBLIC_API_URL environment variable.
 *
 * Backend field names use camelCase (Jackson defaults), so the
 * payload and response shapes defined here mirror that convention.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/* ---------- Types ---------- */

/** Shape returned by the backend for a single goal. */
export interface GoalResponse {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  investedAmount: number;
  targetDate: string;          // "YYYY-MM-DD"
  category: string;
  priority: string;
  status: string;
  inflationRate: number;
  expectedReturn: number;
  monthlyNeed: number;
  createdAt: string;           // ISO timestamp
}

/** Payload expected by POST /api/v1/goals */
export interface CreateGoalPayload {
  userId: string;
  name: string;
  targetAmount: number;
  investedAmount: number;
  targetDate: string;          // "YYYY-MM-DD"
  category: string;
  priority: string;
  status: string;
  inflationRate: number;
  expectedReturn: number;
  monthlyNeed: number;
}

/* ---------- Error wrapper ---------- */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {
      /* ignore read errors */
    }

    if (res.status === 404) {
      throw new ApiError(body || "Resource not found.", 404);
    }
    throw new ApiError(body || `Request failed (${res.status}).`, res.status);
  }
  // DELETE may return 204 with no body
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/* ---------- API functions ---------- */

/**
 * Fetch all goals for a given user.
 * GET /api/v1/goals?userId={uuid}
 */
export async function getGoals(userId: string): Promise<GoalResponse[]> {
  const res = await fetch(
    `${API_BASE}/api/v1/goals?userId=${encodeURIComponent(userId)}`,
    { cache: "no-store" },
  );
  return handleResponse<GoalResponse[]>(res);
}

/**
 * Fetch a single goal by its ID.
 * GET /api/v1/goals/{id}
 */
export async function getGoal(id: string): Promise<GoalResponse> {
  const res = await fetch(`${API_BASE}/api/v1/goals/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  return handleResponse<GoalResponse>(res);
}

/**
 * Create a new goal.
 * POST /api/v1/goals
 */
export async function createGoal(payload: CreateGoalPayload): Promise<GoalResponse> {
  const res = await fetch(`${API_BASE}/api/v1/goals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<GoalResponse>(res);
}

/**
 * Delete a goal by its ID.
 * DELETE /api/v1/goals/{id}
 */
export async function deleteGoal(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/goals/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  await handleResponse<void>(res);
}
