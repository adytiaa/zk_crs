from collections import OrderedDict
import warnings

import flwr as fl
import torch
from torch.utils.data import DataLoader, TensorDataset
from transformers import AutoTokenizer, AutoModelForMaskedLM, AdamW

# Suppress warnings
warnings.filterwarnings("ignore", category=UserWarning)

# Define the model and tokenizer
MODEL_NAME = "distilbert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForMaskedLM.from_pretrained(MODEL_NAME)

# Define the device
DEVICE = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

def simulate_clinical_data(num_clients: int):
    """
    Simulates a small clinical dataset distributed among clients.
    In a real-world scenario, this data would already exist on each client's server.
    """
    # Dummy clinical notes
    client_data = {
        "client_1": ["The patient presents with a fever and cough.", "Coronary artery disease is a major concern."],
        "client_2": ["Patient has a history of hypertension and diabetes.", "Prescribed metformin for glucose control."],
        "client_3": ["Routine check-up shows normal sinus rhythm.", "Advised to continue with a healthy diet and exercise."]
    }

    # Tokenize the data
    tokenized_data = {}
    for client_id, texts in client_data.items():
        inputs = tokenizer(texts, return_tensors='pt', max_length=512, truncation=True, padding='max_length')
        inputs['labels'] = inputs.input_ids.detach().clone()
        # Create masks for masked language modeling
        rand = torch.rand(inputs.input_ids.shape)
        mask_arr = (rand < 0.15) * (inputs.input_ids != 101) * (inputs.input_ids != 102)
        selection = []
        for i in range(inputs.input_ids.shape[0]):
            selection.append(torch.flatten(mask_arr[i].nonzero()).tolist())
        for i in range(inputs.input_ids.shape[0]):
            inputs.input_ids[i, selection[i]] = 103
        tokenized_data[client_id] = TensorDataset(inputs.input_ids, inputs.attention_mask, inputs.labels)

    # Create DataLoaders
    client_dataloaders = {}
    for client_id, dataset in tokenized_data.items():
        client_dataloaders[client_id] = DataLoader(dataset, batch_size=2, shuffle=True)

    return client_dataloaders

class ClinicalNlpClient(fl.client.NumPyClient):
    """A Flower client for training a language model on clinical data."""
    def __init__(self, model, trainloader, valloader):
        self.model = model
        self.trainloader = trainloader
        self.valloader = valloader

    def get_parameters(self, config):
        """Returns the model parameters as a list of NumPy arrays."""
        return [val.cpu().numpy() for _, val in self.model.state_dict().items()]

    def set_parameters(self, parameters):
        """Sets the model parameters from a list of NumPy arrays."""
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = OrderedDict({k: torch.tensor(v) for k, v in params_dict})
        self.model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):
        """
        Trains the model on the client's local data.
        """
        self.set_parameters(parameters)
        self.model.to(DEVICE)
        self.model.train()
        optimizer = AdamW(self.model.parameters(), lr=5e-5)
        for epoch in range(1):  # Train for 1 epoch
            for batch in self.trainloader:
                input_ids, attention_mask, labels = [t.to(DEVICE) for t in batch]
                outputs = self.model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
                loss = outputs.loss
                loss.backward()
                optimizer.step()
                optimizer.zero_grad()
        return self.get_parameters(config={}), len(self.trainloader.dataset), {}

    def evaluate(self, parameters, config):
        """
        Evaluates the model on the client's local validation data.
        """
        self.set_parameters(parameters)
        self.model.to(DEVICE)
        self.model.eval()
        loss = 0
        with torch.no_grad():
            for batch in self.valloader:
                input_ids, attention_mask, labels = [t.to(DEVICE) for t in batch]
                outputs = self.model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
                loss += outputs.loss.item()
        return loss / len(self.valloader), len(self.valloader.dataset), {"loss": loss}

def client_fn(cid: str):
    """Create a Flower client representing a single hospital."""
    client_dataloaders = simulate_clinical_data(num_clients=3)
    trainloader = client_dataloaders[f"client_{int(cid) + 1}"]
    # In a real-world scenario, you would have a separate validation set
    valloader = trainloader
    return ClinicalNlpClient(model, trainloader, valloader)

# Start the Federated Learning simulation
if __name__ == "__main__":
    # Define the strategy for federated learning
    strategy = fl.server.strategy.FedAvg(
        fraction_fit=1.0,  # Train on 100% of clients
        min_fit_clients=3,
        min_available_clients=3,
    )

    # Start the simulation
    fl.simulation.start_simulation(
        client_fn=client_fn,
        num_clients=3,
        config=fl.server.ServerConfig(num_rounds=5),
        strategy=strategy,
    )