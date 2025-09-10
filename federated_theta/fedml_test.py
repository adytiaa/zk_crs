"""
Federated Theta Agent - FedML Implementation with Local Testing Launcher

This script demonstrates how to integrate a synthetic clinical dataset with FedML’s
federated learning framework. Instead of a custom FedAvg simulation, it now uses FedML’s
built-in APIs for client/server orchestration.

Usage:
  # Launch locally with test launcher (server + 2 clients)
  python federated_theta_agent.py --mode launch --clients 2

  # Or run manually:
  python federated_theta_agent.py --mode run --role server --rank 0 --run_id test_run
  python federated_theta_agent.py --mode run --role client --rank 1 --run_id test_run
  python federated_theta_agent.py --mode run --role client --rank 2 --run_id test_run

Dependencies:
  pip install fedml torch scikit-learn

Note: This scaffold uses FedML’s distributed runner. The launcher spawns multiple processes
on a single machine to simulate server + clients for quick testing.
"""

import argparse
import numpy as np
import torch
import torch.nn as nn
from sklearn.model_selection import train_test_split
import subprocess
import sys

import fedml
from fedml.core import ClientTrainer, ServerAggregator
from fedml.simulation import mpi_init

SEED = 42
np.random.seed(SEED)
torch.manual_seed(SEED)

def make_clinical_data(n):
    age = np.random.randint(20, 90, size=n)
    sbp = np.random.normal(120 + (age - 50) * 0.2, 15, size=n)
    dbp = np.random.normal(80, 10, size=n)
    glucose = np.random.normal(100 + (age - 50) * 0.3, 20, size=n)
    comorb = np.random.binomial(1, p=0.2 + (age-40)/200, size=n)
    lab = np.random.normal(0, 1, size=n)
    logits = -5 + 0.03*(age) + 0.02*(sbp) + 0.04*(comorb*20) + 0.5*lab + 0.01*(glucose-100)
    prob = 1 / (1 + np.exp(-logits))
    y = np.random.binomial(1, prob)
    X = np.vstack([age, sbp, dbp, glucose, comorb, lab]).T.astype(np.float32)
    return X, y.astype(np.int64)

class SimpleMLP(nn.Module):
    def __init__(self, in_dim=6, hidden=64):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Linear(hidden, 1)
        )
    def forward(self, x):
        return self.net(x).squeeze(-1)

class ClinicalTrainer(ClientTrainer):
    def get_model_params(self):
        return {k: v.cpu() for k, v in self.model.state_dict().items()}

    def set_model_params(self, model_parameters):
        self.model.load_state_dict(model_parameters)

    def train(self, train_data, device, args):
        self.model.train()
        criterion = nn.BCEWithLogitsLoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=args.lr)

        for epoch in range(args.local_epochs):
            for batch_x, batch_y in train_data:
                batch_x, batch_y = batch_x.to(device), batch_y.float().to(device)
                optimizer.zero_grad()
                logits = self.model(batch_x)
                loss = criterion(logits, batch_y)
                loss.backward()
                optimizer.step()

    def test(self, test_data, device, args):
        self.model.eval()
        correct, total = 0, 0
        with torch.no_grad():
            for batch_x, batch_y in test_data:
                batch_x, batch_y = batch_x.to(device), batch_y.to(device)
                logits = self.model(batch_x)
                preds = (torch.sigmoid(logits) > 0.5).long()
                correct += (preds == batch_y).sum().item()
                total += batch_y.size(0)
        return 0, correct/total, correct/total, 0  # loss, acc, precision, recall

def load_data(args):
    X, y = make_clinical_data(args.samples)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=SEED, stratify=y)
    X_train, y_train = torch.tensor(X_train), torch.tensor(y_train)
    X_test, y_test = torch.tensor(X_test), torch.tensor(y_test)

    train_data = [(X_train, y_train)]
    test_data = [(X_test, y_test)]
    return train_data, test_data

def run_fedml(args):
    mpi_init.init(args)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = SimpleMLP()
    train_data, test_data = load_data(args)

    trainer = ClinicalTrainer(model, train_data, test_data, device, args)
    aggregator = ServerAggregator(model, train_data, test_data, device, args)

    fedml_runner = fedml.FedMLRunner(args, device, model, train_data, test_data, trainer, aggregator)
    fedml_runner.run()

def launch_local_test(args):
    processes = []
    run_id = "local_test"

    # Start server
    cmd = [sys.executable, __file__, "--mode", "run", "--role", "server", "--rank", "0", "--run_id", run_id]
    processes.append(subprocess.Popen(cmd))

    # Start clients
    for i in range(1, args.clients+1):
        cmd = [sys.executable, __file__, "--mode", "run", "--role", "client", "--rank", str(i), "--run_id", run_id]
        processes.append(subprocess.Popen(cmd))

    for p in processes:
        p.wait()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", type=str, choices=["run", "launch"], required=True)
    parser.add_argument("--role", type=str, choices=["server", "client"], default="client")
    parser.add_argument("--rank", type=int, default=1)
    parser.add_argument("--run_id", type=str, default="fedml_test")
    parser.add_argument("--rounds", type=int, default=5)
    parser.add_argument("--clients", type=int, default=2)
    parser.add_argument("--local_epochs", type=int, default=2)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--samples", type=int, default=1000)
    args = parser.parse_args()

    if args.mode == "run":
        run_fedml(args)
    elif args.mode == "launch":
        launch_local_test(args)

