"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../api";
import { Dumbbell, TrendingUp, History, CheckCircle, Plus, X, Zap } from "lucide-react";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function WorkoutPage() {
  const router = useRouter();
  const [plan, setPlan] = useState(null);
  const [upgradeStatus, setUpgradeStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeDay, setActiveDay] = useState(null);
  const [error, setError] = useState("");

  // Workout Logger
  const [todayLogs, setTodayLogs] = useState([]);  // [{exercise_name, sets_done, reps_done, weight_kg}]
  const [logOpen, setLogOpen] = useState(null);     // exercise name that has the log form open
  const [logForm, setLogForm] = useState({ sets_done: "", reps_done: "", weight_kg: "", notes: "" });
  const [logSaving, setLogSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadPlan();
    loadTodayLogs();
  }, []);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const [p, status] = await Promise.all([
        api.getActiveWorkout(),
        api.getUpgradeStatus().catch(() => null),
      ]);
      setPlan(p);
      setUpgradeStatus(status);
      const todayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
      setActiveDay(todayName);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayLogs = async () => {
    try {
      const logs = await api.getTodayWorkoutLogs();
      setTodayLogs(logs);
    } catch (e) {}
  };

  const upgrade = async () => {
    setUpgrading(true);
    setError("");
    try {
      const p = await api.upgradeWorkout();
      setPlan(p);
      const status = await api.getUpgradeStatus().catch(() => null);
      setUpgradeStatus(status);
    } catch (e) {
      setError(e.message);
    } finally {
      setUpgrading(false);
    }
  };

  const loadHistory = async () => {
    if (showHistory) { setShowHistory(false); return; }
    try {
      const h = await api.getWorkoutHistory();
      setHistory(h);
      setShowHistory(true);
    } catch (e) {}
  };

  const openLogForm = (exerciseName) => {
    setLogOpen(exerciseName);
    setLogForm({ sets_done: "", reps_done: "", weight_kg: "", notes: "" });
  };

  const submitLog = async (exerciseName) => {
    setLogSaving(true);
    try {
      await api.logExercise(
        exerciseName,
        logForm.sets_done ? parseInt(logForm.sets_done) : null,
        logForm.reps_done || null,
        logForm.weight_kg ? parseFloat(logForm.weight_kg) : null,
        logForm.notes || null
      );
      setLogOpen(null);
      await loadTodayLogs();
    } catch (e) {}
    finally {
      setLogSaving(false);
    }
  };

  const deleteLog = async (id) => {
    try {
      await api.deleteWorkoutLog(id);
      setTodayLogs(prev => prev.filter(l => l.id !== id));
    } catch (e) {}
  };

  if (loading) return (
    <div className="flex-center" style={{ minHeight: "80vh" }}>
      <Dumbbell size={36} style={{ color: "var(--accent-lime)" }} />
    </div>
  );

  const schedule = plan?.exercises?.schedule || plan?.exercises || {};
  const days = DAYS.filter(d => schedule[d]);
  const todayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];

  return (
    <div className="app-container fade-in" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>

      <div className="flex-between" style={{ marginBottom: upgradeStatus ? "1rem" : "2rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.9rem" }}>Workout <span className="gradient-text">Plan</span></h1>
          {plan && <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>{plan.split_type} · Week {upgradeStatus?.weeks_on_plan ?? 1}</p>}
        </div>
        <button className="btn btn-secondary" onClick={loadHistory} style={{ gap: "0.4rem" }}>
          <History size={16} /> Plan History
        </button>
      </div>

      {/* Upgrade Banner */}
      {upgradeStatus && (
        <div style={{
          marginBottom: "1.5rem",
          padding: "1rem 1.25rem",
          borderRadius: "var(--radius)",
          background: upgradeStatus.ready ? "rgba(163,230,53,0.08)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${upgradeStatus.ready ? "rgba(163,230,53,0.3)" : "var(--card-border)"}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Zap size={18} style={{ color: upgradeStatus.ready ? "var(--accent-lime)" : "var(--text-muted)", flexShrink: 0 }} />
            <span style={{ fontSize: "0.9rem", color: upgradeStatus.ready ? "var(--text-primary)" : "var(--text-secondary)" }}>
              {upgradeStatus.message}
            </span>
          </div>
          {upgradeStatus.ready && (
            <button className="btn btn-primary glow-btn" onClick={upgrade} disabled={upgrading} style={{ flexShrink: 0 }}>
              <TrendingUp size={15} />
              {upgrading ? "Generating..." : "Level Up Plan"}
            </button>
          )}
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--danger)", padding: "0.875rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      {plan && (
        <>
          {/* Day Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {days.map(day => {
              const isToday = day === todayName;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`tab-btn ${activeDay === day ? "active" : ""}`}
                  style={{ flex: "none", padding: "0.5rem 1rem", position: "relative" }}
                >
                  {day.slice(0, 3)}
                  {isToday && <span style={{ position: "absolute", top: "4px", right: "4px", width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-lime)" }} />}
                </button>
              );
            })}
          </div>

          {/* Exercise List */}
          {activeDay && schedule[activeDay] && (
            <div className="glass-card">
              <div className="flex-between" style={{ marginBottom: "1.25rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.3rem" }}>{activeDay}</h2>
                  {schedule[activeDay].focus && (
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>{schedule[activeDay].focus}</p>
                  )}
                </div>
                <span className="badge badge-lime">{(schedule[activeDay].exercises || schedule[activeDay]).length} exercises</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {(schedule[activeDay].exercises || schedule[activeDay]).map((ex, i) => {
                  const name = typeof ex === "object" ? (ex.name || ex.exercise || "Exercise") : ex;
                  const sets = ex?.sets;
                  const reps = ex?.reps;
                  const rest = ex?.rest_seconds || ex?.rest;
                  const notes = ex?.form_tip || ex?.notes || ex?.tips;
                  const exLogs = todayLogs.filter(l => l.exercise_name === name);
                  const isLogged = exLogs.length > 0;
                  const isOpen = logOpen === name;

                  return (
                    <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${isLogged ? "rgba(163,230,53,0.25)" : "var(--card-border)"}`, borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                      {/* Exercise Row */}
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: isLogged ? "rgba(163,230,53,0.2)" : "rgba(163,230,53,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "var(--font-heading)", fontWeight: "700", color: "var(--accent-lime)", fontSize: "0.9rem" }}>
                          {isLogged ? <CheckCircle size={18} style={{ color: "var(--accent-lime)" }} /> : i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600", marginBottom: "0.2rem" }}>{name}</div>
                          {notes && <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{notes}</div>}
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "160px" }}>
                          {sets && <span className="badge badge-lime">{sets} sets</span>}
                          {reps && <span className="badge badge-gray">{reps} reps</span>}
                          {rest && <span className="badge badge-gray">{rest}</span>}
                          {activeDay === todayName && (
                            <button
                              onClick={() => isOpen ? setLogOpen(null) : openLogForm(name)}
                              style={{ background: isLogged ? "rgba(163,230,53,0.12)" : "rgba(255,255,255,0.06)", border: `1px solid ${isLogged ? "rgba(163,230,53,0.3)" : "var(--card-border)"}`, color: isLogged ? "var(--accent-lime)" : "var(--text-secondary)", borderRadius: "var(--radius-sm)", padding: "0.3rem 0.6rem", cursor: "pointer", fontSize: "0.78rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.3rem" }}
                            >
                              <Plus size={12} /> Log
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Today's logs for this exercise */}
                      {isLogged && !isOpen && (
                        <div style={{ borderTop: "1px solid rgba(163,230,53,0.12)", padding: "0.6rem 1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                          {exLogs.map(l => (
                            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(163,230,53,0.06)", borderRadius: "var(--radius-sm)", padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>
                              {l.sets_done && <span>{l.sets_done} sets</span>}
                              {l.reps_done && <span>· {l.reps_done} reps</span>}
                              {l.weight_kg && <span>· {l.weight_kg}kg</span>}
                              <button onClick={() => deleteLog(l.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0, lineHeight: 1 }}><X size={12} /></button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Log Form */}
                      {isOpen && (
                        <div style={{ borderTop: "1px solid var(--card-border)", padding: "1rem", background: "rgba(0,0,0,0.2)" }}>
                          <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--accent-lime)", marginBottom: "0.75rem" }}>Log this exercise</p>
                          <div className="log-form-grid">
                            <div>
                              <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Sets done</label>
                              <input type="number" className="form-input" placeholder={sets || "4"} value={logForm.sets_done} onChange={e => setLogForm(f => ({ ...f, sets_done: e.target.value }))} style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }} />
                            </div>
                            <div>
                              <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Reps done</label>
                              <input type="text" className="form-input" placeholder={reps || "10,10,8"} value={logForm.reps_done} onChange={e => setLogForm(f => ({ ...f, reps_done: e.target.value }))} style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }} />
                            </div>
                            <div>
                              <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Weight (kg)</label>
                              <input type="number" className="form-input" placeholder="e.g. 60" step="0.5" value={logForm.weight_kg} onChange={e => setLogForm(f => ({ ...f, weight_kg: e.target.value }))} style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }} />
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button className="btn btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }} onClick={() => submitLog(name)} disabled={logSaving}>
                              {logSaving ? "Saving..." : "Save"}
                            </button>
                            <button className="btn btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem" }} onClick={() => setLogOpen(null)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Plan History */}
      {showHistory && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Plan History</h3>
          {history.length === 0 ? (
            <div className="glass-card" style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
              <History size={32} style={{ color: "var(--text-muted)", marginBottom: "0.75rem" }} />
              <p>No past plans yet. Level up your first plan after 4 weeks!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {history.map(p => (
                <div key={p.id} className="glass-card" style={{ padding: "1rem" }}>
                  <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                    <div>
                      <span style={{ fontWeight: "700" }}>{p.split_name}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginLeft: "0.5rem" }}>
                        {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span className="badge badge-gray">{p.weeks_ran} week{p.weeks_ran !== 1 ? "s" : ""}</span>
                    <span className="badge badge-lime">{p.sessions_completed} sessions</span>
                    <span className={`badge ${p.consistency_pct >= 75 ? "badge-lime" : "badge-gray"}`}>{p.consistency_pct}% consistency</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
