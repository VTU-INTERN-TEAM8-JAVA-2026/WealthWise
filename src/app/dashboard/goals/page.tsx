"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { getGoalProgress, type FinancialGoal, type UserAlert } from "@/lib/planning";
import { DataPill, EmptyNotice, PageHero, SurfacePanel } from "@/components/dashboard-surface";
import { getGoals, type GoalResponse } from "@/lib/api/goals";

const supabase = createClient();
const milestones = [25, 50, 75, 100];

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

export default function GoalsPage() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function syncMilestoneAlerts(rows: FinancialGoal[]) {
    const { data: alerts } = await supabase.from("user_alerts").select("*").eq("source_type", "goal_milestone");
    const existing = (alerts as UserAlert[] | null) ?? [];
    for (const goal of rows) {
      const progress = getGoalProgress(goal);
      for (const milestone of milestones) {
        const title = `${goal.name} reached ${milestone}%`;
        const alreadyExists = existing.some((alert) => alert.source_id === goal.id && alert.title === title);
        if (progress >= milestone && !alreadyExists) {
          await supabase.from("user_alerts").insert({
            user_id: goal.user_id,
            title,
            description: `${goal.name} has crossed the ${milestone}% milestone toward its target amount.`,
            severity: milestone >= 75 ? "Action" : "Info",
            source_type: "goal_milestone",
            source_id: goal.id,
          });
        }
      }
    }
  }

  useEffect(() => {
    async function loadGoals() {
      /* ---- auth guard ---- */
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in again to load goals.");
        setLoading(false);
        return;
      }

      /* ---- fetch from Spring Boot backend ---- */
      try {
        const data = await getGoals(user.id);
        const rows = data.map(toFinancialGoal);
        setGoals(rows);
        await syncMilestoneAlerts(rows);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load goals.");
      } finally {
        setLoading(false);
      }
    }

    loadGoals();
  }, []);

  return (
    <section className="space-y-6">
      <PageHero eyebrow="Goals" title="Turn long-term plans into contribution targets" description="Each goal now gets a richer WealthWise card with progress, funding pressure, and milestone-aware actions." action={<Link href="/dashboard/goals/new" className="rounded-full bg-[#b4ff45] px-5 py-3 text-sm font-semibold text-[#062415] transition hover:bg-[#c6ff74]">Create goal</Link>} />

      {loading ? <EmptyNotice message="Loading goals..." /> : null}
      {error ? <EmptyNotice message={error} tone="error" /> : null}
      {!loading && !error && goals.length === 0 ? <EmptyNotice message="No goals have been created yet." /> : null}

      <div className="grid gap-5 xl:grid-cols-3">
        {goals.map((goal) => {
          const progress = getGoalProgress(goal);
          return (
            <Link key={goal.id} href={`/dashboard/goals/${goal.id}`} className="block transition hover:scale-[1.015]">
              <SurfacePanel className="h-full">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-fuchsia-400/12 px-3 py-1 text-xs font-semibold text-fuchsia-100">{goal.priority}</span>
                  <span className="text-sm text-white/46">{formatDate(goal.target_date)}</span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-white">{goal.name}</h2>
                <p className="mt-2 text-sm text-white/56">{goal.category} goal • status {goal.status}</p>
                <p className="mt-2 text-sm text-white/56">Target corpus {formatCurrency(goal.target_amount)}</p>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-[#b4ff45]" style={{ width: `${Math.min(progress, 100)}%` }} /></div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <DataPill label="Progress" value={formatPercent(progress)} />
                  <DataPill label="Invested" value={formatCurrency(goal.invested_amount)} />
                  <DataPill label="Monthly need" value={formatCurrency(goal.monthly_need)} />
                  <DataPill label="Inflation" value={`${goal.inflation_rate.toFixed(1)}%`} />
                </div>
              </SurfacePanel>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
