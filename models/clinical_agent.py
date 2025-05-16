import os
import pandas as pd
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class ClinicalDataAgent:
    def __init__(self, data_paths):
        self.data_paths = data_paths
        self.model = genai.GenerativeModel("models/gemini-1.5-pro-latest")

    def simulate_local_training(self, df):
        return df.select_dtypes(include=["number"]).mean()

    def aggregate_models(self, local_results):
        return pd.DataFrame(local_results).mean()

    def analyze_data(self):
        local_results = []
        for path in self.data_paths:
            df = pd.read_csv(path)
            local_result = self.simulate_local_training(df)
            local_results.append(local_result)

        global_result = self.aggregate_models(local_results)

        prompt = f"""Based on this federated clinical data result: {global_result.to_dict()},
please provide a summary analysis of the patients' condition trends."""

        response = self.model.generate_content([prompt])

        return {
            "Hospital_1_Result": local_results[0].to_dict(),
            "Hospital_2_Result": local_results[1].to_dict(),
            "Federated_Model": global_result.to_dict(),
            "LLM_Analysis": response.text
        }
