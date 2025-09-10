# FedML + LLM + Clinical (Two-Hospital Example)

This repo demonstrates how to integrate **FedML** with a HuggingFace LLM to simulate **two hospitals** participating in a federated fine-tuning workflow.

- Each hospital trains locally on **synthetic EHR-like text**.
- A **FedML server** orchestrates aggregation.
- The setup can run locally or on **Theta EdgeCloud**.

⚠️ **Disclaimer**: This repo uses **synthetic data** only

# Federated Theta Agent (FedML Clinical Simulation)

This project demonstrates how to build a **federated learning agent** for decentralized clinical research using **FedML**. It simulates a small synthetic clinical dataset, distributes it across clients, and runs **federated training** using FedML’s client/server orchestration. The design mimics how this would run on a decentralized infrastructure like **Theta Cloud + Edge**.

---

## ✨ Key Features
- **Synthetic Clinical Dataset**
  - Features: age, systolic/diastolic blood pressure, glucose, comorbidity, lab marker.
  - Binary classification task (risk prediction).
- **Non-IID Client Data Split**
  - Data is distributed across clients to simulate real-world hospital settings.
- **Federated Training via FedML**
  - Uses FedML’s `FedMLRunner` to coordinate server + clients.
  - Clients train locally with a simple MLP classifier.
  - Server aggregates updates using FedAvg.
- **Local Test Launcher**
  - Spawns one server + multiple client processes on the same machine for quick testing.

---

## 🔑 Theta-Specific Aspects
In a real deployment, this framework could run on **Theta Cloud + Edge**:
- **Theta Edge Nodes** → Run client-side training locally within hospitals or labs.
- **Theta Cloud** → Acts as coordinator (aggregation, registry, audit).
- **Data Locality** → Raw patient data never leaves the edge node.
- **Privacy & Trust** → Encrypted updates, audit logs, blockchain anchoring.
- **Distributed Compute Marketplace** → Hospitals and GPU providers contribute compute via Theta’s ecosystem.

This demo simulates the **federated learning component** which can be plugged into Theta infrastructure.

---

## 🛠️ Installation

1. Clone this repo and install dependencies:
   ```bash
   pip install fedml torch scikit-learn matplotlib
   ```

2. Verify installation:
   ```bash
   python federated_theta_agent.py --help
   ```

---

## 🚀 Usage

### 1. Local Test Launcher (recommended for quick testing)
Run a full training round with 1 server and 2 clients locally:
```bash
python federated_theta_agent.py --mode launch --clients 2
```
This will spawn subprocesses for the server and clients.

### 2. Manual Role Execution
Run processes separately (useful for debugging):
```bash
# Terminal 1 (server)
python federated_theta_agent.py --mode run --role server --rank 0 --run_id test_run

# Terminal 2 (client 1)
python federated_theta_agent.py --mode run --role client --rank 1 --run_id test_run

# Terminal 3 (client 2)
python federated_theta_agent.py --mode run --role client --rank 2 --run_id test_run
```

### 3. Configuration Options
- `--clients` → number of clients (for launcher mode)
- `--rounds` → number of federated rounds (default: 5)
- `--local_epochs` → local training epochs per round (default: 2)
- `--samples` → number of synthetic samples to generate (default: 1000)
- `--lr` → learning rate (default: 1e-3)

Example:
```bash
python federated_theta_agent.py --mode launch --clients 3 --rounds 10 --local_epochs 5
```

---

## 📊 Outputs
- During training, each round prints validation accuracy and other metrics.
- Global model aggregation is handled automatically by FedML.

---

## 📦 Extending to Theta Cloud + Edge
To deploy on Theta:
1. Wrap the **client role** in a Theta Edge container to run inside hospital environments.
2. Deploy the **server role** on Theta Cloud for coordination.
3. Use Theta’s blockchain-based audit trail for compliance and trust.
4. Connect with FHIR/DICOM pipelines for real-world clinical datasets.

---

## 📖 References
- [FedML Documentation](https://fedml.ai/)
- [Theta Network](https://www.thetatoken.org/)
- Federated Learning for Healthcare: Survey & Applications

---

## 🧑‍⚕️ Summary
This repo provides a **practical testbed** for experimenting with **federated learning in clinical research**, with a clear migration path toward **Theta Cloud + Edge deployment**. It is designed for researchers and developers who want to:
- Prototype federated models for sensitive clinical data.
- Understand FedML orchestration.
- Explore decentralized AI using Theta infrastructure.

