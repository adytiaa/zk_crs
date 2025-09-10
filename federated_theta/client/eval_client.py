import argparse
import pandas as pd
from transformers import AutoTokenizer, AutoModelForCausalLM, Trainer, TrainingArguments
from fedml import FedMLClient

def load_data(path, tokenizer):
    df = pd.read_csv(path)
    enc = tokenizer(df["text"].tolist(), truncation=True, padding=True)
    class SimpleDataset:
        def __init__(self, enc): self.enc = enc
        def __len__(self): return len(self.enc["input_ids"])
        def __getitem__(self, i):
            return {
                "input_ids": self.enc["input_ids"][i],
                "attention_mask": self.enc["attention_mask"][i],
                "labels": self.enc["input_ids"][i],
            }
    return SimpleDataset(enc)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--client_id", type=str, required=True)
    parser.add_argument("--data", type=str, required=True)
    parser.add_argument("--server_addr", type=str, required=True)
    args = parser.parse_args()

    model_name = "sshleifer/tiny-gpt2"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    dataset = load_data(args.data, tokenizer)

    model = AutoModelForCausalLM.from_pretrained(model_name)

    training_args = TrainingArguments(
        output_dir=f"/tmp/{args.client_id}_eval",
        per_device_eval_batch_size=2,
    )
    trainer = Trainer(model=model, args=training_args, eval_dataset=dataset)

    fed_client = FedMLClient(server_addr=args.server_addr, client_id=args.client_id)
    print(f"[Eval {args.client_id}] Downloading global model from server...")
    fed_client.wait_for_global_model(model)
    metrics = trainer.evaluate()
    print(f"[Eval {args.client_id}] Local metrics: {metrics}")
    fed_client.send_evaluation_metrics(metrics)
