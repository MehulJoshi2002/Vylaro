FitCopilot AI

Product Requirements Document

Version 1.0  |  Personal Project  |  2025

"Affordable AI fitness guidance for everyday people."

"Affordable AI fitness guidance for everyday people."

1. Product Overview

Product Name | FitCopilot AI

Product Name

FitCopilot AI

Version | 1.0 — MVP

Version

1.0 — MVP

Status | In Planning

Status

In Planning

Owner | Personal Project

Owner

Personal Project

FitCopilot AI is an AI-powered fitness and nutrition assistant built for people who cannot afford personal trainers or nutritionists. It generates personalized workout plans, affordable diet plans, protein-focused meal suggestions, ingredient-based recipes, and progress tracking insights — all driven by Gemini AI.

2. Problem Statement

The Gap

Most fitness apps are generic, calorie-focused, and ignore real-world constraints like budget or ingredient availability. Professional coaching remains expensive and inaccessible.

What Users Struggle With

High cost of personal trainers and nutritionists

Confusing or conflicting fitness information online

No personalized, budget-aware meal planning

Difficulty hitting daily protein goals with limited food

Inconsistent workout planning without a structured program

Why Existing Solutions Fall Short

Generic plans with no personalization

Focus purely on calorie counting, ignoring macros

Zero consideration for budget or local food availability

No adaptive recommendations based on actual progress

3. Goals & Objectives

Business Goals

Provide affordable, accessible AI-driven fitness guidance

Build a platform with recurring daily engagement

Establish a freemium model to support future monetization

Demonstrate a full-stack AI product as a portfolio project

User Goals

Lose weight or gain muscle with a structured plan

Improve strength progressively over weeks

Maintain a healthy, affordable diet meeting protein targets

Get instant answers to fitness and nutrition questions

4. Target Audience

Segment | Description

Gym Beginners | New to structured training, need guidance on form and programming

College Students | Limited budget, need affordable nutrition and workout plans

Budget-Conscious Users | Want fitness results without expensive coaching or supplements

Working Professionals | Limited time, need efficient and structured weekly plans

Weight Management Users | Targeting fat loss or muscle gain with clear daily targets

Home Workout Users | No gym access, need bodyweight or minimal equipment routines

Vegetarian Enthusiasts | Need high-protein meal plans without meat

Segment

Description

Gym Beginners

New to structured training, need guidance on form and programming

College Students

Limited budget, need affordable nutrition and workout plans

Budget-Conscious Users

Want fitness results without expensive coaching or supplements

Working Professionals

Limited time, need efficient and structured weekly plans

Weight Management Users

Targeting fat loss or muscle gain with clear daily targets

Home Workout Users

No gym access, need bodyweight or minimal equipment routines

Vegetarian Enthusiasts

Need high-protein meal plans without meat

5. Core Features

Feature 1 — User Onboarding & Profile

Users complete a guided onboarding flow to provide personal data. The AI uses this to compute calorie targets, protein goals, and recommended workout intensity.

User Inputs | AI Outputs

Age, gender, height, weight | Daily calorie target

Fitness goal (lose / gain / maintain) | Daily protein target

Workout location: Gym or Home Workout | Equipment-matched exercise selection

If Gym: equipment available (barbells, cables, machines) | Compound + isolation split

If Home: equipment available (dumbbells, bands, none) | Bodyweight / minimal-equipment plan

Activity level & workout experience | Recommended workout intensity

Vegetarian / non-vegetarian preference | Suggested fitness plan type

Monthly food budget | Estimated macro split

User Inputs

AI Outputs

Age, gender, height, weight

Daily calorie target

Fitness goal (lose / gain / maintain)

Daily protein target

Workout location: Gym or Home Workout

Equipment-matched exercise selection

If Gym: equipment available (barbells, cables, machines)

Compound + isolation split

If Home: equipment available (dumbbells, bands, none)

Bodyweight / minimal-equipment plan

Activity level & workout experience

Recommended workout intensity

Vegetarian / non-vegetarian preference

Suggested fitness plan type

Monthly food budget

Estimated macro split

Feature 2 — AI Workout Plan Generator

Generates a fully personalized weekly workout split based on the user's profile, goals, workout location, and experience level. The AI branches into two distinct plan types depending on the user's selection during onboarding.

Workout location selection: Gym or Home Workout (chosen at onboarding)

