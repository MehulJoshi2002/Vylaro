"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "../api";
import { TrendingUp, CheckCircle, XCircle, Save, BarChart2, Camera, Trash2, Flame } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ProgressPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("log");

  // Log form
  const [weight, setWeight] = useState("");
  const [workoutDone, setWorkoutDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [error, setError] = useState("");

  // Photos
  const [photos, setPhotos] = useState([]);
  const [photoNote, setPhotoNote] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadData();
  }, []);

  useEffect(() => {
    if (tab === "photos") loadPhotos();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [h, ins] = await Promise.all([
        api.getProgressHistory(),
        api.getProgressInsights(),
      ]);
      setHistory(h);
      setInsights(ins);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async () => {
    try {
      const p = await api.getPhotos();
      setPhotos(p);
    } catch (e) {}
  };

  const logToday = async () => {
    setSaving(true);
    setSaveMsg("");
    setError("");
    try {
      await api.logProgress(weight || undefined, workoutDone);
      setSaveMsg("Logged successfully!");
      setWeight("");
      setWorkoutDone(false);
      await loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const base64 = await fileToBase64(file);
      await api.uploadPhoto(base64, photoNote || null);
      setPhotoNote("");
      await loadPhotos();
    } catch (e) {
      setError("Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const deletePhoto = async (id) => {
    try {
      await api.deletePhoto(id);
      setPhotos(prev => prev.filter(p => p.id !== id));
    } catch (e) {}
  };

  const chartData = history
    .filter(l => l.weight != null)
    .map(l => ({ date: new Date(l.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), weight: l.weight }));

  const today = new Date().toISOString().split("T")[0];
  const todayLog = history.find(l => l.date === today);
  const streak = insights?.streak ?? 0;

  if (loading) return (
    <div className="flex-center" style={{ minHeight: "80vh" }}>
      <TrendingUp size={36} style={{ color: "var(--accent-cyan)" }} />
    </div>
  );

  return (
    <div className="app-container fade-in" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>

      <div className="flex-between" style={{ marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h1 style={{ fontSize: "1.9rem" }}>Progress <span className="gradient-text">Tracker</span></h1>
        {streak > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.3)", borderRadius: "2rem", padding: "0.4rem 1rem" }}>
            <Flame size={18} style={{ color: "#fb923c" }} />
            <span style={{ fontWeight: "800", fontFamily: "var(--font-heading)", color: "#fb923c", fontSize: "1.1rem" }}>{streak}</span>
            <span style={{ fontSize: "0.8rem", color: "#fb923c" }}>day streak</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tab-container" style={{ marginBottom: "2rem" }}>
        <button className={`tab-btn ${tab === "log" ? "active" : ""}`} onClick={() => setTab("log")}>
          <Save size={14} /> Log & Stats
        </button>
        <button className={`tab-btn ${tab === "photos" ? "active" : ""}`} onClick={() => setTab("photos")}>
          <Camera size={14} /> Progress Photos
        </button>
      </div>

      {/* LOG & STATS TAB */}
      {tab === "log" && (
        <>
          <div className="grid-2" style={{ marginBottom: "2rem" }}>

            {/* Log Today */}
            <div className="glass-card">
              <h3 style={{ fontSize: "1.15rem", marginBottom: "1.25rem" }}>Log Today</h3>

              {todayLog && (
                <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", padding: "0.75rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem", fontSize: "0.85rem", color: "var(--success)" }}>
                  Already logged today · Weight: {todayLog.weight ?? "—"} kg · Workout: {todayLog.workout_completed ? "Done" : "Skipped"}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Today's Weight (kg)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 74.5"
                  step="0.1"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Workout Completed?</label>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                  <button type="button" className={`btn ${workoutDone ? "btn-primary" : "btn-secondary"}`} onClick={() => setWorkoutDone(true)} style={{ flex: 1, gap: "0.4rem" }}>
                    <CheckCircle size={16} /> Yes
                  </button>
                  <button type="button" className={`btn ${!workoutDone ? "btn-primary" : "btn-secondary"}`} onClick={() => setWorkoutDone(false)} style={{ flex: 1, gap: "0.4rem" }}>
                    <XCircle size={16} /> No
                  </button>
                </div>
              </div>

              {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--danger)", padding: "0.75rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</div>}
              {saveMsg && <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "var(--success)", padding: "0.75rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem", fontSize: "0.85rem" }}>{saveMsg}</div>}

              <button className="btn btn-primary glow-btn" style={{ width: "100%" }} onClick={logToday} disabled={saving}>
                <Save size={16} /> {saving ? "Saving..." : "Save Today's Log"}
              </button>
            </div>

            {/* Insights */}
            {insights && (
              <div className="glass-card">
                <h3 style={{ fontSize: "1.15rem", marginBottom: "1.25rem" }}>30-Day Insights</h3>

                <div className="grid-2" style={{ gap: "1rem", marginBottom: "1.25rem" }}>
                  <div style={{ textAlign: "center", background: "rgba(163,230,53,0.06)", borderRadius: "var(--radius-sm)", padding: "1.25rem" }}>
                    <div style={{ fontSize: "2.2rem", fontWeight: "800", fontFamily: "var(--font-heading)", color: "var(--accent-lime)" }}>{insights.consistency_rate}%</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Consistency</div>
                  </div>
                  <div style={{ textAlign: "center", background: "rgba(6,182,212,0.06)", borderRadius: "var(--radius-sm)", padding: "1.25rem" }}>
                    <div style={{ fontSize: "2.2rem", fontWeight: "800", fontFamily: "var(--font-heading)", color: insights.weight_change_kg <= 0 ? "var(--success)" : "var(--warning)" }}>
                      {insights.weight_change_kg > 0 ? "+" : ""}{insights.weight_change_kg}
                      <span style={{ fontSize: "1rem" }}>kg</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Weight Change</div>
                  </div>
                </div>

                {streak > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)", borderRadius: "var(--radius-sm)", padding: "0.75rem", marginBottom: "1rem" }}>
                    <Flame size={20} style={{ color: "#fb923c", flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: "700", color: "#fb923c" }}>{streak}-day streak!</span>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginLeft: "0.4rem" }}>Keep it going!</span>
                    </div>
                  </div>
                )}

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--card-border)", borderRadius: "var(--radius-sm)", padding: "1rem", fontSize: "0.88rem", color: "var(--text-primary)", lineHeight: "1.5" }}>
                  {insights.trend_message}
                </div>
              </div>
            )}
          </div>

          {/* Weight Chart */}
          {chartData.length >= 2 && (
            <div className="glass-card" style={{ marginBottom: "2rem" }}>
              <div className="flex-center" style={{ gap: "0.5rem", marginBottom: "1.25rem", justifyContent: "flex-start" }}>
                <BarChart2 size={18} style={{ color: "var(--accent-cyan)" }} />
                <h3 style={{ fontSize: "1.1rem" }}>Weight Over Time</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f3f4f6" }} />
                  <Line type="monotone" dataKey="weight" stroke="#a3e635" strokeWidth={2.5} dot={{ fill: "#a3e635", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* History Table */}
          {history.length > 0 && (
            <div className="glass-card">
              <h3 style={{ fontSize: "1.1rem", marginBottom: "1.25rem" }}>Log History</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Date", "Weight (kg)", "Workout"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "0.6rem 0.75rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--card-border)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...history].reverse().slice(0, 20).map((log) => (
                      <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "0.7rem 0.75rem", fontSize: "0.9rem" }}>{new Date(log.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td style={{ padding: "0.7rem 0.75rem", fontSize: "0.9rem", fontWeight: "600" }}>{log.weight ?? "—"}</td>
                        <td style={{ padding: "0.7rem 0.75rem" }}>
                          <span className={`badge ${log.workout_completed ? "badge-lime" : "badge-gray"}`}>
                            {log.workout_completed ? "Done" : "Skipped"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* PHOTOS TAB */}
      {tab === "photos" && (
        <div>
          {/* Upload */}
          <div className="glass-card" style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>Add Progress Photo</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>Upload a photo to visually track your body transformation over time.</p>

            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Week 4 front — 74kg"
                value={photoNote}
                onChange={e => setPhotoNote(e.target.value)}
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoUpload}
            />
            <button
              className="btn btn-primary glow-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              style={{ gap: "0.5rem" }}
            >
              <Camera size={16} />
              {uploadingPhoto ? "Uploading..." : "Choose & Upload Photo"}
            </button>
          </div>

          {/* Gallery */}
          {photos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
              <Camera size={40} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
              <p>No progress photos yet. Upload your first one!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
              {photos.map(photo => (
                <div key={photo.id} className="glass-card" style={{ padding: "0.75rem" }}>
                  <img
                    src={photo.image_data}
                    alt={photo.note || "Progress photo"}
                    style={{ width: "100%", borderRadius: "var(--radius-sm)", objectFit: "cover", maxHeight: "260px" }}
                  />
                  <div className="flex-between" style={{ marginTop: "0.75rem" }}>
                    <div>
                      {photo.note && <p style={{ fontSize: "0.85rem", fontWeight: "600" }}>{photo.note}</p>}
                      <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                        {new Date(photo.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "0.25rem" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
