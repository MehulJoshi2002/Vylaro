import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Date, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # Firebase UID or Custom Dev UID
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    goal = Column(String, nullable=True) # lose / gain / maintain
    activity_level = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    diet_preference = Column(String, nullable=True) # veg / non-veg
    budget = Column(Float, nullable=True) # in INR
    workout_location = Column(String, nullable=True) # Gym / Home Workout
    equipment = Column(JSON, nullable=True) # list of strings
    
    calorie_target = Column(Integer, nullable=True)
    protein_target = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    workout_plans = relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan")
    diet_plans = relationship("DietPlan", back_populates="user", cascade="all, delete-orphan")
    progress_logs = relationship("ProgressLog", back_populates="user", cascade="all, delete-orphan")
    recipes = relationship("Recipe", back_populates="user", cascade="all, delete-orphan")
    progress_photos = relationship("ProgressPhoto", back_populates="user", cascade="all, delete-orphan")
    workout_logs = relationship("WorkoutLog", back_populates="user", cascade="all, delete-orphan")


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    split_type = Column(String, nullable=False) # Gym Plan / Home Plan
    exercises = Column(JSON, nullable=False) # JSON structure containing the 6-day split details
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="workout_plans")


class DietPlan(Base):
    __tablename__ = "diet_plans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    meals = Column(JSON, nullable=False) # breakfast, lunch, dinner, snacks
    protein_total = Column(Integer, nullable=False)
    calorie_total = Column(Integer, nullable=False)
    cost_total = Column(Float, nullable=True) # Daily cost estimate in INR
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="diet_plans")


class ProgressLog(Base):
    __tablename__ = "progress_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    weight = Column(Float, nullable=True)
    workout_completed = Column(Boolean, default=False)
    date = Column(Date, default=datetime.date.today)

    user = relationship("User", back_populates="progress_logs")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    ingredients = Column(JSON, nullable=False) # list of inputs
    macros = Column(JSON, nullable=False) # protein, carbs, fats, calories
    instructions = Column(JSON, nullable=False) # step-by-step list
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="recipes")


class ProgressPhoto(Base):
    __tablename__ = "progress_photos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    image_data = Column(Text, nullable=False)  # base64 encoded image
    note = Column(String, nullable=True)
    date = Column(Date, default=datetime.date.today)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="progress_photos")


class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, default=datetime.date.today)
    exercise_name = Column(String, nullable=False)
    sets_done = Column(Integer, nullable=True)
    reps_done = Column(String, nullable=True)   # e.g. "10, 10, 8" or "12"
    weight_kg = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="workout_logs")
