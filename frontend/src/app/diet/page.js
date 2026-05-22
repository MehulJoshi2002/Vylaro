"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../api";
import { Utensils, RefreshCw, ChefHat, Plus, X, Flame, Zap, IndianRupee } from "lucide-react";

export default function DietPage() {
  const router = useRouter();
  const [diet, setDiet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  // Recipe state
  const [tab, setTab] = useState("diet");
  const [ingredients, setIngredients] = useState([""]);
  const [recipe, setRecipe] = useState(null);
  const [recipeHistory, setRecipeHistory] = useState([]);
  const [generatingRecipe, setGeneratingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    loadDiet();
  }, []);

  const loadDiet = async () => {
    setLoading(true);
    try {
      const d = await api.getActiveDiet();
      setDiet(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async () => {
    setRegenerating(true);
    setError("");
    try {
      const d = await api.regenerateDiet();
      setDiet(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setRegenerating(false);
    }
  };

  const generateRecipe = async () => {
    const clean = ingredients.map(i => i.trim()).filter(Boolean);
    if (clean.length === 0) return;
    setGeneratingRecipe(true);
    setRecipeError("");
    try {
      const r = await api.generateRecipe(clean);
      setRecipe(r);
    } catch (e) {
      setRecipeError(e.message);
    } finally {
      setGeneratingRecipe(false);
    }
  };

  const loadHistory = async () => {
    try {
      const h = await api.getRecipeHistory();
      setRecipeHistory(h);
    } catch (e) {}
  };

  const deleteRecipe = async (id) => {
    try {
      await api.deleteRecipe(id);
      setRecipeHistory(prev => prev.filter(r => r.id !== id));
    } catch (e) {}
  };

  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab]);

  if (loading) return (
    <div className="flex-center" style={{ minHeight: "80vh" }}>
      <Utensils size={36} style={{ color: "var(--accent-violet)" }} />
    </div>
  );

  return (
    <div className="app-container fade-in" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>

      <div className="flex-between" style={{ marginBottom: "2rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h1 style={{ fontSize: "1.9rem" }}>Diet <span className="gradient-text">& Recipes</span></h1>
        {tab === "diet" && (
          <button className="btn btn-primary glow-btn" onClick={regenerate} disabled={regenerating}>
            <RefreshCw size={16} style={{ animation: regenerating ? "spin 1s linear infinite" : "none" }} />
            {regenerating ? "Regenerating..." : "Regenerate Plan"}
          </button>
        )}
      </div>

      {/* Top Tabs */}
      <div className="tab-container" style={{ marginBottom: "2rem" }}>
        <button className={`tab-btn ${tab === "diet" ? "active" : ""}`} onClick={() => setTab("diet")}>
          <Utensils size={14} /> Meal Plan
        </button>
        <button className={`tab-btn ${tab === "recipe" ? "active" : ""}`} onClick={() => setTab("recipe")}>
          <ChefHat size={14} /> Recipe Generator
        </button>
        <button className={`tab-btn ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>
          Past Recipes
        </button>
      </div>

      {/* Diet Plan Tab */}
      {tab === "diet" && (
        <>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--danger)", padding: "0.875rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem" }}>
              {error}
            </div>
          )}

          {diet ? (
            <>
              {/* Macro Summary */}
              <div className="grid-3" style={{ marginBottom: "2rem" }}>
                <MacroCard icon={<Flame size={18} style={{ color: "#f59e0b" }} />} label="Calories" value={`${diet.calorie_total} kcal`} color="#f59e0b" />
                <MacroCard icon={<Zap size={18} style={{ color: "var(--accent-lime)" }} />} label="Protein" value={`${diet.protein_total}g`} color="var(--accent-lime)" />
                {diet.cost_total > 0 && (
                  <MacroCard icon={<IndianRupee size={18} style={{ color: "var(--accent-cyan)" }} />} label="Est. Daily Cost" value={`₹${diet.cost_total}`} color="var(--accent-cyan)" />
                )}
              </div>

              {/* Meals */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {Object.entries(diet.meals).map(([mealName, meal]) => {
                  const mealName2 = meal?.name;
                  const ingredients = meal?.ingredients || (Array.isArray(meal) ? meal : null);
                  const proteinG = meal?.protein_g;
                  const cals = meal?.calories;
                  const costInr = meal?.cost_inr;

                  return (
                    <div key={mealName} className="glass-card">
                      <div className="meal-header">
                        <div>
                          <h3 style={{ fontSize: "1.05rem", color: "var(--accent-lime)" }}>{mealName}</h3>
                          {mealName2 && <p style={{ fontSize: "0.9rem", fontWeight: "600", marginTop: "0.15rem" }}>{mealName2}</p>}
                        </div>
                        <div className="meal-badges">
                          {proteinG && <span className="badge badge-lime">{proteinG}g protein</span>}
                          {cals && <span className="badge badge-gray">{cals} kcal</span>}
                          {costInr && <span className="badge badge-violet">₹{costInr}</span>}
                        </div>
                      </div>
                      {ingredients && Array.isArray(ingredients) && (
                        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                          {ingredients.map((ing, i) => (
                            <li key={i} style={{ fontSize: "0.88rem", color: "var(--text-secondary)", paddingLeft: "0.75rem", borderLeft: "2px solid var(--card-border)" }}>
                              {typeof ing === "object" ? (ing.name || ing.food || JSON.stringify(ing)) : ing}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
              <Utensils size={40} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
              <p style={{ color: "var(--text-secondary)" }}>No diet plan yet. Complete onboarding to generate one.</p>
            </div>
          )}
        </>
      )}

      {/* Recipe Generator Tab */}
      {tab === "recipe" && (
        <div style={{ maxWidth: "600px" }}>
          <div className="glass-card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>What's in your kitchen?</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>Enter your available ingredients and we'll generate a high-protein recipe.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
              {ingredients.map((ing, i) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Ingredient ${i + 1} (e.g., chicken breast)`}
                    value={ing}
                    onChange={e => {
                      const updated = [...ingredients];
                      updated[i] = e.target.value;
                      setIngredients(updated);
                    }}
                  />
                  {ingredients.length > 1 && (
                    <button onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn btn-secondary" onClick={() => setIngredients([...ingredients, ""])}>
                <Plus size={16} /> Add
              </button>
              <button className="btn btn-primary glow-btn" onClick={generateRecipe} disabled={generatingRecipe || !ingredients.some(i => i.trim())}>
                {generatingRecipe ? "Generating..." : <><ChefHat size={16} /> Generate Recipe</>}
              </button>
            </div>

            {recipeError && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--danger)", padding: "0.75rem", borderRadius: "var(--radius-sm)", marginTop: "1rem", fontSize: "0.85rem" }}>
                {recipeError}
              </div>
            )}
          </div>

          {recipe && <RecipeCard recipe={recipe} />}
        </div>
      )}

      {/* Recipe History Tab */}
      {tab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {recipeHistory.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
              <ChefHat size={40} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
              <p>No recipes generated yet.</p>
            </div>
          ) : (
            recipeHistory.map(r => <RecipeCard key={r.id} recipe={r} onDelete={() => deleteRecipe(r.id)} />)
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function MacroCard({ icon, label, value, color }) {
  return (
    <div className="glass-card" style={{ textAlign: "center" }}>
      <div className="flex-center" style={{ marginBottom: "0.5rem" }}>{icon}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: "800", fontFamily: "var(--font-heading)", color }}>{value}</div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{label}</div>
    </div>
  );
}

function RecipeCard({ recipe, onDelete }) {
  return (
    <div className="glass-card">
      <div className="flex-between" style={{ marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.2rem" }}>{recipe.name}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {recipe.created_at && (
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{new Date(recipe.created_at).toLocaleDateString()}</span>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              title="Delete recipe"
              style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "var(--danger)", borderRadius: "var(--radius-sm)", padding: "0.3rem 0.5rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem" }}
            >
              <X size={13} /> Delete
            </button>
          )}
        </div>
      </div>

      {recipe.macros && (
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {Object.entries(recipe.macros).map(([k, v]) => (
            <span key={k} className="badge badge-lime">{k}: {v}</span>
          ))}
        </div>
      )}

      <div className="grid-2">
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Ingredients</div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {recipe.ingredients.map((i, idx) => (
              <li key={idx} style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>• {i}</li>
            ))}
          </ul>
        </div>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--accent-violet)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Instructions</div>
          <ol style={{ paddingLeft: "1.1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {recipe.instructions.map((step, idx) => (
              <li key={idx} style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
