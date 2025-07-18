import torch
import torch.nn as nn
import torch.optim as optim
from transformers import AutoModelForCausalLM, AutoTokenizer, AutoConfig
from torch.utils.data import DataLoader, TensorDataset
import copy

# --- 1. Model and Tokenizer Setup ---
# We use a smaller model for demonstration purposes to make it runnable on standard hardware.
# The paper uses ChatGLM-6B, but the principle is the same.
MODEL_NAME = "gpt2"

# Load tokenizer and a configuration of the model
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
config = AutoConfig.from_pretrained(MODEL_NAME)

# Add a padding token if it doesn't exist
if tokenizer.pad_token is None:
    tokenizer.add_special_tokens({'pad_token': '[PAD]'})

# --- 2. Model Splitting ---
# We'll split the GPT-2 model. The client will have the word embeddings,
# and the server will have the transformer blocks and the final language model head.

class ClientModel(nn.Module):
    """The part of the model that resides on the client."""
    def __init__(self, config):
        super(ClientModel, self).__init__()
        # The client holds the word and position embeddings
        self.embedding = nn.Embedding(config.vocab_size, config.hidden_size)
        # We need to resize token embeddings if a new pad token was added
        self.embedding.weight.data.normal_(mean=0.0, std=config.initializer_range)
        if tokenizer.pad_token_id is not None:
             self.embedding.padding_idx = tokenizer.pad_token_id
        
    def forward(self, input_ids):
        return self.embedding(input_ids)

class ServerModel(nn.Module):
    """The part of the model that resides on the server."""
    def __init__(self, base_model):
        super(ServerModel, self).__init__()
        # The server holds the main transformer blocks and the LM head
        self.transformer_blocks = base_model.h
        self.ln_f = base_model.ln_f
        self.lm_head = base_model.lm_head

    def forward(self, embeddings):
        # The transformer blocks expect a certain shape
        hidden_states = embeddings
        for block in self.transformer_blocks:
            hidden_states = block(hidden_states)[0]
        hidden_states = self.ln_f(hidden_states)
        logits = self.lm_head(hidden_states)
        return logits


# --- 3. Server and Client/Agent Classes ---

class Server:
    """The central server in the Federated Learning setup."""
    def __init__(self, server_model):
        self.model = server_model
        self.optimizer = optim.Adam(self.model.parameters(), lr=1e-5)
        self.activations_from_client = None

    def forward_pass(self, activations):
        """Forward pass on the server's model part."""
        self.activations_from_client = activations
        # Detach to break the computation graph from the client side initially
        self.activations_from_client.retain_grad()
        return self.model(self.activations_from_client)

    def backward_pass(self, grads_from_client):
        """Backward pass on the server's model part."""
        self.optimizer.zero_grad()
        # The gradients from the client are for the output of the server model
        server_output = self.model(self.activations_from_client)
        server_output.backward(gradient=grads_from_client)
        self.optimizer.step()
        return self.activations_from_client.grad

class Client:
    """A client (or agent) in the Federated Learning setup."""
    def __init__(self, client_model, local_data, server):
        self.model = client_model
        self.data_loader = local_data
        self.server = server
        self.optimizer = optim.Adam(self.model.parameters(), lr=1e-5)
        self.loss_fn = nn.CrossEntropyLoss()

    def train_epoch(self):
        """Train the client for one epoch on its local data."""
        for inputs, labels in self.data_loader:
            self.optimizer.zero_grad()
            
            # 1. Forward pass on the client model
            client_output = self.model(inputs)

            # 2. Send activations to the server and get server output
            server_output = self.server.forward_pass(client_output)
            
            # 3. Calculate loss on the client
            # The server's output (logits) and labels are used to compute the loss
            loss = self.loss_fn(server_output.view(-1, server_output.size(-1)), labels.view(-1))
            
            # 4. Backward pass on the client to get gradients for server
            loss.backward()
            
            # The gradient for the server's output is what the server needs to start its backpropagation
            grads_for_server = server_output.grad

            # 5. Send gradients to the server and get gradients for the client's output
            grads_from_server = self.server.backward_pass(grads_for_server)

            # 6. Finish backpropagation on the client and update weights
            client_output.backward(gradient=grads_from_server)
            self.optimizer.step()

            print(f"Client training loss: {loss.item()}")

# --- 4. Simulation of the Federated Learning Process ---

def main():
    print("🚀 Starting Federated Learning Simulation for FL-GLM")

    # --- Dummy Clinical Dataset ---
    # In a real scenario, this would be your small clinical dataset loaded securely on each client.
    # We create some dummy data for demonstration.
    # Each client will have a small batch of sentences.
    client1_data = ["Patient presents with fever and cough.", "Administer antibiotics as prescribed."]
    client2_data = ["Follow up in two weeks for reassessment.", "Blood pressure is within normal limits."]
    
    # Tokenize the data
    def create_dataset(sentences):
        inputs = tokenizer(sentences, return_tensors="pt", padding=True, truncation=True, max_length=512)
        # For language modeling, the labels are the same as the inputs
        return TensorDataset(inputs['input_ids'], inputs['input_ids'])

    client1_dataset = create_dataset(client1_data)
    client2_dataset = create_dataset(client2_data)

    client1_loader = DataLoader(client1_dataset, batch_size=1)
    client2_loader = DataLoader(client2_dataset, batch_size=1)

    # --- Initialize Models ---
    base_model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, config=config)
    # Resize model embeddings if a pad token was added
    base_model.resize_token_embeddings(len(tokenizer))
    
    # Split the model
    client_part = ClientModel(config)
    server_part = ServerModel(base_model)
    
    # --- Initialize Server and Clients ---
    server = Server(server_model=server_part)
    
    client1 = Client(
        client_model=copy.deepcopy(client_part), # Each client gets a copy of the client model part
        local_data=client1_loader, 
        server=server
    )
    client2 = Client(
        client_model=copy.deepcopy(client_part), 
        local_data=client2_loader, 
        server=server
    )
    
    clients = [client1, client2]
    
    # --- Run Federated Training ---
    NUM_ROUNDS = 3
    for round_num in range(NUM_ROUNDS):
        print(f"\n--- Round {round_num + 1}/{NUM_ROUNDS} ---")
        for i, client in enumerate(clients):
            print(f"-> Training Client {i+1}")
            client.train_epoch()
            
    print("\n✅ Federated Learning Simulation Finished!")

if __name__ == "__main__":
    main()
