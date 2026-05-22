"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";
import { Dumbbell, Eye, EyeOff, Sparkles, LogIn, UserPlus } from "lucide-react";

export default function Home() {
  const router = useRouter();
  
  // Tab selector: login vs register
  const [isLogin, setIsLogin] = useState(true);
  
  // Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // UI States
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.me()
        .then((user) => {
          if (user.workout_location) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
        });
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login flow
        const res = await api.login(email, password);
        localStorage.setItem("token", res.access_token);
        localStorage.setItem("userName", res.name || "User");
        
        // Fetch profile to see if onboarded
        const profile = await api.me();
        if (profile.workout_location) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      } else {
        // Register flow
        const res = await api.register(name, email, password);
        localStorage.setItem("token", res.access_token);
        localStorage.setItem("userName", res.name);
        router.push("/onboarding");
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Make sure FastAPI server is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center fade-in" style={{ minHeight: "100vh", padding: "1.5rem", background: "var(--bg-primary)" }}>
      <div className="grid-2 app-container" style={{ width: "100%", maxWidth: "1000px", alignItems: "center" }}>
        
        {/* Left Side: Brand Marketing Panel — hidden on mobile */}
        <div className="auth-marketing" style={{ paddingRight: "1rem" }}>
          <div className="flex-center" style={{ justifyContent: "flex-start", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <Dumbbell size={40} style={{ color: "var(--accent-lime)" }} />
            <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>
              <span className="gradient-text">Vylaro</span>
            </h1>
          </div>
          
          <h2 style={{ fontSize: "2.4rem", lineHeight: "1.2", marginBottom: "1rem", fontFamily: "var(--font-heading)" }}>
            Affordable <span className="gradient-text">AI Fitness Guidance</span> for Everyday People.
          </h2>
          
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: "1.5", marginBottom: "2rem" }}>
            Hit your protein targets on a budget, generate equipment-customized workout splits, and consult your pocket fitness co-pilot instantly. No expensive personal trainers needed.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="flex-center" style={{ justifyContent: "flex-start", gap: "0.75rem" }}>
              <div className="flex-center" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(163,230,53,0.1)", color: "var(--accent-lime)" }}>
                <Sparkles size={18} />
              </div>
              <span style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>Personalized 6-day split generator</span>
            </div>
            <div className="flex-center" style={{ justifyContent: "flex-start", gap: "0.75rem" }}>
              <div className="flex-center" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(6,182,212,0.1)", color: "var(--accent-cyan)" }}>
                <Sparkles size={18} />
              </div>
              <span style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>High-protein meal splits fitted to your budget</span>
            </div>
            <div className="flex-center" style={{ justifyContent: "flex-start", gap: "0.75rem" }}>
              <div className="flex-center" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(139,92,246,0.1)", color: "var(--accent-violet)" }}>
                <Sparkles size={18} />
              </div>
              <span style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>Instant recipe generator for ingredients you have at home</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="glass-card" style={{ maxWidth: "420px", width: "100%", margin: "0 auto" }}>
          
          {/* Mobile-only logo/name header */}
          <div className="mobile-brand-header">
            <Dumbbell size={36} style={{ color: "var(--accent-lime)" }} />
            <h1>
              <span className="gradient-text">Vylaro</span>
            </h1>
          </div>

          <div className="tab-container">
            <button 
              className={`tab-btn ${isLogin ? "active" : ""}`}
              onClick={() => { setIsLogin(true); setError(""); }}
            >
              Sign In
            </button>
            <button 
              className={`tab-btn ${!isLogin ? "active" : ""}`}
              onClick={() => { setIsLogin(false); setError(""); }}
            >
              Sign Up
            </button>
          </div>

          <h3 style={{ fontSize: "1.4rem", marginBottom: "0.5rem", fontFamily: "var(--font-heading)" }}>
            {isLogin ? "Welcome Back Partner" : "Start Your Fitness Journey"}
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            {isLogin ? "Sign in to access your workout and nutrition routines." : "Complete standard registration to access Vylaro fitness generation."}
          </p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--danger)", padding: "0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter your name" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="you@example.com" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <div className="form-group" style={{ position: "relative" }}>
              <label className="form-label">Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-input" 
                placeholder="••••••••" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", bottom: "10px", background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary glow-btn" 
              style={{ width: "100%", marginTop: "1rem", padding: "0.85rem" }}
              disabled={loading}
            >
              {loading ? (
                "Verifying Profile..."
              ) : isLogin ? (
                <>
                  <LogIn size={18} /> Access Dashboard
                </>
              ) : (
                <>
                  <UserPlus size={18} /> Create Account
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
