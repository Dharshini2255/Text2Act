import json
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Load data
with open("data/intents.json", "r") as f:
    data = json.load(f)

texts = [item["text"] for item in data]
labels = [item["intent"] for item in data]

# 1️⃣ Create vectorizer
vectorizer = TfidfVectorizer()

# 2️⃣ FIT the vectorizer (THIS IS CRITICAL)
X = vectorizer.fit_transform(texts)

# 3️⃣ Train model on fitted vectors
model = LogisticRegression(max_iter=1000)
model.fit(X, labels)

# 4️⃣ Save BOTH fitted objects
with open("models/vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

with open("models/intent_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("✅ Model and vectorizer trained & saved successfully")