Gym Plan: 6-day split using barbells, cables, and machines; compound + isolation movements

Home Plan: 6-day plan using bodyweight, dumbbells, or resistance bands; no gym required

Exercise list with sets, reps, and rest duration per session

Muscle focus per session (e.g. Chest & Triceps, Back & Biceps)

Beginner / intermediate adjustments based on experience level

Exercise explanations and form tips

User can switch between Gym and Home mode from their profile settings

Feature 3 — AI Diet Planner

Generates a full-day meal plan aligned to the user's calorie and protein goals, dietary preference, allergies, and monthly food budget.

Inputs | Outputs

Calorie & protein targets | Breakfast, lunch, dinner + snacks

Food preference (veg / non-veg) | Daily protein estimate per meal

Allergies / intolerances | Total calorie estimate

Monthly budget (INR) | Affordable, locally available ingredients

Inputs

Outputs

Calorie & protein targets

Breakfast, lunch, dinner + snacks

Food preference (veg / non-veg)

Daily protein estimate per meal

Allergies / intolerances

Total calorie estimate

Monthly budget (INR)

Affordable, locally available ingredients

Feature 4 — Ingredient-Based Recipe Generator

Users enter the ingredients available at home and the AI generates protein-rich recipes with macros and preparation steps — removing the barrier of "I don't know what to cook."

Input: list of available ingredients

Output: recipe name, protein / calorie estimate, step-by-step instructions

Prioritises high-protein combinations

Supports vegetarian and non-vegetarian ingredient sets

Feature 5 — Progress Tracking

Users log daily workouts, body weight, and measurements. The AI analyses trends and suggests adjustments to keep them on track.

Metrics: weight, workout completion, strength progression, measurements

AI-generated insights (calorie adjustments, intensity changes)

Visual progress charts (Recharts)

Weekly summary and recommendations

Feature 6 — AI Fitness Assistant Chat

A conversational AI assistant that answers any fitness or nutrition question in plain language, personalised to the user's profile.

Natural language Q&A (e.g. "Can I replace chicken with paneer?")

Context-aware — uses the user's profile and current plan

Covers workout advice, nutrition swaps, and recovery tips

6. User Stories

6.1 Onboarding

US-001  |  Priority: High

As a new user,I want to complete an onboarding form with my fitness details,So that the AI can generate a personalised workout and diet plan tailored to me.Acceptance Criteria: Onboarding collects: age, gender, height, weight, goal, activity level, experience, diet preference, budgetUser selects workout location: Gym or Home Workout (required field, step 3 of onboarding)Gym selection shows equipment checklist (barbells, cables, machines, dumbbells, etc.)Home selection shows available equipment options (dumbbells, resistance bands, no equipment)All fields are validated before submissionAI generates calorie + protein targets and an equipment-matched workout plan on completionUser is redirected to their dashboard with plans ready

US-001  |  Priority: High

As a new user,

I want to complete an onboarding form with my fitness details,

So that the AI can generate a personalised workout and diet plan tailored to me.

Acceptance Criteria: 

Onboarding collects: age, gender, height, weight, goal, activity level, experience, diet preference, budget

User selects workout location: Gym or Home Workout (required field, step 3 of onboarding)

Gym selection shows equipment checklist (barbells, cables, machines, dumbbells, etc.)

Home selection shows available equipment options (dumbbells, resistance bands, no equipment)

All fields are validated before submission

AI generates calorie + protein targets and an equipment-matched workout plan on completion

User is redirected to their dashboard with plans ready

US-002  |  Priority: Medium

As a user who made mistakes during onboarding,I want to edit my profile details at any time,So that my plans stay accurate as my situation changes.Acceptance Criteria: A 'Edit Profile' option is available in account settingsUpdating any field triggers a plan regeneration promptChanges are saved and reflected immediately in the dashboard

US-002  |  Priority: Medium

As a user who made mistakes during onboarding,

I want to edit my profile details at any time,

So that my plans stay accurate as my situation changes.

Acceptance Criteria: 

A 'Edit Profile' option is available in account settings

Updating any field triggers a plan regeneration prompt

Changes are saved and reflected immediately in the dashboard

6.2 Workout Plan

US-003  |  Priority: High

