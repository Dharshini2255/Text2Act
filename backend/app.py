
from fastapi import FastAPI
from pydantic import BaseModel
import pickle

app = FastAPI()

# Load model & vectorizer
with open("models/intent_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("models/vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

class TextRequest(BaseModel):
    text: str

@app.post("/predict-intent")
def predict_intent(req: TextRequest):
    X = vectorizer.transform([req.text])
    intent = model.predict(X)[0]
    return {
        "intent": intent
    }
