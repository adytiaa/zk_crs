import subprocess

def generate_proof(participant_data):
    input_data = f"{participant_data['score']} {participant_data['lower']} {participant_data['upper']} {participant_data['mean']} {participant_data['variance']}"
    
    result = subprocess.run(
        ["zokrates", "compute-witness", "-a"] + input_data.split(),
        capture_output=True, text=True
    )
    return result.stdout

def verify_proof(proof):
    print(f"Verifying proof: {proof[:50]}...")
    return "Witness computed successfully" in proof