As a gym-going user,I want to select 'Gym' during onboarding and receive a 6-day gym-based workout plan,So that my plan uses gym machines and free weights and I know exactly what to train each day.Acceptance Criteria: User selects 'Gym' and checks available equipment during onboardingPlan includes 6 training days + 1 rest day using selected gym equipmentEach session shows: muscle focus, exercise list, sets, reps, rest timeExercises include compound and isolation movements (e.g. Bench Press, Cable Flyes)Plan is labelled clearly as Gym Plan on the dashboard

US-003  |  Priority: High

As a gym-going user,

I want to select 'Gym' during onboarding and receive a 6-day gym-based workout plan,

So that my plan uses gym machines and free weights and I know exactly what to train each day.

Acceptance Criteria: 

User selects 'Gym' and checks available equipment during onboarding

Plan includes 6 training days + 1 rest day using selected gym equipment

Each session shows: muscle focus, exercise list, sets, reps, rest time

Exercises include compound and isolation movements (e.g. Bench Press, Cable Flyes)

Plan is labelled clearly as Gym Plan on the dashboard

US-004  |  Priority: Medium

As a intermediate gym user,I want to regenerate my workout plan when I feel I have progressed,So that my training intensity keeps improving over time.Acceptance Criteria: A 'Regenerate Plan' button is available on the workout pageAI considers logged progress data when generating the new planPrevious plan is archived and accessible

US-004  |  Priority: Medium

As a intermediate gym user,

I want to regenerate my workout plan when I feel I have progressed,

So that my training intensity keeps improving over time.

Acceptance Criteria: 

A 'Regenerate Plan' button is available on the workout page

AI considers logged progress data when generating the new plan

Previous plan is archived and accessible

US-005  |  Priority: High

As a home workout user,I want to select 'Home Workout' during onboarding and receive a plan that uses only available home equipment,So that I can train effectively without a gym membership or access to machines.Acceptance Criteria: User selects 'Home Workout' during onboarding (step 3)Home equipment options shown: No Equipment, Dumbbells, Resistance Bands, Dumbbells + BandsPlan generated contains only exercises possible with selected equipment'No Equipment' plans contain only bodyweight exercises (push-ups, squats, lunges, etc.)Exercises include difficulty levels, descriptions, and home-friendly modificationsPlan is labelled clearly as Home Plan on the dashboard

US-005  |  Priority: High

As a home workout user,

I want to select 'Home Workout' during onboarding and receive a plan that uses only available home equipment,

So that I can train effectively without a gym membership or access to machines.

Acceptance Criteria: 

User selects 'Home Workout' during onboarding (step 3)

Home equipment options shown: No Equipment, Dumbbells, Resistance Bands, Dumbbells + Bands

Plan generated contains only exercises possible with selected equipment

'No Equipment' plans contain only bodyweight exercises (push-ups, squats, lunges, etc.)

Exercises include difficulty levels, descriptions, and home-friendly modifications

Plan is labelled clearly as Home Plan on the dashboard

US-006  |  Priority: Medium

As a user whose situation has changed,I want to switch my workout mode from Home to Gym (or vice versa) from my profile settings,So that my workout plan stays relevant if I join a gym or lose gym access.Acceptance Criteria: A 'Switch Workout Mode' option is available in Profile SettingsSwitching mode shows the relevant equipment checklist for the new modeConfirming the switch triggers a new AI plan generationPrevious plan is archived and viewableDashboard label updates to reflect the new mode (Gym Plan / Home Plan)

US-006  |  Priority: Medium

As a user whose situation has changed,

I want to switch my workout mode from Home to Gym (or vice versa) from my profile settings,

So that my workout plan stays relevant if I join a gym or lose gym access.

Acceptance Criteria: 

A 'Switch Workout Mode' option is available in Profile Settings

Switching mode shows the relevant equipment checklist for the new mode

Confirming the switch triggers a new AI plan generation

Previous plan is archived and viewable

Dashboard label updates to reflect the new mode (Gym Plan / Home Plan)

6.3 Diet Planning

US-007  |  Priority: High

As a budget-conscious user,I want to get a full-day meal plan that fits my monthly food budget,So that I can eat well and hit my protein goals without overspending.Acceptance Criteria: Meal plan includes breakfast, lunch, dinner, and 1-2 snacksEach meal shows estimated protein and caloriesIngredients are affordable and locally availableTotal daily cost estimate is shown

US-007  |  Priority: High

