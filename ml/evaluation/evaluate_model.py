import json
import pandas as pd
import pickle
from sklearn.metrics import classification_report

# Load model and vectorizer
with open("intent_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# Load dataset
with open("data/intents.json", "r") as file:
    data = json.load(file)

df = pd.DataFrame(data)

X = vectorizer.transform(df["text"])
y_true = df["intent"]
y_pred = model.predict(X)

print("📊 Model Evaluation Report:\n")
print(classification_report(y_true, y_pred))
