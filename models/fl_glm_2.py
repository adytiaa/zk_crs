#!/usr/bin/env python
# -----------------------  FL‑GLM implementation  -----------------------
import os, random, copy, itertools, math, secrets, torch, torch.nn as nn
from torch.utils.data import DataLoader, Dataset, random_split
from transformers import AutoTokenizer, AutoModel, AutoConfig
from datasets import load_dataset
from tqdm import tqdm

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
N_CLIENTS = 3                  # pretend we have three hospitals
ROUNDS     = 3                 # global FL rounds (keep tiny)
LOCAL_EPOCHS = 1               # local epochs per round
BATCH_SIZE   = 8
LR           = 2e-5

# -------------------------------------------------------------------------
#  Encryption helpers (toy XOR stream cipher – replace with HE/TEE, etc.)
# -------------------------------------------------------------------------
def xor_encrypt(tensor: torch.Tensor, key: bytes) -> torch.Tensor:
    rnd = torch.tensor(list(key), dtype=tensor.dtype, device=tensor.device)
    return tensor + rnd.mean()          # cheap, differentiable “mask”

def xor_decrypt(tensor: torch.Tensor, key: bytes) -> torch.Tensor:
    rnd = torch.tensor(list(key), dtype=tensor.dtype, device=tensor.device)
    return tensor - rnd.mean()

# -------------------------------------------------------------------------
#  Model partitioning  -----------------------------------------------------
# -------------------------------------------------------------------------
BACKBONE = "distilbert-base-uncased"
config   = AutoConfig.from_pretrained(BACKBONE, num_labels=3)

class ClientNet(nn.Module):
    """Embedding + (optionally) first transformer block + classifier head."""
    def __init__(self, backbone_cfg):
        super().__init__()
        full = AutoModel.from_pretrained(BACKBONE, add_pooling_layer=False)
        # keep embeddings + first transformer layer on client
        self.embeddings      = full.embeddings
        self.first_layer     = full.transformer.layer[0]
        self.classifier_head = nn.Linear(backbone_cfg.hidden_size, config.num_labels)
        # freeze? up to you – demo keeps them trainable
    def forward(self, input_ids, attention_mask):
        h = self.embeddings(input_ids)                  # (B, L, H)
        h = self.first_layer(h, attention_mask)[0]
        return h                                        # smashed feature

class ServerNet(nn.Module):
    """Middle transformer layers living on the central server."""
    def __init__(self, backbone_cfg):
        super().__init__()
        full = AutoModel.from_pretrained(BACKBONE, add_pooling_layer=False)
        # drop embeddings & first layer -> keep layers 1‑5
        self.middle = nn.ModuleList(full.transformer.layer[1:])
    def forward(self, hidden_states, attention_mask):
        h = hidden_states
        for layer in self.middle:
            h = layer(h, attention_mask)[0]
        return h                                        # returned feature

# -------------------------------------------------------------------------
#  Simple MedNLI loader and partitioner  ----------------------------------
# -------------------------------------------------------------------------
def get_partitions(n_clients):
    ds = load_dataset("mednli", "matched")["train"]     # 11k rows
    ds = ds.shuffle(42)
    shards = ds.train_test_split(test_size=n_clients)
    parts  = shards["train"].train_test_split(n_clients)
    # convert to torch Dataset
    tok = AutoTokenizer.from_pretrained(BACKBONE)
    def make_ds(hf_subset):
        toks = tok(hf_subset["premise"], hf_subset["hypothesis"],
                    truncation=True, padding="max_length", max_length=128)
        xs   = torch.tensor(toks["input_ids"])
        ms   = torch.tensor(toks["attention_mask"])
        ys   = torch.tensor(hf_subset["label"])
        class T(Dataset):
            def __len__(self):  return len(xs)
            def __getitem__(self, idx): return xs[idx], ms[idx], ys[idx]
        return T()
    return [make_ds(s) for s in parts["test"]]          # list[Dataset]

# -------------------------------------------------------------------------
#  Federated training driver  ---------------------------------------------
# -------------------------------------------------------------------------
def train_federated():
    # one ServerNet shared globally
    server = ServerNet(config).to(DEVICE)
    server_opt = torch.optim.AdamW(server.parameters(), lr=LR)
    
    # an independent ClientNet + key for every client
    client_nets = [ClientNet(config).to(DEVICE) for _ in range(N_CLIENTS)]
    client_opts = [torch.optim.AdamW(c.parameters(), lr=LR) for c in client_nets]
    keys        = [secrets.token_bytes(16) for _ in range(N_CLIENTS)]
    
    partitions  = get_partitions(N_CLIENTS)
    
    for rnd in range(ROUNDS):
        print(f"\n===== Federated round {rnd+1}/{ROUNDS} =====")
        # ---- local client loops ------------------------------------------------
        for cid, (ds, cnet, copt, key) in enumerate(zip(partitions, client_nets,
                                                        client_opts, keys)):
            loader = DataLoader(ds, batch_size=BATCH_SIZE, shuffle=True)
            cnet.train(); server.train()
            for _ in range(LOCAL_EPOCHS):
                for xb, mb, yb in tqdm(loader, leave=False):
                    xb, mb, yb = xb.to(DEVICE), mb.to(DEVICE), yb.to(DEVICE)
                    # FWD client part
                    smashed = cnet(xb, mb)
                    smashed_enc = xor_encrypt(smashed, key)
                    # FWD server part
                    server_out  = server(smashed_enc, mb)
                    server_out  = xor_decrypt(server_out, key)
                    # head + loss
                    logits = cnet.classifier_head(server_out[:,0,:])  # CLS token
                    loss   = nn.CrossEntropyLoss()(logits, yb)
                    # BWD pass (through both nets)
                    copt.zero_grad(); server_opt.zero_grad()
                    loss.backward()
                    torch.nn.utils.clip_grad_norm_(cnet.parameters(), 1.0)
                    copt.step(); server_opt.step()
            print(f" Client {cid} done – last minibatch loss {loss.item():.4f}")
        # ---- FedAvg of CLIENT blocks ------------------------------------------
        with torch.no_grad():
            for params in zip(*[c.parameters() for c in client_nets]):
                avg = torch.mean(torch.stack(params), dim=0)
                for p in params: p.copy_(avg)
    # save final global model snapshot
    torch.save({
        "client_state_dict": client_nets[0].state_dict(),
        "server_state_dict": server.state_dict(),
    }, "fl_glm_mednli.pt")
    print("\nTraining complete – combined weights written to fl_glm_mednli.pt")

if __name__ == "__main__":
    train_federated()

