# DEZI NETWORK

## Decentralised Clinical Research Framework 


**Key Components:**

- **Blockchain Infrastructure:** Solana now supports advanced privacy features such as Confidential Balances, which use zero-knowledge proofs (ZKPs) and homomorphic encryption to shield sensitive data (like token transfers or patient information) while maintaining regulatory compliance and auditability.
- **Federated Learning Integration:** Clinical research frameworks can leverage federated learning, allowing institutions to collaboratively train AI models without sharing raw patient data. Only encrypted model updates are posted to the blockchain, preserving privacy and adhering to regulations like GDPR.
- **Zero-Knowledge Proofs (ZKPs):** zk-SNARKs enable verification of computations or model updates on-chain without revealing underlying sensitive data, ensuring both privacy and data integrity.
- **Decentralized Access Control:** Solana’s privacy tools and protocols like Arcium and Lit enable fine-grained, programmable access controls and encrypted computation, so only authorized parties can access or process clinical data.

**Summary Table**

| Feature                        | Solana Implementation                        | Benefit for Clinical Research      |
|-------------------------------|----------------------------------------------|-----------------------------------|
| Confidential Balances          | ZKPs + Homomorphic Encryption                | Private, compliant data sharing   |
| Federated Learning             | Decentralized model training, blockchain logs| No raw data leaves institution    |
| zk-SNARKs                      | On-chain proof of computation                | Verifiable, privacy-preserving    |
| Decentralized Access Control   | Protocols like Lit, Arcium                   | Secure, granular data permissions |

This combination allows for privacy-preserving, decentralized clinical research on Solana, enabling secure collaboration between healthcare institutions without compromising patient confidentiality or regulatory compliance

## 🎯 **Benefits**

| Benefit                   | Explanation                                                              |
| ------------------------- | ------------------------------------------------------------------------ |
| **Privacy-preserving**    | Raw data never exposed; only proofs are shared                           |
| **Verifiable science**    | Prevents p-hacking or data tampering                                     |
| **Scalable AI**           | Agents automate workflows while ensuring compliance                      |
| **Decentralized trust**   | Blockchain ensures that no single party controls the process             |
| **Regulatory compliance** | Designed with GDPR, HIPAA in mind (e.g., consent tracking, pseudonymity) |

---
**Existing Frameworks**

There are privacy-preserving decentralized clinical research frameworks, primarily leveraging blockchain technology. Most existing solutions use private or consortium blockchains (like Hyperledger Fabric or Ethereum) to manage clinical trial data, automate consent, and control access via smart contracts[1][5][6]. These frameworks focus on data security, transparency, and auditability, often storing sensitive data off-chain or encrypted, and using decentralized storage systems like IPFS[1][6]. While many are still proof-of-concept or pilot projects, they demonstrate the feasibility of privacy-preserving, decentralized clinical research management[1][6][7].

Citations:
[1] https://www.medrxiv.org/content/10.1101/2024.06.12.24308813v1.full-text
[2] https://www.sciencedirect.com/science/article/pii/S1551714424002672
[3] https://pmc.ncbi.nlm.nih.gov/articles/PMC7153067/
[4] https://www.tandfonline.com/doi/full/10.1080/17576180.2025.2452774?src=exp-la
[5] https://ijtech.eng.ui.ac.id/article/view/6703
[6] https://pmc.ncbi.nlm.nih.gov/articles/PMC8075489/
[7] https://ietresearch.onlinelibrary.wiley.com/doi/10.1049/cmu2.12488
[8] https://rymedi.com/transforming-clinical-trials-with-blockchain-technology-innovations-and-challenges-in-2024/


