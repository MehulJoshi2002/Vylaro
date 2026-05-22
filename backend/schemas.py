from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, date as dt_date

# Auth Schemas
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    name: Optional[str] = None
    email: str

# User Schemas
class UserOnboarding(BaseModel):
    age: int
    gender: str
    height: float # in cm
    weight: float # in kg
    goal: str # lose / gain / maintain
    activity_level: str # sedentary, light, moderate, active, very_active
    experience: str # beginner, intermediate, advanced
    diet_preference: str # veg / non-veg
    budget: float # monthly food budget in INR
    workout_location: str # Gym / Home Workout
    equipment: List[str] # Checked equipment

class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    goal: Optional[str] = None
    activity_level: Optional[str] = None
    experience: Optional[str] = None
    diet_preference: Optional[str] = None
    budget: Optional[float] = None
    workout_location: Optional[str] = None
    equipment: Optional[List[str]] = None

class UserResponse(BaseModel):
    id: str
    name: Optional[str] = None
    email: str
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    goal: Optional[str] = None
    activity_level: Optional[str] = None
    experience: Optional[str] = None
    diet_preference: Optional[str] = None
    budget: Optional[float] = None
    workout_location: Optional[str] = None
    equipment: Optional[List[str]] = None
    calorie_target: Optional[int] = None
    protein_target: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Workout schemas
class WorkoutPlanResponse(BaseModel):
    id: int
    user_id: str
    split_type: str
    exercises: Dict[str, Any] # Monday - Sunday schedule with exercises
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Diet schemas
class DietPlanResponse(BaseModel):
    id: int
    user_id: str
    meals: Dict[str, Any] # Breakfast, Lunch, Dinner, Snacks list
    protein_total: int
    calorie_total: int
    cost_total: Optional[float] = None
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Recipe schemas
class RecipeRequest(BaseModel):
    ingredients: List[str]

class RecipeResponse(BaseModel):
    id: int
    name: str
    ingredients: List[str]
    macros: Dict[str, Any]
    instructions: List[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Progress schemas
class ProgressLogCreate(BaseModel):
    weight: Optional[float] = None
    workout_completed: Optional[bool] = None
    date: Optional[dt_date] = None

class ProgressLogResponse(BaseModel):
    id: int
    user_id: str
    weight: Optional[float] = None
    workout_completed: bool
    date: dt_date

    class Config:
        from_attributes = True

# Progress Photo schemas
class ProgressPhotoCreate(BaseModel):
    image_data: str   # base64 encoded
    note: Optional[str] = None
    date: Optional[dt_date] = None

class ProgressPhotoResponse(BaseModel):
    id: int
    image_data: str
    note: Optional[str] = None
    date: dt_date
    created_at: datetime

    class Config:
        from_attributes = True

# Workout Log schemas
class WorkoutLogCreate(BaseModel):
    exercise_name: str
    sets_done: Optional[int] = None
    reps_done: Optional[str] = None
    weight_kg: Optional[float] = None
    notes: Optional[str] = None
    date: Optional[dt_date] = None

class WorkoutLogResponse(BaseModel):
    id: int
    exercise_name: str
    sets_done: Optional[int] = None
    reps_done: Optional[str] = None
    weight_kg: Optional[float] = None
    notes: Optional[str] = None
    date: dt_date
    created_at: datetime

    class Config:
        from_attributes = True

# Chat schemas
class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = [] # list of {"role": "user"|"model", "parts"|"content": "..."}
