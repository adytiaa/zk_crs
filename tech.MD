### Overview
A seamless platform where patients own their medical data, stored encrypted off-chain (think IPFS/Arweave/Shadow Drive). Solana acts as the immutable ledger for ownership, access control proofs, and metadata hashes. Doctors, researchers, and institutions request access, granted explicitly by the patient via wallet signatures. Federated Learning and ZKPs are Phase 2/3 – first, we nail the core: Secure Storage, Patient Control, Verifiable Access. Speed to 1000 users, convert 100. Let's go.
### Killer Features (MVP Focus):
True Patient Ownership & Control: Patients use their Solana wallet as the key. No intermediaries can access data without explicit, on-chain verifiable permission.
End-to-End Encryption: Data encrypted client-side before upload. Only the patient (or those they grant access to) holds decryption keys. Base64 is unacceptable; we use real crypto.
Immutable Access Log: Solana transactions provide an undeniable audit trail of who accessed what data, when.
Simplified Access Management: Intuitive interface for patients to grant/revoke access, and for requestors (doctors, researchers) to request it.
### Architecture Refinement:
#### Frontend (Next.js): Handles user interaction, client-side encryption/decryption, wallet interactions, API calls.
#### Backend API (Node.js/Express/Prisma): Serves frontend requests, manages user profiles (off-chain details), orchestrates uploads to decentralized storage, interacts with Solana program on behalf of the user (relaying signed transactions or instructions), manages the state of access requests (pending/approved/rejected) reflected from on-chain events/state.
#### Database (Prisma/Postgres): Stores user profile info (name, email - potentially encrypted), metadata caches, access request status, pointers (CIDs) to encrypted off-chain data. It's a necessary cache and state manager, but not the ultimate source of truth for ownership/access grants.
#### Decentralized Storage (IPFS/Arweave/Shadow Drive): Stores the actual encrypted medical files. We get a Content Identifier (CID).
#### Solana Smart Contract (Anchor): The source of truth for:
#### Record Registration: Linking a CID to a patient's wallet address (owner).
#### Integrity Hash: Storing a hash of the encrypted data for verification.
#### Access Grants: Recording which addresses are authorized to access which CIDs. This can be an on-chain list or event-based logging. Event-based is more scalable.

### Smart Contract key components:
#### Key Changes & Rationale:
#### Simplified Accounts: RecordMetadata stores essential on-chain proof (owner, CID, hash). AccessGrant stores proof of permission for a specific requester. Removed Profile and complex AuthList – user profiles are better managed off-chain, and access is per-record.
#### PDA Seeds: Use meaningful seeds ("record", "grant") combined with unique identifiers (owner, CID, requester) for deterministic addresses. Storing the bump seed in the account is crucial for finding it later.
#### Events: Emit events (RecordRegistered, AccessGranted, AccessRevoked) for off-chain indexers (like our backend) to easily track state changes without constant polling.
#### Clear Instructions: register_record, grant_access, revoke_access. Focused on the core actions.
#### Client-Side Encryption Assumed: The contract only stores the CID and hash of the encrypted data. The re_encryption_key in grant_access is assumed to be prepared off-chain (e.g., using Lit Protocol or simple public-key crypto).
#### Space Calculation: Added LEN constants for accounts to define space allocation accurately. Adjust string length estimates based on expected data size.
#### Account Closure: Use close = owner attribute to return rent when revoking access or closing records. init_if_needed is used for AccessGrant as it might be created during the grant_access call. The ManageAccess context handles both grant (init) and revoke (close) by including the close attribute on the access_grant account.

### Database Design:
#### User: walletAddress is central. Optional PII fields.
#### MedicalRecord: Directly linked to User (owner). Stores cid, encryptedDataHash (matching Solana), and fileName. Added solanaCreatedAt.
#### AccessRequest: Manages the request lifecycle (Pending/Approved/Rejected). Links requester and granter (owner). granterId is denormalized from MedicalRecord.ownerId for easier querying of pending requests for a patient.
#### AccessGrant: Crucially, this table mirrors the successful grants on Solana (AccessGrant PDA). It's populated after an AccessRequest is APPROVED and the grant_access transaction succeeds. Stores the solanaReEncKey fetched from the chain, which the frontend needs for decryption.
#### Removed ShdwFile: Merged into MedicalRecord.
#### Relationships: Clear relations defined for querying (e.g., get all records owned by a user, all requests made by a user, all active grants for a user).
#### Indices: Added indices for common query patterns.

#### Next Steps & Considerations:
#### Real Decentralized Storage: Replace the simulated/backend upload logic with actual IPFS/Arweave/Shadow Drive integration (using their SDKs or services like Pinata/web3.storage).
#### Encryption Key Management: This is paramount. The insecure localStorage example must be replaced. Options:
#### Derive key from wallet signature + salt (simpler but potentially less secure if salt is static).
#### Encrypt AES key with user password (requires password handling).
#### Use services like Lit Protocol for threshold encryption/decryption based on on-chain conditions (more complex, powerful).
#### Store encrypted key blobs accessible only via user signature.
#### Backend Implementation: Build out the Node.js/Express backend API endpoints corresponding to lib/api.ts calls, interacting with Prisma and the Solana network using @solana/web3.js and @coral-xyz/anchor. The backend needs its own keypair to pay for transactions if acting as a gas relayer.
#### Solana Program Deployment: Deploy the Anchor program to Devnet/Testnet/Mainnet. Update declare_id! and frontend configurations.
#### Error Handling & UI/UX: Robust error handling, loading states, user feedback.
#### Security Audit: Essential before handling real sensitive data.