![alt text](test_crs.png "ZK_CRF")
[source: https://www.medrxiv.org/content/10.1101/2024.06.12.24308813v1.full.pdf]

![alt text](crf_arch.png "Architecture")
![alt text](FL_solana.png "Architecture_good")



+-----------------------------------------------------------------------------------+
|                        Privacy-Preserving Decentralized Clinical Research         |
|                                   (Solana-based)                                  |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|   +-------------------+         +-------------------+         +----------------+  |
|   |  Hospital/Clinic  |         |  Research Center  |         |  Data Partner  |  |
|   +-------------------+         +-------------------+         +----------------+  |
|            |                           |                              |           |
|            |   (Local Data Storage)    |   (Local Data Storage)       |           |
|            +-----------+---------------+--------------+---------------+           |
|                        |                              |                           |
|                        v                              v                           |
|           +---------------------------------------------------------+             |
|           |    Federated Learning Clients (Local Model Training)    |             |
|           +---------------------------------------------------------+             |
|                        |                              |                           |
|                        v                              v                           |
|           +---------------------------------------------------------+             |
|           |    Model Updates (Encrypted, ZK-Proof Attached)         |             |
|           +---------------------------------------------------------+             |
|                        |                              |                           |
|                        v                              v                           |
|   +---------------------------------------------------------------------------+   |
|   |                 Solana Blockchain (Smart Contracts Layer)                 |   |
|   |  - Stores encrypted model updates                                         |   |
|   |  - Verifies ZK-proofs for privacy/compliance                              |   |
|   |  - Implements access control (Lit Protocol, Arcium, etc.)                 |   |
|   +---------------------------------------------------------------------------+   |
|                        |                              |                           |
|                        v                              v                           |
|   +---------------------------------------------------------------------------+   |
|   |        Authorized Researchers/Regulators (View/Access Encrypted Data)      |   |
|   +---------------------------------------------------------------------------+   |
|                                                                                   |
+-----------------------------------------------------------------------------------+

+---------------------------------------------------------------------------+
[ Hospital/Clinic ]        [ Research Center ]         [ Data Partner ]
        |                         |                          |
        | (Local Data Storage)    | (Local Data Storage)     |
        +-----------+-------------+-------------+------------+
                    |                           |
                    v                           v
    [ Federated Learning Clients (Local Model Training) ]
                    |                           |
                    v                           v
    [ Model Updates (Encrypted, ZK-Proof Attached) ]
                    |
                    v
[ Solana Blockchain (Smart Contracts, Access Control, ZK Verification) ]
                    |
                    v
[ Authorized Researchers/Regulators (Access Encrypted/Aggregated Results) ]
+---------------------------------------------------------------------------+

Smart contract methods

Patient Smart Contract

    addPatient: Registers a patient for the study and sets access permissions

    editPermissions: Changes a patient’s access permissions

    getPeople: Gets the set of patients registered for the study

Researcher Smart Contract

    addQuery: Submits a new query to the blockchain

    addQueryResult: Places a hash of a query result on the blockchain

    getQueries: Retrieves waiting queries from the blockchain

    getUnsolvedCount: Retrieves the number of waiting queries from the blockchain


Data Set sources: https://ncri1.partners.org/ProACT/

Key repos which are good start for development of agents and blockchain: 

https://github.com/LeoYML/clinical-agent

https://github.com/ictashik/BlockChain_ClinicalTrial


## Ideas for Using NEAR Blockchain Shade Agents in Health Data Research

Shade Agents on NEAR are decentralized, autonomous AI agents that leverage trusted execution environments (TEEs) and decentralized key management to securely interact with multiple blockchains and off-chain data sources, while preserving privacy and eliminating single points of failure. Here are several ways these agents could be applied in health data research:

---

1. Secure, Autonomous Health Data Custody and Sharing
- Shade Agents can act as non-custodial controllers of sensitive health data, ensuring only authorized, privacy-preserving access and sharing between research stakeholders (e.g., hospitals, labs, researchers)[1][2][5].
- They can autonomously enforce consent, audit access, and log all data transactions verifiably on-chain, reducing risks of data breaches and unauthorized use.

2. Cross-Institutional Data Collaboration
- By leveraging Shade Agents’ multichain and cross-platform capabilities, health data from different sources (e.g., hospital EHRs, genomics labs, wearable devices) can be securely aggregated and analyzed without centralized intermediaries[1][2][5][7].
- Agents can autonomously orchestrate data queries, federated learning, or distributed analytics, while maintaining compliance with privacy regulations.

3. Automated Research Protocol Execution
- Researchers can deploy Shade Agents to autonomously execute complex research workflows, such as recruiting participants, distributing incentives, collecting data, and performing on-chain analysis, all with verifiable audit trails[1][2][6][8].
- Agents can interact with off-chain AI models, APIs, or computation resources to process health data in real time, then record results or trigger further actions on-chain.

4. Privacy-Preserving Data Monetization and Incentivization
- Shade Agents can manage decentralized marketplaces where individuals contribute anonymized health data in exchange for rewards, ensuring that data usage complies with user consent and is tracked transparently[1][2][5][7].
- Smart contracts can automate payments, royalties, or research incentives based on data usage or research milestones.

5. Decentralized Governance and Compliance
- Use Shade Agents to facilitate decentralized governance of health data repositories, allowing token holders or DAOs to vote on data access policies, research priorities, or funding allocations[6][7].
- Agents can autonomously enforce KYC/KYB or compliance checks, reducing manual overhead and increasing trust among participants.

---

## Example Use Cases

| Use Case                                   | How Shade Agents Help                                    |
|---------------------------------------------|----------------------------------------------------------|
| Secure health data sharing                  | Enforce access, consent, and privacy on-chain            |
| Multi-institutional research collaboration  | Aggregate/analyze data across silos, preserve privacy    |
| Automated clinical trial management         | Recruit, consent, and reward participants autonomously   |
| Privacy-preserving data marketplaces        | Enable data monetization with strong privacy guarantees  |
| DAO-driven health research funding          | Automate governance, compliance, and fund distribution   |

---

### Why Shade Agents Are a Fit for Health Data Research

- Privacy & Security: TEEs and decentralized key management protect sensitive health data and cryptographic keys, even if some nodes fail or are compromised[1][2][5][8].
- Autonomy & Verifiability: Agents operate without centralized oversight, actions are verifiable, and audit trails are on-chain[1][2][5][7].
- Cross-Chain & Off-Chain Integration: Shade Agents can interact with multiple blockchains and external data/APIs, enabling rich, real-world applications


 Trustless Collaboration: Researchers and institutions can collaborate without needing to trust a central party, reducing barriers to data sharing and innovation[1][2][5][7].

---

In summary: NEAR Shade Agents could transform health data research by enabling secure, privacy-preserving, and autonomous data management, collaboration, and analysis—unlocking new models for decentralized, user-owned health innovation

