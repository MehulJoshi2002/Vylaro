from pydantic import BaseModel
from datetime import date
from typing import Optional

class ProgressLogCreate(BaseModel):
    date: Optional[date] = None

print(ProgressLogCreate.model_fields['date'].annotation)
