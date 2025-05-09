import requests

# Simulated ZK proof (this would normally be generated via snarkjs or similar)
zk_proof = {
    "proof": [1, 2, 3, 4],  # Placeholder values
    "public_input": 50      # Age: must be between 45 and 60
}

# Simulate sending to Solana verifier backend (replace URL with actual endpoint)
url = "https://solana-verifier-node/api/submit_zk_proof"
response = requests.post(url, json=zk_proof)

print("Server response:", response.status_code, response.text)
