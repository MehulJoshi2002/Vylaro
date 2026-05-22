"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../api";
import { Dumbbell, ChevronRight, ChevronLeft, Sparkles, LogOut } from "lucide-react";

const EQUIPMENT_OPTIONS = [
  "Barbell", "Dumbbells", "Pull-up Bar", "Bench", "Cables/Pulley",
  "Resistance Bands", "Kettlebells", "Bodyweight Only", "Smith Machine", "Leg Press"
];

export default function Onboarding() {
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    router.push("/");
  };
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    age: "",
    gender: "male",
    height: "",
    weight: "",
    goal: "lose",
    activity_level: "moderate",
    experience: "beginner",
    diet_preference: "veg",
    budget: "",
    workout_location: "Gym",
    equipment: [],
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleEquip = (e) => {
    setForm(f => ({
      ...f,
      equipment: f.equipment.includes(e)
        ? f.equipment.filter(x => x !== e)
        : [...f.equipment, e],
    }));
  };

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      await api.onboard({
        ...form,
        age: parseInt(form.age),
        height: parseFloat(form.height),
        weight: parseFloat(form.weight),
        budget: parseFloat(form.budget),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Body Stats",
      subtitle: "Tell us about your physique",
      content: (
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Age</label>
            <input type="number" className="form-input" placeholder="25" value={form.age} onChange={e => set("age", e.target.value)} min="15" max="80" />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-select" value={form.gender} onChange={e => set("gender", e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Height (cm)</label>
            <input type="number" className="form-input" placeholder="175" value={form.height} onChange={e => set("height", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Weight (kg)</label>
            <input type="number" className="form-input" placeholder="75" value={form.weight} onChange={e => set("weight", e.target.value)} />
          </div>
        </div>
      )
    },
    {
      title: "Your Goals",
      subtitle: "What are you training for?",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label className="form-label" style={{ marginBottom: "0.75rem", display: "block" }}>Primary Goal</label>
            <div className="grid-3">
              {[["lose", "Lose Fat", "🔥"], ["gain", "Build Muscle", "💪"], ["maintain", "Maintain", "⚖️"]].map(([val, label, icon]) => (
                <div key={val} className={`selectable-card ${form.goal === val ? "selected" : ""}`} onClick={() => set("goal", val)} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
                  <div style={{ fontWeight: "600", fontFamily: "var(--font-heading)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: "0.75rem", display: "block" }}>Activity Level</label>
            <select className="form-select" value={form.activity_level} onChange={e => set("activity_level", e.target.value)}>
              <option value="sedentary">Sedentary (desk job)</option>
              <option value="light">Light (1-2x/week)</option>
              <option value="moderate">Moderate (3-5x/week)</option>
              <option value="active">Active (6-7x/week)</option>
              <option value="very_active">Very Active (athlete)</option>
            </select>
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: "0.75rem", display: "block" }}>Training Experience</label>
            <div className="grid-3">
              {[["beginner", "Beginner", "< 1 year"], ["intermediate", "Intermediate", "1-3 years"], ["advanced", "Advanced", "3+ years"]].map(([val, label, sub]) => (
                <div key={val} className={`selectable-card ${form.experience === val ? "selected" : ""}`} onClick={() => set("experience", val)}>
                  <div style={{ fontWeight: "600", fontFamily: "var(--font-heading)", marginBottom: "0.25rem" }}>{label}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Diet & Budget",
      subtitle: "Personalize your nutrition plan",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label className="form-label" style={{ marginBottom: "0.75rem", display: "block" }}>Diet Preference</label>
            <div className="grid-2">
              {[["veg", "Vegetarian 🥗"], ["non-veg", "Non-Vegetarian 🍗"]].map(([val, label]) => (
                <div key={val} className={`selectable-card ${form.diet_preference === val ? "selected" : ""}`} onClick={() => set("diet_preference", val)} style={{ textAlign: "center", padding: "1.5rem" }}>
                  <div style={{ fontWeight: "600", fontFamily: "var(--font-heading)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Monthly Food Budget (₹)</label>
            <input type="number" className="form-input" placeholder="3000" value={form.budget} onChange={e => set("budget", e.target.value)} min="500" />
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>We'll plan meals that fit within your budget.</p>
          </div>
        </div>
      )
    },
    {
      title: "Workout Setup",
      subtitle: "Tell us where and how you train",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label className="form-label" style={{ marginBottom: "0.75rem", display: "block" }}>Workout Location</label>
            <div className="grid-2">
              {[["Gym", "🏋️ Gym", "Full equipment access"], ["Home Workout", "🏠 Home", "Bodyweight & bands"]].map(([val, label, sub]) => (
                <div key={val} className={`selectable-card ${form.workout_location === val ? "selected" : ""}`} onClick={() => { set("workout_location", val); if (val === "Home Workout") setForm(f => ({ ...f, workout_location: val, equipment: ["Bodyweight Only"] })); }}>
                  <div style={{ fontWeight: "600", fontFamily: "var(--font-heading)", marginBottom: "0.3rem" }}>{label}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: "0.75rem", display: "block" }}>Available Equipment</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {EQUIPMENT_OPTIONS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => toggleEquip(e)}
                  className={`badge ${form.equipment.includes(e) ? "badge-lime" : "badge-gray"}`}
                  style={{ cursor: "pointer", padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  const current = steps[step - 1];
  const isLast = step === steps.length;

  const canNext = () => {
    if (step === 1) return form.age && form.height && form.weight;
    if (step === 3) return form.budget;
    if (step === 4) return form.equipment.length > 0;
    return true;
  };

  return (
    <div className="fade-in" style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        {/* Top bar with Logout */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
          <button 
            onClick={handleLogout} 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.4rem", 
              background: "transparent", 
              border: "none", 
              color: "var(--text-secondary)", 
              cursor: "pointer", 
              fontSize: "0.85rem",
              fontFamily: "var(--font-heading)",
              fontWeight: "600",
              padding: "0.5rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="flex-center" style={{ gap: "0.5rem", marginBottom: "0.75rem" }}>
            <Dumbbell size={28} style={{ color: "var(--accent-lime)" }} />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: "800" }}>
              <span className="gradient-text">Vylaro</span>
            </span>
          </div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", marginBottom: "0.4rem" }}>
            Let's Build Your Plan
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Step {step} of {steps.length}</p>
        </div>

        {/* Progress bar */}
        <div style={{ background: "var(--bg-tertiary)", borderRadius: "99px", height: "6px", marginBottom: "2rem" }}>
          <div style={{ background: "linear-gradient(90deg, var(--accent-lime), var(--accent-cyan))", height: "100%", borderRadius: "99px", width: `${(step / steps.length) * 100}%`, transition: "width 0.4s ease" }} />
        </div>

        {/* Card */}
        <div className="glass-card">
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", marginBottom: "0.25rem" }}>{current.title}</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>{current.subtitle}</p>

          {current.content}

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--danger)", padding: "0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", marginTop: "1rem" }}>
              {error}
            </div>
          )}

          <div className="flex-between" style={{ marginTop: "2rem" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
              style={{ opacity: step === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={18} /> Back
            </button>

            {isLast ? (
              <button
                className="btn btn-primary glow-btn"
                onClick={submit}
                disabled={loading || !canNext()}
              >
                {loading ? "Generating your plan..." : <><Sparkles size={18} /> Generate My Plan</>}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
              >
                Next <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
