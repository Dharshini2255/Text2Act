import pickle

with open("intent_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

text = "how is your day"
X = vectorizer.transform([text])
print(model.predict(X)[0])
