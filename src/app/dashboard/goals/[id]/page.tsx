"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { getGoalProgress, type FinancialGoal } from "@/lib/planning";
import {
  DataPill,
  EmptyNotice,
  GhostButton,
  PageHero,
  SurfacePanel,
} from "@/components/dashboard-surface";
import { getGoal, deleteGoal, ApiError, type GoalResponse } from "@/lib/api/goals";

const supabase = createClient();

/** Convert backend camelCase response → frontend snake_case FinancialGoal shape */
function toFinancialGoal(g: GoalResponse): FinancialGoal {
  return {
    id: g.id,
    user_id: g.userId,
    name: g.name,
    target_amount: g.targetAmount,
    invested_amount: g.investedAmount,
    target_date: g.targetDate,
    category: g.category,
    priority: g.priority as FinancialGoal["priority"],
    status: g.status as FinancialGoal["status"],
    inflation_rate: g.inflationRate,
    expected_return: g.expectedReturn,
    monthly_need: g.monthlyNeed,
    created_at: g.createdAt,
  };
}

export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [goal, setGoal] = useState<FinancialGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      /* ---- auth guard ---- */
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in again to view this goal.");
        setLoading(false);
        return;
      }

      /* ---- fetch from backend ---- */
      try {
        const res = await getGoal(id);
        setGoal(toFinancialGoal(res));
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setError("Goal not found — it may have been deleted.");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load goal.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteGoal(id);
      router.push("/dashboard/goals");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete goal.");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  /* ---- Loading / error states ---- */
  if (loading) {
    return (
      <section className="space-y-6">
        <PageHero eyebrow="Goal" title="Loading..." />
        <EmptyNotice message="Fetching goal details..." />
      </section>
    );
  }

  if (error || !goal) {
    return (
      <section className="space-y-6">
        <PageHero
          eyebrow="Goal"
          title="Something went wrong"
          action={
            <Link
              href="/dashboard/goals"
              className="rounded-full bg-[#b4ff45] px-5 py-3 text-sm font-semibold text-[#062415] transition hover:bg-[#c6ff74]"
            >
              Back to goals
            </Link>
          }
        />
        <EmptyNotice message={error ?? "Goal not found."} tone="error" />
      </section>
    );
  }

  /* ---- Derived data ---- */
  const progress = getGoalProgress(goal);
  const statusColor =
    goal.status === "Achieved"
      ? "bg-emerald-400/12 text-emerald-200"
      : goal.status === "Archived"
        ? "bg-gray-400/12 text-gray-300"
        : "bg-fuchsia-400/12 text-fuchsia-100";

  return (
    <section className="space-y-6">
      {/* ---- Header ---- */}
      <PageHero
        eyebrow={goal.category}
        title={goal.name}
        description={`Priority: ${goal.priority} · Status: ${goal.status} · Target by ${formatDate(goal.target_date)}`}
        action={
          <Link
            href="/dashboard/goals"
            className="rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white/88 transition hover:bg-white/8"
          >
            ← All goals
          </Link>
        }
      />

      {/* ---- Progress & metrics ---- */}
      <SurfacePanel title="Progress" subtitle="How far along this goal stands today.">
        <div className="mb-5 flex items-center justify-between text-sm text-white/56">
          <span>{formatPercent(progress)} of target</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
            {goal.status}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-4 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-[#b4ff45] transition-all duration-700"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DataPill label="Target amount" value={formatCurrency(goal.target_amount)} />
          <DataPill label="Invested" value={formatCurrency(goal.invested_amount)} />
          <DataPill label="Monthly need" value={formatCurrency(goal.monthly_need)} />
          <DataPill label="Expected return" value={`${goal.expected_return.toFixed(1)}%`} />
        </div>
      </SurfacePanel>

      {/* ---- Additional info ---- */}
      <SurfacePanel title="Details" subtitle="Assumptions and metadata for this goal.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DataPill label="Category" value={goal.category} />
          <DataPill label="Priority" value={goal.priority} />
          <DataPill label="Inflation rate" value={`${goal.inflation_rate.toFixed(1)}%`} />
          <DataPill label="Target date" value={formatDate(goal.target_date)} />
          <DataPill label="Created" value={formatDate(goal.created_at)} />
          <DataPill label="Progress" value={formatPercent(progress)} />
        </div>
      </SurfacePanel>

      {/* ---- Delete action ---- */}
      <SurfacePanel>
        {!showDeleteConfirm ? (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Danger zone</h3>
              <p className="mt-1 text-sm text-white/52">
                Deleting a goal is permanent and cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-full border border-rose-400/30 px-5 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/10"
            >
              Delete goal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-rose-200">
              Are you sure you want to permanently delete <strong>{goal.name}</strong>?
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, delete permanently"}
              </button>
              <GhostButton onClick={() => setShowDeleteConfirm(false)}>Cancel</GhostButton>
            </div>
          </div>
        )}
      </SurfacePanel>
    </section>
  );
}
