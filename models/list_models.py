import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load your API key from .env
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# List all available models
models = genai.list_models()

print("✅ Available Gemini Models:\n")
for model in models:
    print(f"- Name: {model.name}")
    print(f"  - Description: {model.description}")
    print(f"  - Generation Methods: {model.supported_generation_methods}")
    print("")
