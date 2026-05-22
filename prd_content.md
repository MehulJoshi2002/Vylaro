# Vylaro (formerly FitCopilot AI)
## Product Requirements Document
Version 1.0  |  MVP Implemented  |  2026

"Affordable AI fitness guidance for everyday people."

---

## 1. Product Overview
- **Product Name**: Vylaro
- **Version**: 1.0 — MVP
- **Status**: Implemented / Active
- **Owner**: Personal Project

Vylaro is an AI-powered fitness and nutrition assistant built for everyday people who cannot afford expensive personal trainers or nutritionists. It generates personalized 6-day workout splits, budget-aware diet plans, high-protein meal options, ingredient-based recipe solutions, and progress tracking insights — all dynamically driven by Gemini AI.

---

## 2. Problem Statement
Professional coaching remains expensive and inaccessible. Most fitness applications are generic, calorie-focused, and ignore real-world constraints like local ingredient availability, personal equipment limits, or tight budgets.

### Core User Struggles:
- High cost of human personal trainers and nutritionists.
- Confusing, conflicting, or overwhelming fitness advice online.
- Lack of personalized, budget-aware meal planning.
- Difficulty hitting daily protein targets with limited resources.
- Inconsistent workout structure and programming.

---

## 3. Goals & Objectives
- Provide affordable, accessible, and high-quality AI-driven fitness and nutrition guidance.
- Drive user retention through daily log reminders and interactive visual progress charts.
- Build a robust foundation for a premium subscription model (e.g., unlimited AI generations, advanced analytics).

---

## 4. Target Audience
- **Gym Beginners**: New to lifting; need clear exercise instructions, sets, reps, and splits.
- **Home Workout Users**: No gym access; need routines customized for bodyweight, resistance bands, or dumbbells.
- **College Students / Budget-Conscious Users**: Need high-protein dietary suggestions that respect a strict monthly food budget (INR).
- **Working Professionals**: Need efficient, structured workout plans that adapt to their limited time.

---

## 5. Core Features

### Feature 1: Guided User Onboarding & Targets
Collects user profile details to calculate recommended daily nutritional targets and generate tailored fitness plans.
- **Inputs**: Age, gender, height, weight, goal (lose/gain/maintain), activity level, experience level, diet preference (veg/non-veg), monthly food budget (INR), and workout location (Gym vs. Home).
- **Equipment Checklist**:
  - *Gym*: Checklist of available equipment (barbells, cables, dumbbells, machines, etc.).
  - *Home*: Available home equipment (dumbbells, resistance bands, none/bodyweight).
- **Outputs**: Calorie target, protein target, and equipment-matched workout/diet plans.

### Feature 2: AI Workout Plan Generator & Progression (Upgrades)
Generates a structured weekly training split based on user profile and equipment.
- **6-Day Split**: Dynamic programming featuring compound and isolation movements, set ranges, rep targets, and rest times.
- **Workout Progression (Upgrade System)**: Evaluates user consistency and time on the current plan. If active for **4+ weeks**, the app enables an **Upgrade Plan** action to dynamically generate a more challenging split incorporating progressive overload.
- **Plan History**: Archives past plans and tracks historical analytics (weeks ran, sessions completed, and overall consistency rate).

### Feature 3: AI Diet & Meal Planner
Generates full-day nutritional outlines based on budget and macro targets.
- **Structure**: Includes meals for breakfast, lunch, dinner, and snacks.
- **Affordable Sourcing**: AI prioritizes budget-friendly, locally accessible ingredients (e.g., paneer, eggs, curd, lentils, soy) matching the user's monthly budget constraint (INR).

### Feature 4: Ingredient-Based Recipe Generator
Answers the question "what can I cook with what I have?"
- **Inputs**: List of available groceries at home.
- **Outputs**: Recipe name, calorie/protein macros, and step-by-step preparation instructions.

### Feature 5: Progress & Exercise Logger
Tracks execution and consistency to fuel AI-generated insights.
- **Daily Progress Log**: Prompts daily logging of body weight and overall workout completion status. Includes interactive Recharts line graph tracking weight trends.
- **Exercise Logger**: For each exercise, users log the actual sets done, rep counts per set (e.g., `"10, 10, 8"`), weight lifted (kg), and custom notes.
- **Progress Photos**: A gallery allowing base64 image uploads with custom notes to visually track physical progress over time.

### Feature 6: Context-Aware AI Chat Assistant
A persistent, slide-out chat window available on all screens. Answers workout, substitution, or nutrition questions, automatically referencing the user's active profile and targets.

---

## 6. Functional User Stories

### 6.1 Onboarding & Profile
- **US-001 [High]**: As a new user, I want to complete a multi-step onboarding flow so that Vylaro can calculate my macros and generate my first plans.
- **US-002 [Medium]**: As a user, I want to edit my details in settings at any time to update my weight, location, or budget, triggering a plan regeneration.
- **US-003 [High]**: As an onboarded user, I want to sign out of my account from the Settings or Onboarding screens.

