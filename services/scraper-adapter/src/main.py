from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Person(BaseModel):
    name: str
    birth_date: str
    birth_time: str
    birth_place: str

@app.post("/calculate-birth-chart")
def calculate_birth_chart(person: Person):
    # örnek dummy response
    return {
        "status": "success",
        "data": {
            "person": person.dict(),
            "planet_positions": [
                {"planet": "Sun", "sign": "Taurus", "degree": 2.33, "house": 1}
            ],
            "houses": [
                {"house_number": 1, "sign": "Taurus", "degree": 0}
            ]
        }
    }
