from fastapi import FastAPI
from clinical_agent import ClinicalDataAgent

app = FastAPI()

@app.get("/")
def root():
    return {"message": "LLM Federated Clinical Agent is running"}

@app.get("/analyze")
def analyze():
    agent = ClinicalDataAgent(["data/hospital_1.csv", "data/hospital_2.csv"])
    return agent.analyze_data()