### 6.2 Workout Plan & Logger
- **US-004 [High]**: As a user, I want to view my weekly exercises by day, with details on sets, reps, and instructions.
- **US-005 [High]**: As a lifting user, I want to log my sets, reps, weight, and notes for individual exercises to track my progressive overload.
- **US-006 [Medium]**: As an experienced user, I want to upgrade my workout plan after 4 weeks of consistent logging to keep progressing.
- **US-007 [Medium]**: As a user, I want to view my archived workout plans along with stats on how long I used them and my consistency rate.

### 6.3 Diet & Recipes
- **US-008 [High]**: As a budget-conscious user, I want a meal plan structured around affordable ingredients that fit my monthly food budget.
- **US-009 [High]**: As a vegetarian, I want my meal plan to exclude meat/fish and focus on dairy, soy, and lentil protein sources.
- **US-010 [High]**: As a user, I want to input my available ingredients and receive a high-protein recipe with step-by-step cooking instructions.

### 6.4 Progress Tracking & Photos
- **US-011 [High]**: As a user, I want to log my daily weight and view my weight timeline on an interactive chart.
- **US-012 [High]**: As a user, I want to upload progress photos with notes to visually compare my physical changes over time.

### 6.5 AI Chat Assistant
- **US-013 [High]**: As a user, I want to ask questions like "Can I swap chicken for tofu?" in a persistent chat pane and get immediate macro comparisons.

---

## 7. Tech Stack & Architecture

- **Frontend**: Next.js (React framework) with responsive Vanilla CSS and Recharts for progress visualization.
- **Backend**: FastAPI (Python async REST API).
- **AI Model**: Google Gemini API via customized system prompting.
- **Database**: SQLite database (`fitcopilot.db`) utilizing SQLAlchemy ORM.
- **Authentication**: Local Custom JWT Bearer Session tokens (with configurable option for Firebase Auth via `USE_FIREBASE`).

---

## 8. Database Design

### Table: `users`
Tracks user credentials, profile attributes, and calculated nutritional targets.
- `id` (String, Primary Key)
- `name` (String)
- `email` (String, Unique)
- `age` (Integer)
- `gender` (String)
- `height` (Float)
- `weight` (Float)
- `goal` (String)
- `activity_level` (String)
- `experience` (String)
- `diet_preference` (String)
- `budget` (Float)
- `workout_location` (String)
- `equipment` (JSON)
- `calorie_target` (Integer)
- `protein_target` (Integer)
- `created_at` (DateTime)

### Table: `workout_plans`
Stores current and archived workout splits.
- `id` (Integer, Primary Key)
- `user_id` (String, ForeignKey)
- `split_type` (String)
- `exercises` (JSON)
- `active` (Boolean)
- `created_at` (DateTime)

### Table: `diet_plans`
Stores active and archived budget-conscious meal plans.
- `id` (Integer, Primary Key)
- `user_id` (String, ForeignKey)
- `meals` (JSON)
- `protein_total` (Integer)
- `calorie_total` (Integer)
- `cost_total` (Float)
- `active` (Boolean)
- `created_at` (DateTime)

### Table: `progress_logs`
Tracks daily logs (weight and workout completion status) to feed progress charts and insights.
- `id` (Integer, Primary Key)
- `user_id` (String, ForeignKey)
- `weight` (Float)
- `workout_completed` (Boolean)
- `date` (Date)

### Table: `workout_logs`
Stores specific performance stats logged per exercise.
- `id` (Integer, Primary Key)
- `user_id` (String, ForeignKey)
- `date` (Date)
- `exercise_name` (String)
- `sets_done` (Integer)
- `reps_done` (String) - e.g., `"10, 10, 8"`
- `weight_kg` (Float)
- `notes` (String)
- `created_at` (DateTime)

### Table: `progress_photos`
Stores visual progress logs.
- `id` (Integer, Primary Key)
- `user_id` (String, ForeignKey)
- `image_data` (Text - Base64 encoded image string)
- `note` (String)
- `date` (Date)
- `created_at` (DateTime)

### Table: `recipes`
Caches recipes generated by the user's ingredients.
- `id` (Integer, Primary Key)
- `user_id` (String, ForeignKey)
- `name` (String)
- `ingredients` (JSON)
- `macros` (JSON)
- `instructions` (JSON)
- `created_at` (DateTime)

---

## 9. MVP Scope & Exclusions

### Included in MVP:
- Custom login/signup authentication and JWT sessions.
- Dynamic onboarding + profile management.
- Gemini-powered workout & diet splits.
- Ingredient-based grocery recipe generation.
- Detailed set/rep logging + weight chart tracking + base64 progress photos gallery.
- Context-aware chatbot.

### Excluded from MVP:
- Wearable device integrations (Fitbit, Apple Watch).
- Real-time video/camera trainer pose correction.
- Social community features.
- Subscription billing integrations.
- Barcode calorie scanner.