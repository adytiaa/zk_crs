#!/bin/bash
python server/server.py --port 8080 --config server/server_config.yaml &
python client/client.py --client_id hospital_a --data client/hospital_a_notes.csv --server_addr 127.0.0.1:8080 --config client/client_config.yaml &
python client/client.py --client_id hospital_b --data client/hospital_b_notes.csv --server_addr 127.0.0.1:8080 --config client/client_config.yaml &