As a budget-conscious user,

I want to get a full-day meal plan that fits my monthly food budget,

So that I can eat well and hit my protein goals without overspending.

Acceptance Criteria: 

Meal plan includes breakfast, lunch, dinner, and 1-2 snacks

Each meal shows estimated protein and calories

Ingredients are affordable and locally available

Total daily cost estimate is shown

US-008  |  Priority: High

As a vegetarian fitness user,I want to receive a high-protein vegetarian diet plan,So that I can meet my muscle-building goals without eating meat.Acceptance Criteria: Vegetarian preference selected during onboarding excludes all meat/fishProtein sources include: paneer, curd, lentils, eggs, tofu, soyPlan meets the user's daily protein target

US-008  |  Priority: High

As a vegetarian fitness user,

I want to receive a high-protein vegetarian diet plan,

So that I can meet my muscle-building goals without eating meat.

Acceptance Criteria: 

Vegetarian preference selected during onboarding excludes all meat/fish

Protein sources include: paneer, curd, lentils, eggs, tofu, soy

Plan meets the user's daily protein target

6.4 Recipe Generation

US-009  |  Priority: High

As a user with limited groceries,I want to enter ingredients I have at home and get a protein-rich recipe,So that I can cook a nutritious meal without going grocery shopping.Acceptance Criteria: Ingredient input field accepts a comma-separated or line-by-line listAI generates at least one recipe using available ingredientsOutput includes: recipe name, macro estimate (protein/cals), step-by-step instructionsMinimum of one recipe achieves 20g+ protein

US-009  |  Priority: High

As a user with limited groceries,

I want to enter ingredients I have at home and get a protein-rich recipe,

So that I can cook a nutritious meal without going grocery shopping.

Acceptance Criteria: 

Ingredient input field accepts a comma-separated or line-by-line list

AI generates at least one recipe using available ingredients

Output includes: recipe name, macro estimate (protein/cals), step-by-step instructions

Minimum of one recipe achieves 20g+ protein

6.5 Progress Tracking

US-010  |  Priority: High

As a user tracking weight loss,I want to log my weight daily and see a visual trend over time,So that I can monitor whether I am making progress toward my goal.Acceptance Criteria: Daily weight log is accessible from the dashboardA line chart visualises weight history over the past 30 / 90 daysAI shows a trend summary (e.g. 'Down 1.2 kg in 2 weeks')

US-010  |  Priority: High

As a user tracking weight loss,

I want to log my weight daily and see a visual trend over time,

So that I can monitor whether I am making progress toward my goal.

Acceptance Criteria: 

Daily weight log is accessible from the dashboard

A line chart visualises weight history over the past 30 / 90 days

AI shows a trend summary (e.g. 'Down 1.2 kg in 2 weeks')

US-011  |  Priority: Medium

As a consistent gym-goer,I want to mark workouts as complete and track my weekly consistency,So that I stay accountable and build a habit.Acceptance Criteria: Each workout session has a 'Mark as Done' buttonWeekly consistency percentage is shown on the dashboardAI provides a motivational insight if consistency drops below 60%

US-011  |  Priority: Medium

As a consistent gym-goer,

I want to mark workouts as complete and track my weekly consistency,

So that I stay accountable and build a habit.

Acceptance Criteria: 

Each workout session has a 'Mark as Done' button

Weekly consistency percentage is shown on the dashboard

AI provides a motivational insight if consistency drops below 60%

6.6 AI Chat Assistant

US-012  |  Priority: High

As a user with a quick nutrition question,I want to ask the AI assistant a fitness or nutrition question in plain English,So that I get an instant, personalised answer without searching online.Acceptance Criteria: Chat interface is accessible from any screen via a persistent buttonAI uses the user's profile and current plan as contextResponses are delivered within 3 secondsConversation history is retained within the session

US-012  |  Priority: High

As a user with a quick nutrition question,

I want to ask the AI assistant a fitness or nutrition question in plain English,

So that I get an instant, personalised answer without searching online.

Acceptance Criteria: 

Chat interface is accessible from any screen via a persistent button

AI uses the user's profile and current plan as context

Responses are delivered within 3 seconds

Conversation history is retained within the session

US-013  |  Priority: Medium

