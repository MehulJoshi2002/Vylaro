"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../api";
import { Dumbbell, Utensils, TrendingUp, Flame, Zap, Target, ChevronRight, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [diet, setDiet] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }

    Promise.all([
      api.me(),
      api.getActiveWorkout().catch(() => null),
      api.getActiveDiet().catch(() => null),
      api.getProgressInsights().catch(() => null),
    ]).then(([u, w, d, ins]) => {
      if (!u.workout_location) { router.push("/onboarding"); return; }
      setUser(u);
      setWorkout(w);
      setDiet(d);
      setInsights(ins);
    }).catch(() => { router.push("/"); })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <div className="flex-center" style={{ minHeight: "80vh" }}>
      <div style={{ textAlign: "center" }}>
        <Dumbbell size={40} style={{ color: "var(--accent-lime)", marginBottom: "1rem", animation: "spin 1.2s linear infinite" }} />
        <p style={{ color: "var(--text-secondary)" }}>Loading your dashboard...</p>
      </div>
    </div>
  );

  const todayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
  const schedule = workout?.exercises?.schedule || workout?.exercises || {};
  const todaySchedule = schedule[todayName] || schedule[Object.keys(schedule).find(k => (schedule[k]?.exercises || schedule[k])?.length > 0)] || null;
  const todayWorkout = todaySchedule?.exercises || (Array.isArray(todaySchedule) ? todaySchedule : null);

  return (
    <div className="app-container fade-in" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>

      {/* Welcome Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.3rem" }}>
          Hey, <span className="gradient-text">{user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          {user?.goal === "lose" ? "Stay in deficit — you're building something great." :
           user?.goal === "gain" ? "Hit your surplus — muscle is built day by day." :
           "Maintain your edge — consistency is everything."}
        </p>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        <StatCard icon={<Flame size={22} style={{ color: "#f59e0b" }} />} label="Calorie Target" value={user?.calorie_target ? `${user.calorie_target} kcal` : "—"} accent="#f59e0b" />
        <StatCard icon={<Zap size={22} style={{ color: "var(--accent-lime)" }} />} label="Protein Target" value={user?.protein_target ? `${user.protein_target}g` : "—"} accent="var(--accent-lime)" />
        <StatCard icon={<Target size={22} style={{ color: "var(--accent-cyan)" }} />} label="Current Weight" value={user?.weight ? `${user.weight} kg` : "—"} accent="var(--accent-cyan)" />
      </div>

      <div className="grid-2" style={{ marginBottom: "2rem" }}>
        {/* Today's Workout */}
        <div className="glass-card">
          <div className="flex-between" style={{ marginBottom: "1rem" }}>
            <div className="flex-center" style={{ gap: "0.5rem" }}>
              <Dumbbell size={20} style={{ color: "var(--accent-lime)" }} />
              <h3 style={{ fontSize: "1.1rem" }}>Today — {todayName}</h3>
            </div>
            <span className="badge badge-lime">{workout?.split_type || "No Plan"}</span>
          </div>

          {todaySchedule?.focus && (
            <p style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", marginBottom: "0.75rem", fontWeight: "600" }}>{todaySchedule.focus}</p>
          )}
          {todayWorkout && Array.isArray(todayWorkout) && todayWorkout.length > 0 ? (
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {todayWorkout.slice(0, 5).map((ex, i) => (
                <li key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", padding: "0.5rem 0", borderBottom: "1px solid var(--card-border)" }}>
                  <span style={{ color: "var(--text-primary)" }}>{typeof ex === "object" ? ex.name || ex.exercise || JSON.stringify(ex) : ex}</span>
                  {typeof ex === "object" && (ex.sets || ex.reps) && (
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{ex.sets}×{ex.reps}</span>
                  )}
                </li>
              ))}
              {todayWorkout.length > 5 && <li style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>+{todayWorkout.length - 5} more</li>}
            </ul>
          ) : (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Rest day — recovery is part of the plan.</p>
          )}

          <Link href="/workout" className="btn btn-secondary" style={{ width: "100%", marginTop: "1rem", justifyContent: "center" }}>
            Full Plan <ChevronRight size={16} />
          </Link>
        </div>

        {/* Diet Summary */}
        <div className="glass-card">
          <div className="flex-between" style={{ marginBottom: "1rem" }}>
            <div className="flex-center" style={{ gap: "0.5rem" }}>
              <Utensils size={20} style={{ color: "var(--accent-violet)" }} />
              <h3 style={{ fontSize: "1.1rem" }}>Today's Nutrition</h3>
            </div>
            {diet && (
              <span className="badge badge-violet">{diet.calorie_total} kcal</span>
            )}
          </div>

          {diet?.meals ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {Object.entries(diet.meals).slice(0, 4).map(([meal, mealData]) => {
                const label = mealData?.name || (Array.isArray(mealData) ? mealData.slice(0,2).map(f => typeof f === "object" ? f.name || f.food : f).join(" • ") : String(mealData).slice(0, 60));
                const protein = mealData?.protein_g;
                return (
                  <div key={meal} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid var(--card-border)" }}>
                    <div>
                      <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--accent-lime)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{meal}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.1rem" }}>{label}</div>
                    </div>
                    {protein && <span className="badge badge-lime" style={{ flexShrink: 0 }}>{protein}g P</span>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No diet plan generated yet.</p>
          )}

          <Link href="/diet" className="btn btn-secondary" style={{ width: "100%", marginTop: "1rem", justifyContent: "center" }}>
            Full Meal Plan <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Progress Insights */}
      {insights && (
        <div className="glass-card">
          <div className="flex-center" style={{ gap: "0.5rem", marginBottom: "1.25rem", justifyContent: "flex-start" }}>
            <TrendingUp size={20} style={{ color: "var(--accent-cyan)" }} />
            <h3 style={{ fontSize: "1.1rem" }}>Progress Snapshot</h3>
          </div>
          <div className="grid-3" style={{ marginBottom: "1rem" }}>
            <div style={{ textAlign: "center" }}>
              <div className="progress-value" style={{ color: "var(--accent-lime)" }}>{insights.consistency_rate}%</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Consistency</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="progress-value" style={{ color: insights.weight_change_kg <= 0 ? "var(--success)" : "var(--warning)" }}>
                {insights.weight_change_kg > 0 ? "+" : ""}{insights.weight_change_kg} kg
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Weight Change (30d)</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <Link href="/progress" className="btn btn-primary" style={{ padding: "0.5rem 1.25rem" }}>
                Log Today <ChevronRight size={14} />
              </Link>
            </div>
          </div>
          <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "var(--radius-sm)", padding: "0.875rem", fontSize: "0.9rem", color: "var(--text-primary)" }}>
            {insights.trend_message}
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="glass-card stat-card">
      <div className="flex-center" style={{ marginBottom: "0.5rem" }}>{icon}</div>
      <div className="stat-card-value" style={{ color: accent }}>{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
