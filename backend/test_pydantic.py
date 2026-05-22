from pydantic import BaseModel, ValidationError
from datetime import date
from typing import Optional

class ProgressLogCreate(BaseModel):
    weight: Optional[float] = None
    workout_completed: Optional[bool] = None
    date: Optional[date] = None

try:
    print(ProgressLogCreate.model_validate_json('{"weight": 70, "workout_completed": false, "date": "2026-05-20"}'))
except ValidationError as e:
    print(e)
