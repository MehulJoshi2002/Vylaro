import os
import json
import logging
from typing import Dict, Any, List
from google import genai
from google.genai import types as genai_types

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-2.5-flash"

# Initialize Gemini
is_gemini_active = False
gemini_client = None
if GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        is_gemini_active = True
        logger.info("Gemini AI successfully initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini AI: {e}")

# Core fitness calculations (Harris-Benedict Equation)
def calculate_targets(age: int, gender: str, height: float, weight: float, goal: str, activity_level: str) -> Dict[str, int]:
    # Calculate BMR (Mifflin-St Jeor)
    if gender.lower() == "male":
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161

    # Activity level multiplier
    multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9
    }
    multiplier = multipliers.get(activity_level.lower(), 1.2)
    tdee = int(bmr * multiplier)

    # Goal adjustments
    if goal.lower() == "lose":
        calorie_target = int(tdee - 500)
        protein_target = int(weight * 2.0) # 2.0g per kg of bodyweight
    elif goal.lower() == "gain":
        calorie_target = int(tdee + 400)
        protein_target = int(weight * 2.2) # 2.2g per kg of bodyweight
    else: # maintain
        calorie_target = tdee
        protein_target = int(weight * 1.8) # 1.8g per kg of bodyweight

    # Ensure bounds
    calorie_target = max(calorie_target, 1200)
    protein_target = max(protein_target, 40)

    return {
        "calorie_target": calorie_target,
        "protein_target": protein_target
    }

