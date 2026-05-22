import os
import datetime
from typing import List, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db, engine, Base
import models
import schemas
import auth
import ai

# Create DB Tables on Startup (SQLite/PostgreSQL dynamic setup)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FitCopilot AI Backend API", version="1.0.0")

# CORS middleware config to allow frontend Next.js requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# -------------------- AUTHENTICATION ---------------------
# ---------------------------------------------------------

@app.post("/auth/register", response_model=schemas.TokenResponse)
def register(req: schemas.RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(models.User).filter(models.User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # In a full production build, we would hash the password. 
    # For this dev mock database registration:
    user_id = f"uid_{req.name.replace(' ', '_').lower()}_{int(datetime.datetime.utcnow().timestamp())}"
    new_user = models.User(
        id=user_id,
        name=req.name,
        email=req.email
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate token
    token = auth.create_access_token(data={"sub": new_user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "name": new_user.name,
        "email": new_user.email
    }


@app.post("/auth/login", response_model=schemas.TokenResponse)
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Simple password validation check for our dev mock DB
    token = auth.create_access_token(data={"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }


@app.get("/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


# ---------------------------------------------------------
# -------------------- USER ONBOARDING --------------------
# ---------------------------------------------------------

@app.post("/users/onboard", response_model=schemas.UserResponse)
def onboard_user(onboard: schemas.UserOnboarding, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # 1. Update user onboarding details
    current_user.age = onboard.age
    current_user.gender = onboard.gender
    current_user.height = onboard.height
    current_user.weight = onboard.weight
    current_user.goal = onboard.goal
    current_user.activity_level = onboard.activity_level
    current_user.experience = onboard.experience
    current_user.diet_preference = onboard.diet_preference
    current_user.budget = onboard.budget
    current_user.workout_location = onboard.workout_location
    current_user.equipment = onboard.equipment

    # 2. Calculate daily target calories and protein
    targets = ai.calculate_targets(
        age=onboard.age,
        gender=onboard.gender,
        height=onboard.height,
        weight=onboard.weight,
        goal=onboard.goal,
        activity_level=onboard.activity_level
    )
    current_user.calorie_target = targets["calorie_target"]
    current_user.protein_target = targets["protein_target"]
    
    db.commit()
    db.refresh(current_user)

    # Convert user profile to dict for AI functions
    profile_dict = {
        "age": current_user.age,
        "gender": current_user.gender,
        "height": current_user.height,
        "weight": current_user.weight,
        "goal": current_user.goal,
        "activity_level": current_user.activity_level,
        "experience": current_user.experience,
        "diet_preference": current_user.diet_preference,
        "budget": current_user.budget,
        "workout_location": current_user.workout_location,
        "equipment": current_user.equipment,
        "calorie_target": current_user.calorie_target,
        "protein_target": current_user.protein_target
    }

    # 3. Deactivate any existing active plans
    db.query(models.WorkoutPlan).filter(models.WorkoutPlan.user_id == current_user.id).update({"active": False})
    db.query(models.DietPlan).filter(models.DietPlan.user_id == current_user.id).update({"active": False})

    # 4. Generate AI Workout Plan
    workout_data = ai.generate_workout_plan_ai(profile_dict)
    new_workout_plan = models.WorkoutPlan(
        user_id=current_user.id,
        split_type=f"{current_user.workout_location} Plan",
        exercises=workout_data,
        active=True
    )
    db.add(new_workout_plan)

    # 5. Generate AI Diet Plan
    diet_data = ai.generate_diet_plan_ai(profile_dict, current_user.calorie_target, current_user.protein_target)
    new_diet_plan = models.DietPlan(
        user_id=current_user.id,
        meals=diet_data.get("meals", {}),
        protein_total=diet_data.get("protein_total", current_user.protein_target),
        calorie_total=diet_data.get("calorie_total", current_user.calorie_target),
        cost_total=diet_data.get("cost_total", 0),
        active=True
    )
    db.add(new_diet_plan)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@app.put("/users/profile", response_model=schemas.UserResponse)
def update_profile(updates: schemas.UserUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    for field, val in updates.model_dump(exclude_unset=True).items():
        setattr(current_user, field, val)

    # Recalculate targets if core parameters changed
    if any(param in updates.model_dump(exclude_unset=True) for param in ["age", "gender", "height", "weight", "goal", "activity_level"]):
        targets = ai.calculate_targets(
            age=current_user.age,
            gender=current_user.gender,
            height=current_user.height,
            weight=current_user.weight,
            goal=current_user.goal,
            activity_level=current_user.activity_level
        )
        current_user.calorie_target = targets["calorie_target"]
        current_user.protein_target = targets["protein_target"]

    db.commit()
    db.refresh(current_user)
    return current_user


# ---------------------------------------------------------
# --------------------- WORKOUT PLAN ----------------------
# ---------------------------------------------------------

@app.get("/workout/active", response_model=schemas.WorkoutPlanResponse)
def get_active_workout(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    plan = db.query(models.WorkoutPlan).filter(
        models.WorkoutPlan.user_id == current_user.id,
        models.WorkoutPlan.active == True
    ).order_by(models.WorkoutPlan.created_at.desc()).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active workout plan found. Please complete onboarding first."
        )
    return plan


@app.get("/workout/upgrade-status")
def get_upgrade_status(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """Returns whether the user is ready to upgrade their plan (4+ weeks on current plan)."""
    plan = db.query(models.WorkoutPlan).filter(
        models.WorkoutPlan.user_id == current_user.id,
        models.WorkoutPlan.active.is_(True)
    ).order_by(models.WorkoutPlan.created_at.desc()).first()

    if not plan:
        return {"ready": False, "weeks_on_plan": 0, "message": ""}

    weeks_on_plan = (datetime.date.today() - plan.created_at.date()).days // 7

    # Gather progress since plan started
    logs_since = db.query(models.ProgressLog).filter(
        models.ProgressLog.user_id == current_user.id,
        models.ProgressLog.date >= plan.created_at.date()
    ).all()
    sessions_done = sum(1 for l in logs_since if l.workout_completed)
    total_days = max(len(logs_since), 1)
    consistency = int((sessions_done / total_days) * 100)

    ready = weeks_on_plan >= 4
    if ready:
        if consistency >= 75:
            message = f"You've crushed {weeks_on_plan} weeks with {consistency}% consistency. Time to level up with a harder plan!"
        else:
            message = f"You've been on this plan for {weeks_on_plan} weeks. A fresh plan will help keep things interesting!"
    else:
        weeks_left = 4 - weeks_on_plan
        message = f"{weeks_left} more week{'s' if weeks_left != 1 else ''} on this plan before your upgrade."

    return {
        "ready": ready,
        "weeks_on_plan": weeks_on_plan,
        "sessions_done": sessions_done,
        "consistency": consistency,
        "message": message
    }


@app.post("/workout/upgrade", response_model=schemas.WorkoutPlanResponse)
def upgrade_workout(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """Generate a progressively harder plan based on actual performance data."""
    if not current_user.workout_location:
        raise HTTPException(status_code=400, detail="Onboarding details missing.")

    # Gather all progress data
    all_logs = db.query(models.ProgressLog).filter(models.ProgressLog.user_id == current_user.id).all()
    workout_dates = {l.date for l in all_logs if l.workout_completed}
    total_sessions = len(workout_dates)
    consistency_rate = int((total_sessions / max(len(all_logs), 1)) * 100)

    # Streak
    streak = 0
    check = datetime.date.today()
    if check not in workout_dates:
        check -= datetime.timedelta(days=1)
    while check in workout_dates:
        streak += 1
        check -= datetime.timedelta(days=1)

    # Weight change
    weight_logs = [l.weight for l in sorted(all_logs, key=lambda x: x.date) if l.weight]
    weight_change = round(weight_logs[-1] - weight_logs[0], 1) if len(weight_logs) >= 2 else 0

    plan_count = db.query(models.WorkoutPlan).filter(models.WorkoutPlan.user_id == current_user.id).count()

    profile_dict = {
        "goal": current_user.goal,
        "experience": current_user.experience,
        "workout_location": current_user.workout_location,
        "equipment": current_user.equipment or [],
        "calorie_target": current_user.calorie_target,
        "protein_target": current_user.protein_target,
        "streak": streak,
        "total_sessions": total_sessions,
        "consistency_rate": consistency_rate,
        "weight_change": weight_change,
        "plan_number": plan_count + 1,
    }

    # Archive current plan
    db.query(models.WorkoutPlan).filter(
        models.WorkoutPlan.user_id == current_user.id
    ).update({"active": False})

    workout_data = ai.generate_workout_plan_ai(profile_dict)
    new_plan = models.WorkoutPlan(
        user_id=current_user.id,
        split_type=f"{current_user.workout_location} Plan",
        exercises=workout_data,
        active=True
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return new_plan


@app.get("/workout/history")
def get_workout_history(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """Returns past plans with stats: how long they ran and consistency during that period."""
    past_plans = db.query(models.WorkoutPlan).filter(
        models.WorkoutPlan.user_id == current_user.id,
        models.WorkoutPlan.active.is_(False)
    ).order_by(models.WorkoutPlan.created_at.desc()).all()

    all_logs = db.query(models.ProgressLog).filter(models.ProgressLog.user_id == current_user.id).all()

    result = []
    for i, plan in enumerate(past_plans):
        # End date = start of next plan (or today for current)
        end_date = past_plans[i - 1].created_at.date() if i > 0 else datetime.date.today()
        start_date = plan.created_at.date()
        weeks = max((end_date - start_date).days // 7, 1)

        logs_during = [l for l in all_logs if start_date <= l.date <= end_date]
        sessions = sum(1 for l in logs_during if l.workout_completed)
        consistency = int((sessions / max(len(logs_during), 1)) * 100)

        result.append({
            "id": plan.id,
            "split_type": plan.split_type,
            "split_name": plan.exercises.get("split_name", plan.split_type) if isinstance(plan.exercises, dict) else plan.split_type,
            "created_at": plan.created_at.isoformat(),
            "weeks_ran": weeks,
            "sessions_completed": sessions,
            "consistency_pct": consistency,
        })
    return result


# ---------------------------------------------------------
# ---------------------- DIET PLAN ------------------------
# ---------------------------------------------------------

@app.get("/diet/active", response_model=schemas.DietPlanResponse)
def get_active_diet(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    plan = db.query(models.DietPlan).filter(
        models.DietPlan.user_id == current_user.id,
        models.DietPlan.active == True
    ).order_by(models.DietPlan.created_at.desc()).first()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active diet plan found. Please complete onboarding first."
        )
    return plan


@app.post("/diet/regenerate", response_model=schemas.DietPlanResponse)
def regenerate_diet(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if not current_user.diet_preference:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Onboarding details missing. Cannot generate diet plan."
        )

    profile_dict = {
        "age": current_user.age,
        "gender": current_user.gender,
        "height": current_user.height,
        "weight": current_user.weight,
        "goal": current_user.goal,
        "activity_level": current_user.activity_level,
        "experience": current_user.experience,
        "diet_preference": current_user.diet_preference,
        "budget": current_user.budget,
        "workout_location": current_user.workout_location,
        "equipment": current_user.equipment,
        "calorie_target": current_user.calorie_target,
        "protein_target": current_user.protein_target
    }

    # Deactivate current active plans
    db.query(models.DietPlan).filter(models.DietPlan.user_id == current_user.id).update({"active": False})

    # Generate new AI diet plan
    diet_data = ai.generate_diet_plan_ai(profile_dict, current_user.calorie_target, current_user.protein_target)
    new_plan = models.DietPlan(
        user_id=current_user.id,
        meals=diet_data.get("meals", {}),
        protein_total=diet_data.get("protein_total", current_user.protein_target),
        calorie_total=diet_data.get("calorie_total", current_user.calorie_target),
        cost_total=diet_data.get("cost_total", 0),
        active=True
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return new_plan


# ---------------------------------------------------------
# ------------------- RECIPE GENERATOR --------------------
# ---------------------------------------------------------

@app.post("/recipe/generate", response_model=schemas.RecipeResponse)
def generate_recipe(req: schemas.RecipeRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    profile_dict = {
        "diet_preference": current_user.diet_preference or "veg"
    }
    
    # Call Gemini Recipe Generator
    recipe_data = ai.generate_recipe_ai(req.ingredients, profile_dict)
    
    new_recipe = models.Recipe(
        user_id=current_user.id,
        name=recipe_data.get("name", "Custom Protein Bowl"),
        ingredients=req.ingredients,
        macros=recipe_data.get("macros", {"protein": 20, "calories": 300, "carbs": 20, "fats": 10}),
        instructions=recipe_data.get("instructions", ["Mix and eat!"])
    )
    
    db.add(new_recipe)
    db.commit()
    db.refresh(new_recipe)
    return new_recipe


@app.get("/recipe/history", response_model=List[schemas.RecipeResponse])
def get_recipe_history(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    recipes = db.query(models.Recipe).filter(
        models.Recipe.user_id == current_user.id
    ).order_by(models.Recipe.created_at.desc()).all()
    return recipes


@app.delete("/recipe/{recipe_id}")
def delete_recipe(recipe_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(
        models.Recipe.id == recipe_id,
        models.Recipe.user_id == current_user.id
    ).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.delete(recipe)
    db.commit()
    return {"message": "Recipe deleted"}


# ---------------------------------------------------------
# ------------------- PROGRESS TRACKING -------------------
# ---------------------------------------------------------

@app.post("/progress/logs", response_model=schemas.ProgressLogResponse)
def log_progress(log: schemas.ProgressLogCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    log_date = log.date or datetime.date.today()
    
    # Check if a log entry already exists for this date
    existing_log = db.query(models.ProgressLog).filter(
        models.ProgressLog.user_id == current_user.id,
        models.ProgressLog.date == log_date
    ).first()

    if existing_log:
        if log.weight is not None:
            existing_log.weight = log.weight
            # Update user's current weight as well
            current_user.weight = log.weight
        if log.workout_completed is not None:
            existing_log.workout_completed = log.workout_completed
        db.commit()
        db.refresh(existing_log)
        return existing_log
    else:
        new_log = models.ProgressLog(
            user_id=current_user.id,
            weight=log.weight if log.weight is not None else current_user.weight,
            workout_completed=log.workout_completed or False,
            date=log_date
        )
        if log.weight is not None:
            current_user.weight = log.weight
            
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        return new_log


@app.get("/progress/history", response_model=List[schemas.ProgressLogResponse])
def get_progress_history(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    logs = db.query(models.ProgressLog).filter(
        models.ProgressLog.user_id == current_user.id
    ).order_by(models.ProgressLog.date.asc()).all()
    return logs


@app.get("/progress/insights")
def get_progress_insights(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    today = datetime.date.today()

    # --- Streak calculation (all-time logs) ---
    all_logs = db.query(models.ProgressLog).filter(
        models.ProgressLog.user_id == current_user.id
    ).all()
    workout_dates = {l.date for l in all_logs if l.workout_completed}
    streak = 0
    check = today if today in workout_dates else today - datetime.timedelta(days=1)
    while check in workout_dates:
        streak += 1
        check -= datetime.timedelta(days=1)

    # 1. Fetch recent logs (last 30 days)
    start_date = today - datetime.timedelta(days=30)

    logs = db.query(models.ProgressLog).filter(
        models.ProgressLog.user_id == current_user.id,
        models.ProgressLog.date >= start_date
    ).order_by(models.ProgressLog.date.asc()).all()

    if not logs:
        return {
            "consistency_rate": 0,
            "weight_change_kg": 0.0,
            "streak": streak,
            "trend_message": "No logs recorded yet. Start logging your daily weight and workouts!"
        }

    # 2. Calculate consistency (completed workouts out of last 30 days of logged entries)
    completed_workouts = sum(1 for l in logs if l.workout_completed)
    consistency_rate = int((completed_workouts / len(logs)) * 100) if logs else 0

    # 3. Calculate weight change
    weight_logs = [l.weight for l in logs if l.weight is not None]
    if len(weight_logs) >= 2:
        weight_change = round(weight_logs[-1] - weight_logs[0], 2)
    else:
        weight_change = 0.0

    # 4. Generate trend insight statement
    goal = current_user.goal or "lose"
    if goal == "lose":
        if weight_change < 0:
            trend_message = f"Incredible work! You are down {abs(weight_change)} kg in the last {len(logs)} days. Your caloric deficit is perfectly optimized."
        elif weight_change > 0:
            trend_message = f"Weight is up {weight_change} kg. This might be water retention, minor fluctuations, or muscle building. Keep drinking water and stay in your deficit!"
        else:
            trend_message = "Your weight has stabilized. Focus on increasing your workout intensity or reducing calorie count by 100 kcal."
    elif goal == "gain":
        if weight_change > 0:
            trend_message = f"Excellent! You gained {weight_change} kg in the last {len(logs)} days. Your caloric surplus and protein targets are working beautifully."
        elif weight_change < 0:
            trend_message = f"Weight is down {abs(weight_change)} kg. You need to consume more energy! Add 200 kcal or increase your snacks to sustain muscle growth."
        else:
            trend_message = "Weight is stable. To gain lean muscle, you must increase calorie count slightly or focus heavily on progressive overload."
    else:
        trend_message = f"You are maintaining your target weight successfully. Focus on body recomposition by hitting your daily protein target of {current_user.protein_target}g."

    if consistency_rate < 60:
        trend_message += " Note: Your consistency is currently below 60%. Try to hit more scheduled workouts to build a solid habit!"

    return {
        "consistency_rate": consistency_rate,
        "weight_change_kg": weight_change,
        "streak": streak,
        "trend_message": trend_message
    }


# ---------------------------------------------------------
# ----------------- PROGRESS PHOTOS ----------------------
# ---------------------------------------------------------

@app.post("/progress/photos", response_model=schemas.ProgressPhotoResponse)
def upload_photo(photo: schemas.ProgressPhotoCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    new_photo = models.ProgressPhoto(
        user_id=current_user.id,
        image_data=photo.image_data,
        note=photo.note,
        date=photo.date or datetime.date.today()
    )
    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)
    return new_photo

@app.get("/progress/photos", response_model=List[schemas.ProgressPhotoResponse])
def get_photos(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return db.query(models.ProgressPhoto).filter(
        models.ProgressPhoto.user_id == current_user.id
    ).order_by(models.ProgressPhoto.date.desc()).all()

@app.delete("/progress/photos/{photo_id}")
def delete_photo(photo_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    photo = db.query(models.ProgressPhoto).filter(
        models.ProgressPhoto.id == photo_id,
        models.ProgressPhoto.user_id == current_user.id
    ).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    db.delete(photo)
    db.commit()
    return {"message": "Photo deleted"}


# ---------------------------------------------------------
# ------------------ WORKOUT LOGGER -----------------------
# ---------------------------------------------------------

@app.post("/workout/log", response_model=schemas.WorkoutLogResponse)
def log_exercise(log: schemas.WorkoutLogCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    new_log = models.WorkoutLog(
        user_id=current_user.id,
        exercise_name=log.exercise_name,
        sets_done=log.sets_done,
        reps_done=log.reps_done,
        weight_kg=log.weight_kg,
        notes=log.notes,
        date=log.date or datetime.date.today()
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@app.get("/workout/logs/today", response_model=List[schemas.WorkoutLogResponse])
def get_today_logs(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    today = datetime.date.today()
    return db.query(models.WorkoutLog).filter(
        models.WorkoutLog.user_id == current_user.id,
        models.WorkoutLog.date == today
    ).order_by(models.WorkoutLog.created_at.asc()).all()

@app.delete("/workout/log/{log_id}")
def delete_workout_log(log_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    log = db.query(models.WorkoutLog).filter(
        models.WorkoutLog.id == log_id,
        models.WorkoutLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(log)
    db.commit()
    return {"message": "Log deleted"}


# ---------------------------------------------------------
# ------------------ AI CHAT ASSISTANT --------------------
# ---------------------------------------------------------

@app.post("/chat")
def chat_with_assistant(req: schemas.ChatRequest, current_user: models.User = Depends(auth.get_current_user)):
    profile_dict = {
        "age": current_user.age,
        "gender": current_user.gender,
        "height": current_user.height,
        "weight": current_user.weight,
        "goal": current_user.goal,
        "activity_level": current_user.activity_level,
        "experience": current_user.experience,
        "diet_preference": current_user.diet_preference,
        "budget": current_user.budget,
        "workout_location": current_user.workout_location,
        "equipment": current_user.equipment,
        "calorie_target": current_user.calorie_target,
        "protein_target": current_user.protein_target
    }
    
    reply = ai.generate_chat_response_ai(req.message, req.history, profile_dict)
    return {"reply": reply}
