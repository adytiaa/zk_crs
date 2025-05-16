import os
from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Load .env and configure Gemini
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-pro")

# FastAPI app
app = FastAPI()

# Input model
class PromptInput(BaseModel):
    prompt: str

@app.post("/generate")
async def generate_response(data: PromptInput):
    try:
        response = model.generate_content(data.prompt)
        return {"response": response.text}
    except Exception as e:
        return {"error": str(e)}