# ----------------- Workouts Generator -----------------
def generate_workout_plan_ai(user_profile: Dict[str, Any]) -> Dict[str, Any]:
    workout_location = user_profile.get("workout_location", "Gym")
    equipment = user_profile.get("equipment", [])
    experience = user_profile.get("experience", "beginner")
    goal = user_profile.get("goal", "lose")
    streak = user_profile.get("streak", 0)
    total_sessions = user_profile.get("total_sessions", 0)
    consistency_rate = user_profile.get("consistency_rate", 0)
    plan_number = user_profile.get("plan_number", 1)

    # Choose a different split style based on which plan this is
    split_variations = [
        "Push/Pull/Legs (PPL)",
        "Upper/Lower Split",
        "Arnold Split (Chest+Back / Shoulders+Arms / Legs)",
        "Bro Split (one muscle group per day)",
        "Full Body 3x per week + accessory days",
        "Antagonist Superset Split (Chest+Back, Shoulders+Arms, Legs+Core)"
    ]
    suggested_split = split_variations[(plan_number - 1) % len(split_variations)]

    # Adjust intensity based on consistency and streak
    if consistency_rate >= 80 or streak >= 7:
        intensity_note = "This user is highly consistent (80%+ consistency or 7+ day streak). Increase volume and intensity — add sets, reduce rest times, include advanced techniques like drop sets or supersets."
    elif total_sessions >= 20:
        intensity_note = "This user has completed 20+ sessions. Progress from beginner to intermediate loading — increase weight recommendations and rep ranges."
    else:
        intensity_note = "This user is still building their habit. Keep it challenging but achievable — prioritize form and consistency over maximum intensity."

    if not is_gemini_active:
        return get_mock_workout_plan(workout_location, equipment, experience, goal)

    try:
        prompt = f"""
        You are an elite, certified fitness coach generating workout plan #{plan_number} for this user.
        IMPORTANT: Use the {suggested_split} split structure — make it distinctly different from a standard Push/Pull/Legs plan.

        User profile:
        - Goal: {goal}
        - Experience Level: {experience}
        - Location: {workout_location}
        - Available Equipment: {', '.join(equipment) if equipment else 'None (bodyweight only)'}
        - Workout streak: {streak} days
        - Total sessions completed: {total_sessions}
        - Consistency rate: {consistency_rate}%

        Coaching note: {intensity_note}

        Return a JSON object conforming exactly to this structure:
        {{
            "split_name": "Name of the Split",
            "schedule": {{
                "Monday": {{
                    "focus": "Muscle group focus",
                    "exercises": [
                        {{
                            "name": "Exercise Name",
                            "sets": 4,
                            "reps": "8-12",
                            "rest": "90s",
                            "form_tip": "Brief coaching cue for form"
                        }}
                    ]
                }},
                "Tuesday": {{}},
                "Wednesday": {{}},
                "Thursday": {{}},
                "Friday": {{}},
                "Saturday": {{}},
                "Sunday": {{
                    "focus": "Rest Day",
                    "exercises": []
                }}
            }}
        }}

        Ensure all exercises are strictly restricted to the available equipment. For Home Workout with no equipment, use pure bodyweight exercises only.
        """
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=genai_types.GenerateContentConfig(response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Gemini API workout plan error: {e}. Falling back to mock plan.")
        return get_mock_workout_plan(workout_location, equipment, experience, goal)


# ----------------- Diet Generator -----------------
def generate_diet_plan_ai(user_profile: Dict[str, Any], calorie_target: int, protein_target: int) -> Dict[str, Any]:
    diet_pref = user_profile.get("diet_preference", "veg")
    budget = user_profile.get("budget", 5000)
    goal = user_profile.get("goal", "lose")
    
    # Calculate daily budget estimate (monthly budget / 30)
    daily_budget = int(budget / 30)

    if not is_gemini_active:
        return get_mock_diet_plan(diet_pref, calorie_target, protein_target, daily_budget)

    try:
        prompt = f"""
        You are an expert sports nutritionist specializing in budget meal planning.
        Generate a full-day meal plan hitting {protein_target}g protein and {calorie_target} kcal.
        Diet: {diet_pref} (if veg: NO meat/fish/chicken — use dairy, soy, eggs, paneer, lentils, whey).
        Daily budget: Rs.{daily_budget} INR. Use affordable Indian ingredients.

        Return JSON with exactly this structure:
        {{
            "calorie_total": {calorie_target},
            "protein_total": {protein_target},
            "cost_total": 150,
            "meals": {{
                "Breakfast": {{"name": "...", "protein_g": 28, "calories": 440, "ingredients": ["item (qty)", "item (qty)"], "cost_inr": 40}},
                "Lunch":     {{"name": "...", "protein_g": 42, "calories": 680, "ingredients": ["..."], "cost_inr": 70}},
                "Dinner":    {{"name": "...", "protein_g": 34, "calories": 520, "ingredients": ["..."], "cost_inr": 65}},
                "Snacks":    {{"name": "...", "protein_g": 18, "calories": 260, "ingredients": ["..."], "cost_inr": 20}}
            }}
        }}
        """
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=genai_types.GenerateContentConfig(response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Gemini API diet plan error: {e}. Falling back to mock diet plan.")
        return get_mock_diet_plan(diet_pref, calorie_target, protein_target, daily_budget)


# ----------------- Recipe Generator -----------------
def generate_recipe_ai(ingredients: List[str], user_profile: Dict[str, Any]) -> Dict[str, Any]:
    diet_pref = user_profile.get("diet_preference", "veg")

    if not is_gemini_active:
        return get_mock_recipe(ingredients, diet_pref)

    try:
        prompt = f"""
        You are a creative chef. Create a high-protein recipe (20g+ protein) using these ingredients: {', '.join(ingredients)}.
        Diet preference: {diet_pref}. You may add standard pantry staples (salt, oil, spices).

        Return JSON with exactly this structure:
        {{
            "name": "Recipe Title",
            "macros": {{"protein": 24, "calories": 350, "carbs": 15, "fats": 12}},
            "instructions": ["Step 1...", "Step 2...", "Step 3..."]
        }}
        """
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=genai_types.GenerateContentConfig(response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Gemini API recipe error: {e}. Falling back to mock recipe.")
        return get_mock_recipe(ingredients, diet_pref)


# ----------------- AI Chat Assistant -----------------
def generate_chat_response_ai(message: str, history: List[Dict[str, str]], user_profile: Dict[str, Any]) -> str:
    user_context = f"""
    You are Vylaro, a brilliant, friendly, and expert AI fitness coach.
    You are chatting with a user whose current fitness details are:
    - Age: {user_profile.get('age')} years old
    - Goal: {user_profile.get('goal')} weight
    - Weight: {user_profile.get('weight')} kg, Height: {user_profile.get('height')} cm
    - Workout Preference: {user_profile.get('workout_location')} ({', '.join(user_profile.get('equipment', [])) if user_profile.get('equipment') else 'No equipment'})
    - Diet: {user_profile.get('diet_preference')}, Monthly food budget: ₹{user_profile.get('budget')} INR.
    - Daily calorie target: {user_profile.get('calorie_target')} kcal, protein goal: {user_profile.get('protein_target')}g.

    Answer the user's questions clearly, concisely, and with high personalization. Ensure your tips are safe, practical, and highly cost-conscious. Keep responses conversational and under 4-5 sentences when possible.
    """

    if not is_gemini_active:
        return get_mock_chat_response(message, user_profile)

    try:
        # Build Gemini chat history (role must be "user" or "model")
        gemini_history = []
        for h in history:
            role = "user" if h.get("role") == "user" else "model"
            text = h.get("content") or h.get("parts") or ""
            if isinstance(text, list):
                text = text[0]
            gemini_history.append(genai_types.Content(role=role, parts=[genai_types.Part(text=str(text))]))

        chat = gemini_client.chats.create(
            model=GEMINI_MODEL,
            config=genai_types.GenerateContentConfig(system_instruction=user_context),
            history=gemini_history
        )
        response = chat.send_message(message)
        return response.text
    except Exception as e:
        logger.error(f"Gemini API chat error: {e}. Falling back to mock chat response.")
        return get_mock_chat_response(message, user_profile)


# =========================================================================
# ======================== HIGH QUALITY MOCK FALLBACKS ====================
# =========================================================================

def get_mock_workout_plan(location: str, equipment: List[str], experience: str, goal: str) -> Dict[str, Any]:
    if location.lower() == "gym":
        split_name = "Push / Pull / Legs Hypertrophy Split"
        mon_focus = "Push A (Chest, Shoulders & Triceps)"
        mon_ex = [
            {"name": "Flat Barbell Bench Press", "sets": 4, "reps": "8-10", "rest": "90s", "form_tip": "Bar path should go to mid-chest, drive feet into the floor."},
            {"name": "Incline Dumbbell Press", "sets": 3, "reps": "10-12", "rest": "90s", "form_tip": "Set incline to 30 degrees to target upper chest fibers."},
            {"name": "Seated Overhead Dumbbell Press", "sets": 3, "reps": "8-12", "rest": "90s", "form_tip": "Keep core tight, press dumbbells up straight without arching lower back."},
            {"name": "Cable Tricep Pushdowns", "sets": 3, "reps": "12-15", "rest": "60s", "form_tip": "Pin elbows to your ribs, extend fully down and squeeze triceps."}
        ]
        tue_focus = "Pull A (Back & Biceps)"
        tue_ex = [
            {"name": "Lat Pulldown (Cables)", "sets": 4, "reps": "8-12", "rest": "90s", "form_tip": "Pull bar to upper chest, squeeze shoulder blades together."},
            {"name": "One-Arm Dumbbell Rows", "sets": 3, "reps": "10-12", "rest": "60s", "form_tip": "Row dumbbell towards your hip pocket, keeping back parallel to the floor."},
            {"name": "Barbell Bicep Curls", "sets": 3, "reps": "8-12", "rest": "60s", "form_tip": "Keep elbows fixed by your side, squeeze biceps at the top."},
            {"name": "Hammer Dumbbell Curls", "sets": 3, "reps": "12-15", "rest": "60s", "form_tip": "Hold dumbbells like a hammer, curl upwards to build forearm size."}
        ]
        wed_focus = "Legs A (Quads, Hamstrings & Calves)"
        wed_ex = [
            {"name": "Barbell Back Squats", "sets": 4, "reps": "6-10", "rest": "120s", "form_tip": "Squat down until thighs are parallel to the floor, keep chest proud."},
            {"name": "Dumbbell Romanian Deadlifts", "sets": 3, "reps": "10-12", "rest": "90s", "form_tip": "Hinge at the hips, feel the stretch in your hamstrings."},
            {"name": "Leg Press Machine", "sets": 3, "reps": "12-15", "rest": "90s", "form_tip": "Place feet shoulder-width, lower slowly. Do not lock out knees."},
            {"name": "Standing Calf Raises", "sets": 4, "reps": "15-20", "rest": "60s", "form_tip": "Get a deep stretch at the bottom, drive up onto tip-toes."}
        ]
    else: # Home Workout
        split_name = "6-Day Home Push-Pull-Legs Split"
        mon_focus = "Push A (Chest, Shoulders & Triceps - Home)"
        
        if "dumbbells" in [e.lower() for e in equipment]:
            mon_ex = [
                {"name": "Floor Dumbbell Press", "sets": 4, "reps": "12-15", "rest": "60s", "form_tip": "Lie flat on floor, press dumbbells up. Floor prevents shoulder hyperextension."},
                {"name": "Dumbbell Overhead Press", "sets": 3, "reps": "10-12", "rest": "60s", "form_tip": "Press dumbbells overhead from standing, brace core."},
                {"name": "Dumbbell Lateral Raises", "sets": 3, "reps": "15-20", "rest": "60s", "form_tip": "Raise weights out to your side, leading with the elbows."},
                {"name": "Decline Push-Ups", "sets": 3, "reps": "AMRAP (As Many As Possible)", "rest": "60s", "form_tip": "Elevate feet on bed/chair, push up to build upper chest."}
            ]
        else: # Bodyweight
            mon_ex = [
                {"name": "Standard Push-Ups", "sets": 4, "reps": "12-20", "rest": "60s", "form_tip": "Brace core, keep body straight, touch chest to floor."},
                {"name": "Pike Push-Ups (Shoulders)", "sets": 3, "reps": "8-12", "rest": "60s", "form_tip": "Hips high in V-shape, lower head towards the ground between hands."},
                {"name": "Tricep Chair Dips", "sets": 3, "reps": "12-15", "rest": "60s", "form_tip": "Use a sturdy chair, lower hips, drive up using triceps."},
                {"name": "Diamond Push-Ups", "sets": 3, "reps": "10-12", "rest": "60s", "form_tip": "Hands close in diamond shape to blast the triceps."}
            ]
            
        tue_focus = "Pull A (Back & Rear Delts - Home)"
        if "dumbbells" in [e.lower() for e in equipment]:
            tue_ex = [
                {"name": "Two-Arm Dumbbell Rows", "sets": 4, "reps": "12-15", "rest": "60s", "form_tip": "Hinge forward, pull dumbbells to rib cage."},
                {"name": "Dumbbell Shrugs", "sets": 3, "reps": "15-20", "rest": "60s", "form_tip": "Hold weights at side, squeeze traps up towards ears."},
                {"name": "Dumbbell Bicep Curls", "sets": 3, "reps": "12-15", "rest": "60s", "form_tip": "Standard curls standing up."},
                {"name": "Rear Delt Dumbbell Flyes", "sets": 3, "reps": "15-20", "rest": "60s", "form_tip": "Hinge forward, fly dumbbells outwards to hit rear shoulders."}
            ]
        else: # Bodyweight
            tue_ex = [
                {"name": "Doorframe Inverted Rows", "sets": 4, "reps": "12-15", "rest": "60s", "form_tip": "Hold doorframe, place feet close, pull chest towards frame."},
                {"name": "Superman Arch Holds", "sets": 3, "reps": "30s hold", "rest": "45s", "form_tip": "Lie on belly, raise chest and thighs, squeeze lower back."},
                {"name": "Towel Iso-Rows", "sets": 3, "reps": "15 reps", "rest": "60s", "form_tip": "Stand on towel, pull up on it with maximum effort for 10s."},
                {"name": "Bodyweight Bicep Curls (Doorframe)", "sets": 3, "reps": "12-15", "rest": "60s", "form_tip": "Use your arm bodyweight angle to curl off doorframe."}
            ]
            
        wed_focus = "Legs A (Lower Body - Home)"
        wed_ex = [
            {"name": "Bodyweight Squats (or DB Squats)", "sets": 4, "reps": "20-25", "rest": "60s", "form_tip": "Go deep, squeeze glutes at the top."},
            {"name": "Walking Lunges", "sets": 3, "reps": "15 steps per leg", "rest": "60s", "form_tip": "Take long strides, drop back knee to just above floor."},
            {"name": "Glute Bridges", "sets": 3, "reps": "20 reps", "rest": "45s", "form_tip": "Lie flat, raise hips, drive heels into ground and squeeze glutes."},
            {"name": "Single-Leg Calf Raises", "sets": 4, "reps": "15 per leg", "rest": "45s", "form_tip": "Stand on one leg near wall for balance, rise high."}
        ]

    # Mirroring the PPL split for the remainder of the 6-day cycle
    return {
        "split_name": split_name,
        "schedule": {
            "Monday": {"focus": mon_focus, "exercises": mon_ex},
            "Tuesday": {"focus": tue_focus, "exercises": tue_ex},
            "Wednesday": {"focus": wed_focus, "exercises": wed_ex},
            "Thursday": {
                "focus": "Push B (Chest & Shoulders Focus)",
                "exercises": [mon_ex[0], mon_ex[2]] + ([{"name": "Incline Push-Ups", "sets": 3, "reps": "15", "rest": "60s", "form_tip": "Hands elevated on table."}] if location.lower() == "home" else [mon_ex[1], mon_ex[3]])
            },
            "Friday": {
                "focus": "Pull B (Thickness & Bicep Focus)",
                "exercises": [tue_ex[0], tue_ex[2]] + ([{"name": "Chin-Ups / Pull-Ups", "sets": 3, "reps": "AMRAP", "rest": "60s", "form_tip": "If bar available, otherwise Doorframe rows."}] if location.lower() == "home" else [tue_ex[1], tue_ex[3]])
            },
            "Saturday": {
                "focus": "Legs B (Hamstring & Unilateral Focus)",
                "exercises": [wed_ex[1], wed_ex[2], wed_ex[3]] + ([{"name": "Bulgarian Split Squats", "sets": 3, "reps": "10-12 per leg", "rest": "60s", "form_tip": "One foot back on bed/bench, squat deep."}])
            },
            "Sunday": {
                "focus": "Rest Day",
                "exercises": []
            }
        }
    }


def get_mock_diet_plan(diet_pref: str, cals: int, protein: int, daily_budget: int) -> Dict[str, Any]:
    if diet_pref.lower() == "veg":
        meals = {
            "Breakfast": {
                "name": "High-Protein Oatmeal",
                "protein_g": 26,
                "calories": 420,
                "ingredients": ["Oats (50g)", "Double-toned milk (200ml)", "Paneer (80g) or Soy Milk", "Peanut butter (1 tbsp)", "Banana (1)"],
                "cost_inr": 45
            },
            "Lunch": {
                "name": "Paneer Bhurji & Roti with Dal",
                "protein_g": 35,
                "calories": 650,
                "ingredients": ["Low-fat Paneer (150g)", "Whole wheat Roti (2)", "Yellow Dal (1 bowl)", "Onion/tomato scramble (100g)"],
                "cost_inr": 60
            },
            "Dinner": {
                "name": "Soya Chunks Stir-Fry with Steamed Rice",
                "protein_g": 38,
                "calories": 580,
                "ingredients": ["Soya Chunks (60g, boiled)", "Brown Rice (1 cup)", "Curd (100g)", "Mixed Veggies (150g)"],
                "cost_inr": 35
            },
            "Snacks": {
                "name": "Curd & Roasted Chana",
                "protein_g": 16,
                "calories": 250,
                "ingredients": ["Low-fat Curd (150g)", "Roasted Chana / Chickpeas (50g)"],
                "cost_inr": 20
            }
        }
    else: # Non-veg
        meals = {
            "Breakfast": {
                "name": "Egg Scramble & Whole Wheat Toast",
                "protein_g": 28,
                "calories": 440,
                "ingredients": ["Whole Eggs (2)", "Egg Whites (2)", "Whole Wheat Toast (2 slices)", "Spinach & tomatoes (50g)"],
                "cost_inr": 40
            },
            "Lunch": {
                "name": "Budget Chicken Rice Bowl",
                "protein_g": 42,
                "calories": 680,
                "ingredients": ["Chicken Breast (150g, minced/cubed)", "Basmati Rice (1.5 cups)", "Sautéed Broccoli/Capsicum (100g)", "Curd (100g)"],
                "cost_inr": 70
            },
            "Dinner": {
                "name": "Fish Curry (or Egg Curry) with Roti",
                "protein_g": 34,
                "calories": 520,
                "ingredients": ["Fish/Egg Curry (150g fish or 3 boiled eggs)", "Whole Wheat Roti (2)", "Green Salad (1 plate)"],
                "cost_inr": 65
            },
            "Snacks": {
                "name": "Sprouted Moong Salad & Curd",
                "protein_g": 18,
                "calories": 260,
                "ingredients": ["Sprouted Moong Dal (100g)", "Low-fat Curd (100g)", "Cucumber/Onion (chopped)"],
                "cost_inr": 20
            }
        }

    # Sum totals
    cost_total = sum(m["cost_inr"] for m in meals.values())
    p_total = sum(m["protein_g"] for m in meals.values())
    c_total = sum(m["calories"] for m in meals.values())

    return {
        "calorie_total": c_total,
        "protein_total": p_total,
        "cost_total": cost_total,
        "meals": meals
    }


def get_mock_recipe(ingredients: List[str], diet_pref: str) -> Dict[str, Any]:
    # Match recipe based on user input ingredients
    ing_lower = [i.lower() for i in ingredients]
    
    if any("paneer" in idx for idx in ing_lower):
        name = "High-Protein Paneer Bhurji Scramble"
        macros = {"protein": 28, "calories": 380, "carbs": 10, "fats": 24}
        instructions = [
            "Crumble 150g paneer in a bowl and set aside.",
            "Heat 1 tsp oil in a pan, add cumin seeds and let them splutter.",
            "Sauté chopped onions, ginger, and green chilies until light brown.",
            "Add chopped tomatoes, turmeric, salt, and chili powder. Cook until mushy.",
            "Add the crumbled paneer, stir well, and cook on medium heat for 3-4 minutes.",
            "Garnish with fresh coriander leaves and squeeze a bit of lime. Enjoy with toast!"
        ]
    elif any("egg" in idx for idx in ing_lower):
        name = "Vylaro Masala Egg Omelette"
        macros = {"protein": 22, "calories": 280, "carbs": 4, "fats": 18}
        instructions = [
            "Whisk 2 whole eggs and 1 egg white in a bowl with salt, black pepper, and turmeric.",
            "Finely chop onions, green chilies, and tomatoes.",
            "Mix the chopped veggies into the whisked eggs.",
            "Heat 1/2 tsp butter or oil in a non-stick pan.",
            "Pour in the egg mixture and cook on low-medium heat until the bottom is set.",
            "Flip carefully and cook the other side for 1 minute. Fold and serve hot!"
        ]
    elif any("oat" in idx for idx in ing_lower):
        name = "Protein-Packed Peanut Butter Oats"
        macros = {"protein": 24, "calories": 420, "carbs": 48, "fats": 14}
        instructions = [
            "Add 50g rolled oats and 250ml milk (or water) in a saucepan.",
            "Bring to a boil, then simmer on low heat for 5 minutes, stirring occasionally.",
            "Once oats are thick and creamy, turn off the heat.",
            "Stir in 1 tablespoon of peanut butter and a scoop of whey protein (if available) or mash in 100g curd/paneer.",
            "Top with a sliced banana, chia seeds, or a pinch of cinnamon."
        ]
    else: # Default Soya / Lentil recipe
        name = "Spiced High-Protein Soya Bhurji"
        macros = {"protein": 32, "calories": 310, "carbs": 18, "fats": 9}
        instructions = [
            "Boil 50g soya chunks in salted water for 10 minutes until soft.",
            "Drain the water completely and squeeze out any excess moisture.",
            "Pulse the soya chunks in a blender to form a coarse crumble.",
            "Heat 1 tsp oil in a pan. Sauté chopped onions, garlic, and green chilies.",
            "Add chopped tomatoes, salt, chili powder, and garam masala. Cook for 3 minutes.",
            "Stir in the crumbled soya chunks and cook on medium-high for 5 minutes. Serve hot!"
        ]

    return {
        "name": name,
        "macros": macros,
        "instructions": instructions
    }


def get_mock_chat_response(message: str, profile: Dict[str, Any]) -> str:
    msg = message.lower()
    
    if "chicken" in msg and "paneer" in msg:
        return (
            "Yes, you can absolutely replace chicken with paneer! 100g of raw chicken breast has about 31g of protein and 165 calories (very lean). "
            "To get equivalent protein, you would need about 150g of Paneer, which will yield ~27g of protein but comes with ~400 calories due to its fat content. "
            "For a leaner budget vegetarian swap, try 60g of Soya Chunks (~32g protein, 200 cals) or a mix of Paneer and Egg Whites. This maintains your protein goals perfectly!"
        )
    elif "replace" in msg or "swap" in msg:
        return (
            "Swapping ingredients is a great way to stay budget-flexible! If you swap a protein source, look at its fat content. "
            "Lean swaps: Egg whites, soy chunks, low-fat curd, or double-toned milk. "
            "Fattier swaps: Whole paneer, peanuts, and whole eggs. If your budget is tight, roasted chana and green moong are incredibly cheap protein powerhouses!"
        )
    elif "workout" in msg or "exercise" in msg or "train" in msg:
        return (
            f"Given that your goal is to {profile.get('goal', 'lose')} weight and you choose {profile.get('workout_location', 'Gym')} training, "
            "my main tip is progressive overload! Keep track of your weight and reps. Try to add 1 rep or a tiny bit of weight weekly. "
            "Make sure to follow the weekly split on your workout tab and mark your sessions complete so I can track your weekly consistency!"
        )
    elif "budget" in msg or "money" in msg or "cheap" in msg:
        return (
            f"To stick to your ₹{profile.get('budget', 5000)} budget, rely on cheap whole foods. "
            "Soya chunks (₹100/kg, 52% protein), eggs (₹7-8 each, 6g protein), double-toned curd, green whole moong, and roasted chana "
            "are the most cost-effective protein sources in India. Avoid expensive supplements if you are on a tight budget; we can easily hit your targets with these!"
        )
    else:
        return (
            f"Hey there! As your Vylaro AI, I'm here to help you {profile.get('goal', 'lose weight')}. "
            f"Your daily target is {profile.get('calorie_target', 2000)} calories and {profile.get('protein_target', 120)}g of protein. "
            "Do you have a question about today's workouts, recipes, or a food substitution you'd like to make?"
        )