As a user uncertain about food swaps,I want to ask the AI 'Can I replace chicken with paneer?' and get a clear answer,So that I can adapt my diet plan to what I have available.Acceptance Criteria: AI recognises food substitution questionsResponse includes macro comparison for the swapAI confirms if the swap meets daily protein targets

US-013  |  Priority: Medium

As a user uncertain about food swaps,

I want to ask the AI 'Can I replace chicken with paneer?' and get a clear answer,

So that I can adapt my diet plan to what I have available.

Acceptance Criteria: 

AI recognises food substitution questions

Response includes macro comparison for the swap

AI confirms if the swap meets daily protein targets

6.7 Authentication

US-014  |  Priority: High

As a new user,I want to sign up with my email or Google account quickly,So that I can start using FitCopilot AI without friction.Acceptance Criteria: Sign-up supports email/password and Google OAuth (Firebase Auth)Email verification is sent on registrationNew users are redirected to onboarding immediately after sign-up

US-014  |  Priority: High

As a new user,

I want to sign up with my email or Google account quickly,

So that I can start using FitCopilot AI without friction.

Acceptance Criteria: 

Sign-up supports email/password and Google OAuth (Firebase Auth)

Email verification is sent on registration

New users are redirected to onboarding immediately after sign-up

7. User Flow

Step | Action

1 — Sign Up | User creates account via email or Google OAuth

2 — Onboarding | User enters fitness profile (goal, budget, diet, equipment)

3 — Plan Generation | AI generates personalised workout + diet plans

4 — Daily Usage | User tracks workouts, logs weight, uses recipe generator

5 — Chat Assistance | User asks the AI assistant questions as they arise

6 — Adaptive Updates | AI refines plans based on logged progress over time

Step

Action

1 — Sign Up

User creates account via email or Google OAuth

2 — Onboarding

User enters fitness profile (goal, budget, diet, equipment)

3 — Plan Generation

AI generates personalised workout + diet plans

4 — Daily Usage

User tracks workouts, logs weight, uses recipe generator

5 — Chat Assistance

User asks the AI assistant questions as they arise

6 — Adaptive Updates

AI refines plans based on logged progress over time

8. Functional Requirements

Module | Requirements

Authentication | Email/password sign-up + login; Google OAuth; secure sessions via Firebase Auth; password reset flow

Onboarding | Multi-step form; field validation; persists data to PostgreSQL; triggers AI plan generation on completion

Workout Module | Generate 6-day AI workout plan; save plan to DB; view plan by day; regenerate plan; archive previous plans

Nutrition Module | Generate full-day meal plan with macros; ingredient-based recipe generation; display protein & calorie estimates

Progress Module | Daily weight logging; workout completion toggle; line chart history; AI weekly summary

AI Chat | Persistent chat interface; context-aware responses using user profile; session conversation history

Module

Requirements

Authentication

Email/password sign-up + login; Google OAuth; secure sessions via Firebase Auth; password reset flow

Onboarding

Multi-step form; field validation; persists data to PostgreSQL; triggers AI plan generation on completion

Workout Module

Generate 6-day AI workout plan; save plan to DB; view plan by day; regenerate plan; archive previous plans

Nutrition Module

Generate full-day meal plan with macros; ingredient-based recipe generation; display protein & calorie estimates

Progress Module

Daily weight logging; workout completion toggle; line chart history; AI weekly summary

AI Chat

Persistent chat interface; context-aware responses using user profile; session conversation history

9. Non-Functional Requirements

Responsive UI — works on mobile, tablet, and desktop

AI response time — Gemini API calls complete within 3 seconds

Secure data storage — passwords hashed; user data stored in PostgreSQL with proper access controls

Scalable backend — FastAPI with async endpoints to handle concurrent users

Accessibility — minimum WCAG 2.1 AA compliance

10. Tech Stack

Layer | Technology

Frontend | Next.js (React framework, SSR/SSG)

Backend | FastAPI (Python, async REST API)

AI Model | Google Gemini API

Database | PostgreSQL

Authentication | Firebase Auth (email + Google OAuth)

Charts & Visualisations | Recharts

Hosting (planned) | Vercel (frontend) + Railway / Render (backend)

Layer

Technology

Frontend

Next.js (React framework, SSR/SSG)

Backend

FastAPI (Python, async REST API)

AI Model

Google Gemini API

Database

PostgreSQL

Authentication

Firebase Auth (email + Google OAuth)

