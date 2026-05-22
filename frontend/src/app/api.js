const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper for HTTP requests
async function request(endpoint, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = "Something went wrong";
    if (errorData.detail) {
      errorMessage = typeof errorData.detail === "string" 
        ? errorData.detail 
        : JSON.stringify(errorData.detail);
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (name, email, password) => 
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) => 
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request("/auth/me"),

  // Onboarding
  onboard: (data) => 
    request("/users/onboard", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateProfile: (data) => 
    request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Workouts
  getActiveWorkout: () => request("/workout/active"),
  getUpgradeStatus: () => request("/workout/upgrade-status"),
  upgradeWorkout: () => request("/workout/upgrade", { method: "POST" }),
  getWorkoutHistory: () => request("/workout/history"),

  // Diets
  getActiveDiet: () => request("/diet/active"),
  regenerateDiet: () => request("/diet/regenerate", { method: "POST" }),

  // Recipes
  generateRecipe: (ingredients) => 
    request("/recipe/generate", {
      method: "POST",
      body: JSON.stringify({ ingredients }),
    }),
  getRecipeHistory: () => request("/recipe/history"),
  deleteRecipe: (id) => request(`/recipe/${id}`, { method: "DELETE" }),

  // Progress Logging
  logProgress: (weight, workoutCompleted, date) => 
    request("/progress/logs", {
      method: "POST",
      body: JSON.stringify({
        weight: weight !== undefined ? parseFloat(weight) : null,
        workout_completed: workoutCompleted,
        date: date || null
      }),
    }),
  getProgressHistory: () => request("/progress/history"),
  getProgressInsights: () => request("/progress/insights"),

  // Progress Photos
  uploadPhoto: (image_data, note, date) =>
    request("/progress/photos", {
      method: "POST",
      body: JSON.stringify({ image_data, note: note || null, date: date || null }),
    }),
  getPhotos: () => request("/progress/photos"),
  deletePhoto: (id) => request(`/progress/photos/${id}`, { method: "DELETE" }),

  // Workout Logger
  logExercise: (exercise_name, sets_done, reps_done, weight_kg, notes) =>
    request("/workout/log", {
      method: "POST",
      body: JSON.stringify({ exercise_name, sets_done, reps_done, weight_kg: weight_kg || null, notes: notes || null }),
    }),
  getTodayWorkoutLogs: () => request("/workout/logs/today"),
  deleteWorkoutLog: (id) => request(`/workout/log/${id}`, { method: "DELETE" }),

  // AI Chat
  sendChatMessage: (message, history) => 
    request("/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),
};
