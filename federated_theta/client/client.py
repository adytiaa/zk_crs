import argparse
from fedml import FedMLClient

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--client_id", type=str, required=True)
    parser.add_argument("--data", type=str, required=True)
    parser.add_argument("--server_addr", type=str, required=True)
    parser.add_argument("--config", type=str, default="client/client_config.yaml")
    args = parser.parse_args()

    fed_client = FedMLClient(
        server_addr=args.server_addr,
        client_id=args.client_id,
        config_file=args.config
    )
    print(f"[Client {args.client_id}] Starting with config {args.config}...")
    fed_client.start(data_path=args.data)
