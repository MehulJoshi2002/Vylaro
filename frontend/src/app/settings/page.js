"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../api";
import { User, Target, Utensils, Dumbbell, Save, CheckCircle, RefreshCw } from "lucide-react";

const GOAL_OPTIONS = [
  { value: "lose", label: "Lose Weight", desc: "Caloric deficit + fat loss" },
  { value: "gain", label: "Build Muscle", desc: "Caloric surplus + strength" },
  { value: "maintain", label: "Maintain", desc: "Recomposition & fitness" },
];

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { value: "light", label: "Light", desc: "1–3 days/week" },
  { value: "moderate", label: "Moderate", desc: "3–5 days/week" },
  { value: "active", label: "Active", desc: "6–7 days/week" },
  { value: "very_active", label: "Very Active", desc: "Athlete / physical job" },
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner", desc: "< 1 year training" },
  { value: "intermediate", label: "Intermediate", desc: "1–3 years" },
  { value: "advanced", label: "Advanced", desc: "3+ years" },
];

const EQUIPMENT_LIST = [
  "Dumbbells", "Barbell", "Pull-up Bar", "Resistance Bands",
  "Kettlebell", "Bench", "Cable Machine", "Smith Machine"
];

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [recalcNote, setRecalcNote] = useState(false);

  const [form, setForm] = useState({
    name: "", age: "", gender: "male", height: "", weight: "",
    goal: "lose", activity_level: "moderate", experience: "beginner",
    diet_preference: "veg", budget: "",
    workout_location: "Gym", equipment: [],
  });

  const [originalTargets, setOriginalTargets] = useState({ calorie: null, protein: null });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await api.me();
      setForm({
        name: user.name || "",
        age: user.age || "",
        gender: user.gender || "male",
        height: user.height || "",
        weight: user.weight || "",
        goal: user.goal || "lose",
        activity_level: user.activity_level || "moderate",
        experience: user.experience || "beginner",
        diet_preference: user.diet_preference || "veg",
        budget: user.budget || "",
        workout_location: user.workout_location || "Gym",
        equipment: user.equipment || [],
      });
      setOriginalTargets({ calorie: user.calorie_target, protein: user.protein_target });
    } catch (e) {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setSaved(false);
    // Warn user if AI-affecting fields change
    if (["goal", "activity_level", "weight", "height", "age", "gender", "diet_preference", "budget", "workout_location", "equipment"].includes(field)) {
      setRecalcNote(true);
    }
  };

  const toggleEquipment = (item) => {
    const eq = form.equipment.includes(item)
      ? form.equipment.filter(e => e !== item)
      : [...form.equipment, item];
    set("equipment", eq);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const payload = {
        name: form.name || undefined,
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender,
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        goal: form.goal,
        activity_level: form.activity_level,
        experience: form.experience,
        diet_preference: form.diet_preference,
        budget: form.budget ? parseFloat(form.budget) : undefined,
        workout_location: form.workout_location,
        equipment: form.equipment,
      };
      const updated = await api.updateProfile(payload);
      // Update cached name
      localStorage.setItem("userName", updated.name || form.name);
      setOriginalTargets({ calorie: updated.calorie_target, protein: updated.protein_target });
      setSaved(true);
      setRecalcNote(false);
    } catch (e) {
      setError(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex-center" style={{ minHeight: "80vh" }}>
      <RefreshCw size={28} style={{ color: "var(--accent-lime)", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="app-container fade-in" style={{ paddingTop: "2rem", paddingBottom: "5rem", maxWidth: "720px" }}>

      <div className="flex-between" style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.9rem" }}>Settings & <span className="gradient-text">Profile</span></h1>
        <button className="btn btn-primary glow-btn" onClick={save} disabled={saving} style={{ gap: "0.5rem" }}>
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {recalcNote && !saved && (
        <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.25)", color: "var(--accent-cyan)", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>
          Your AI plans (workout & diet) will use this updated profile on next generation.
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--danger)", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {/* Current Targets */}
      {originalTargets.calorie && (
        <div className="glass-card flex-responsive" style={{ marginBottom: "1.5rem", gap: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Daily Calorie Target</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "800", fontFamily: "var(--font-heading)", color: "#f59e0b" }}>{originalTargets.calorie} kcal</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Daily Protein Target</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "800", fontFamily: "var(--font-heading)", color: "var(--accent-lime)" }}>{originalTargets.protein}g</div>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", alignSelf: "center" }}>Auto-recalculated when you save weight, goal, or activity level.</div>
        </div>
      )}

      {/* Personal Info */}
      <Section icon={<User size={18} style={{ color: "var(--accent-cyan)" }} />} title="Personal Info">
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your name" />
          </div>
          <div className="form-group">
            <label className="form-label">Age</label>
            <input className="form-input" type="number" value={form.age} onChange={e => set("age", e.target.value)} placeholder="e.g. 24" />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {["male", "female"].map(g => (
                <button key={g} type="button"
                  className={`btn ${form.gender === g ? "btn-primary" : "btn-secondary"}`}
                  style={{ flex: 1, textTransform: "capitalize" }}
                  onClick={() => set("gender", g)}>{g}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Height (cm)</label>
            <input className="form-input" type="number" value={form.height} onChange={e => set("height", e.target.value)} placeholder="e.g. 175" />
          </div>
          <div className="form-group">
            <label className="form-label">Current Weight (kg)</label>
            <input className="form-input" type="number" step="0.1" value={form.weight} onChange={e => set("weight", e.target.value)} placeholder="e.g. 72.5" />
          </div>
        </div>
      </Section>

      {/* Goals */}
      <Section icon={<Target size={18} style={{ color: "var(--accent-lime)" }} />} title="Fitness Goal">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
          {GOAL_OPTIONS.map(opt => (
            <button key={opt.value} type="button" onClick={() => set("goal", opt.value)}
              style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.875rem 1rem", borderRadius: "var(--radius-sm)", background: form.goal === opt.value ? "rgba(163,230,53,0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${form.goal === opt.value ? "rgba(163,230,53,0.4)" : "var(--card-border)"}`, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: `2px solid ${form.goal === opt.value ? "var(--accent-lime)" : "var(--card-border)"}`, background: form.goal === opt.value ? "var(--accent-lime)" : "transparent", flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "0.9rem" }}>{opt.label}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="form-group">
          <label className="form-label">Activity Level</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {ACTIVITY_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => set("activity_level", opt.value)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.875rem", borderRadius: "var(--radius-sm)", background: form.activity_level === opt.value ? "rgba(163,230,53,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${form.activity_level === opt.value ? "rgba(163,230,53,0.3)" : "var(--card-border)"}`, cursor: "pointer" }}>
                <span style={{ fontWeight: form.activity_level === opt.value ? "600" : "400", fontSize: "0.88rem" }}>{opt.label}</span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Experience Level</label>
          <div className="flex-responsive">
            {EXPERIENCE_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => set("experience", opt.value)}
                className={`btn ${form.experience === opt.value ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1, flexDirection: "column", gap: "0.1rem", padding: "0.6rem" }}>
                <span style={{ fontSize: "0.85rem" }}>{opt.label}</span>
                <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Diet */}
      <Section icon={<Utensils size={18} style={{ color: "var(--accent-violet)" }} />} title="Diet Preferences">
        <div className="form-group">
          <label className="form-label">Diet Type</label>
          <div className="flex-responsive">
            {[{ value: "veg", label: "Vegetarian" }, { value: "non-veg", label: "Non-Vegetarian" }].map(opt => (
              <button key={opt.value} type="button"
                className={`btn ${form.diet_preference === opt.value ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1 }} onClick={() => set("diet_preference", opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Monthly Food Budget (INR)</label>
          <input className="form-input" type="number" value={form.budget} onChange={e => set("budget", e.target.value)} placeholder="e.g. 5000" />
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>Used to generate budget-appropriate meal plans.</p>
        </div>
      </Section>

      {/* Workout Setup */}
      <Section icon={<Dumbbell size={18} style={{ color: "var(--accent-lime)" }} />} title="Workout Setup">
        <div className="form-group">
          <label className="form-label">Workout Location</label>
          <div className="flex-responsive">
            {["Gym", "Home Workout"].map(loc => (
              <button key={loc} type="button"
                className={`btn ${form.workout_location === loc ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1 }} onClick={() => set("workout_location", loc)}>
                {loc}
              </button>
            ))}
          </div>
        </div>
        {form.workout_location === "Home Workout" && (
          <div className="form-group">
            <label className="form-label">Available Equipment</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {EQUIPMENT_LIST.map(item => (
                <button key={item} type="button" onClick={() => toggleEquipment(item)}
                  style={{ padding: "0.4rem 0.875rem", borderRadius: "2rem", fontSize: "0.82rem", cursor: "pointer", background: form.equipment.includes(item) ? "rgba(163,230,53,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.equipment.includes(item) ? "rgba(163,230,53,0.4)" : "var(--card-border)"}`, color: form.equipment.includes(item) ? "var(--accent-lime)" : "var(--text-secondary)", fontWeight: form.equipment.includes(item) ? "600" : "400" }}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Bottom Save */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button className="btn btn-primary glow-btn" onClick={save} disabled={saving} style={{ gap: "0.5rem", padding: "0.75rem 2rem" }}>
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save All Changes"}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="glass-card" style={{ marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--card-border)" }}>
        {icon}
        <h3 style={{ fontSize: "1rem", fontWeight: "700" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}
