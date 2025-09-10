import argparse
from fedml import FedMLServer

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--config", type=str, default="server/server_config.yaml")
    args = parser.parse_args()

    server = FedMLServer(
        host="0.0.0.0",
        port=args.port,
        config_file=args.config
    )
    print(f"[Server] Starting on port {args.port} with config {args.config}...")
    server.start()