Charts & Visualisations

Recharts

Hosting (planned)

Vercel (frontend) + Railway / Render (backend)

11. Database Design

Table | Key Columns

users | id, name, email, age, gender, height, weight, goal, activity_level, diet_preference, budget, equipment

workout_plans | id, user_id, split_type, exercises (JSON), sets, reps, created_at

diet_plans | id, user_id, meals (JSON), protein_total, calorie_total, created_at

progress_logs | id, user_id, weight, workout_completed (bool), date

recipes | id, user_id, ingredients (JSON), macros (JSON), instructions (JSON), created_at

Table

Key Columns

users

id, name, email, age, gender, height, weight, goal, activity_level, diet_preference, budget, equipment

workout_plans

id, user_id, split_type, exercises (JSON), sets, reps, created_at

diet_plans

id, user_id, meals (JSON), protein_total, calorie_total, created_at

progress_logs

id, user_id, weight, workout_completed (bool), date

recipes

id, user_id, ingredients (JSON), macros (JSON), instructions (JSON), created_at

12. MVP Scope

Included in MVP

User authentication (email + Google OAuth)

Onboarding flow with AI plan generation

AI workout plan generator (6-day split)

AI diet planner (full-day meal plan with macros)

Ingredient-based recipe generator

Progress tracking (weight log + workout completion)

AI fitness assistant chat

Excluded from MVP

Wearable device integrations

AI pose detection / video trainer

Social / community features

Payment / subscription system

Barcode calorie scanner

13. Future Roadmap

Feature | Description

AI Pose Correction | Use device camera to detect and correct exercise form in real time

Barcode Calorie Scanner | Scan packaged food to auto-log nutritional data

Wearable Integration | Sync with Fitbit / Mi Band for automatic activity tracking

AI Voice Coach | Audio-guided workout sessions with real-time instruction

Meal Photo Analysis | Upload a photo of a meal to estimate its macros

Community Features | Forums, fitness challenges, leaderboards

Premium Subscription | Unlimited AI generations, advanced analytics, premium recipes

Feature

Description

AI Pose Correction

Use device camera to detect and correct exercise form in real time

Barcode Calorie Scanner

Scan packaged food to auto-log nutritional data

Wearable Integration

Sync with Fitbit / Mi Band for automatic activity tracking

AI Voice Coach

Audio-guided workout sessions with real-time instruction

Meal Photo Analysis

Upload a photo of a meal to estimate its macros

Community Features

Forums, fitness challenges, leaderboards

Premium Subscription

Unlimited AI generations, advanced analytics, premium recipes

14. Risks & Mitigations

Risk | Mitigation

Inaccurate nutrition estimates from AI | Add disclaimer; encourage user to consult a nutritionist for medical needs

Unrealistic user expectations | Set clear onboarding expectations; show estimated timelines for goals

Inconsistent user tracking | Streak and reminder system; simple 1-tap daily log

AI-generated unsafe exercise advice | Constrain prompts to safe, standard exercises; include form notes

Gemini API rate limits / downtime | Implement retry logic and graceful error messages

Risk

Mitigation

Inaccurate nutrition estimates from AI

Add disclaimer; encourage user to consult a nutritionist for medical needs

Unrealistic user expectations

Set clear onboarding expectations; show estimated timelines for goals

Inconsistent user tracking

Streak and reminder system; simple 1-tap daily log

AI-generated unsafe exercise advice

Constrain prompts to safe, standard exercises; include form notes

Gemini API rate limits / downtime

Implement retry logic and graceful error messages

15. Success Metrics

Daily Active Users (DAU) — target 100 DAU within 3 months of launch

Workout Completion Rate — target 60%+ of generated plans completed weekly

Recipe Generator Usage — target 3+ recipe generations per active user per week

User Retention — target 40% Week-4 retention

AI Chat Engagement — average 5+ messages per session

16. Monetisation (Post-MVP)

Tier | Features

Free | 5 AI plan generations / month; basic workout plans; 7-day progress history; standard chat

Premium | Unlimited AI plan generations; advanced progress analytics; premium recipes; priority chat; personalised weekly insights

Tier

Features

Free

5 AI plan generations / month; basic workout plans; 7-day progress history; standard chat

Premium

Unlimited AI plan generations; advanced progress analytics; premium recipes; priority chat; personalised weekly insights

End of Document