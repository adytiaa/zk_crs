use anchor_lang::prelude::*;

// Replace with your program's actual ID after deployment
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod dezi {
    use super::*;

    /// Registers metadata for a new encrypted medical record.
    /// The actual encrypted data is stored off-chain (e.g., IPFS/Arweave/ShadowDrive).
    /// The owner is implicitly the signer creating this record metadata.
    /// Emits an event for indexing off-chain.
    pub fn register_record(
        ctx: Context<RegisterRecord>,
        cid: String,          // Content Identifier from off-chain storage
        encrypted_data_hash: String, // Hash of the encrypted data for integrity checks
        file_name: String,    // Original file name (optional metadata)
    ) -> Result<()> {
        let record_metadata = &mut ctx.accounts.record_metadata;
        record_metadata.owner = ctx.accounts.owner.key();
        record_metadata.cid = cid.clone();
        record_metadata.encrypted_data_hash = encrypted_data_hash;
        record_metadata.file_name = file_name;
        record_metadata.created_at = Clock::get()?.unix_timestamp;
        record_metadata.bump = ctx.bumps.record_metadata; // Store the bump seed

        emit!(RecordRegistered {
            owner: record_metadata.owner,
            cid: record_metadata.cid.clone(),
            encrypted_data_hash: record_metadata.encrypted_data_hash.clone(),
            file_name: record_metadata.file_name.clone(),
            timestamp: record_metadata.created_at,
        });

        Ok(())
    }

    /// Grants access to a specific record (CID) for a requester.
    /// Only the owner of the record can call this.
    /// Stores the grant on-chain and emits an event.
    /// The 're_encryption_key' is the original symmetric key, re-encrypted with the requester's public key.
    /// This key management happens off-chain; the chain just stores the result.
    pub fn grant_access(
        ctx: Context<ManageAccess>,
        requester: Pubkey,
        re_encryption_key: String, // Key needed by requester to decrypt, encrypted for them
    ) -> Result<()> {
        let record_metadata = &ctx.accounts.record_metadata;
        let access_grant = &mut ctx.accounts.access_grant;

        // Ensure signer is the owner
        require_keys_eq!(ctx.accounts.owner.key(), record_metadata.owner, DeziError::Unauthorized);

        access_grant.record_cid = record_metadata.cid.clone();
        access_grant.requester = requester;
        access_grant.granter = record_metadata.owner; // Should be owner.key()
        access_grant.re_encryption_key = re_encryption_key;
        access_grant.granted_at = Clock::get()?.unix_timestamp;
        access_grant.bump = ctx.bumps.access_grant; // Store the bump seed

        emit!(AccessGranted {
            cid: record_metadata.cid.clone(),
            granter: access_grant.granter,
            requester: access_grant.requester,
            granted_at: access_grant.granted_at,
        });

        Ok(())
    }

    /// Revokes access previously granted to a requester for a specific record (CID).
    /// Only the owner of the record can call this.
    /// Closes the AccessGrant account and emits an event.
    pub fn revoke_access(ctx: Context<ManageAccess>) -> Result<()> {
        let record_metadata = &ctx.accounts.record_metadata;
        let access_grant = &ctx.accounts.access_grant;

        // Ensure signer is the owner
        require_keys_eq!(ctx.accounts.owner.key(), record_metadata.owner, DeziError::Unauthorized);

        // Redundant check, but good practice: ensure grant matches context
        require_keys_eq!(access_grant.granter, record_metadata.owner, DeziError::InvalidGrant);
        require_eq!(access_grant.record_cid, record_metadata.cid, DeziError::InvalidGrant);

        emit!(AccessRevoked {
            cid: record_metadata.cid.clone(),
            granter: access_grant.granter,
            requester: access_grant.requester,
            revoked_at: Clock::get()?.unix_timestamp,
        });

        // Account closure happens automatically via #[account(mut, close = owner ...)]
        Ok(())
    }

    /// Closes the record metadata account. Only the owner can do this.
    /// This implies the record is being logically deleted or archived.
    /// Associated AccessGrant accounts should be closed beforehand or handled off-chain.
    pub fn close_record_metadata(_ctx: Context<CloseRecordMetadata>) -> Result<()> {
        // Account closure happens automatically via #[account(mut, close = owner ...)]
        Ok(())
    }
}

// --- Account Contexts ---

#[derive(Accounts)]
#[instruction(cid: String)] // Pass CID to derive the PDA
pub struct RegisterRecord<'info> {
    #[account(
        init,
        payer = owner,
        space = RecordMetadata::LEN,
        // Use CID + Owner as seeds for uniqueness
        seeds = [b"record", owner.key().as_ref(), cid.as_bytes()],
        bump
    )]
    pub record_metadata: Account<'info, RecordMetadata>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(requester: Pubkey)] // Pass requester pubkey to derive the PDA
pub struct ManageAccess<'info> {
    #[account(
        // Constraint: Check owner field matches the signer
        seeds = [b"record", owner.key().as_ref(), record_metadata.cid.as_bytes()],
        bump = record_metadata.bump, // Use stored bump
        constraint = record_metadata.owner == owner.key() @ DeziError::Unauthorized
    )]
    pub record_metadata: Account<'info, RecordMetadata>,

    #[account(
        init_if_needed, // Use init_if_needed for grant, close manually for revoke
        payer = owner,
        space = AccessGrant::LEN,
        // Use CID + Requester + Granter(Owner) as seeds for uniqueness
        seeds = [b"grant", record_metadata.cid.as_bytes(), requester.as_ref(), owner.key().as_ref()],
        bump
    )]
    // On revoke, this account needs 'mut' and 'close'
    #[account(mut, close = owner, // Close attribute added for revoke scenario
        seeds = [b"grant", record_metadata.cid.as_bytes(), requester.as_ref(), owner.key().as_ref()],
        bump = access_grant.bump // Use stored bump on close
    )]
    pub access_grant: Account<'info, AccessGrant>, // Need this for revoke instruction too

    #[account(mut)]
    pub owner: Signer<'info>, // The record owner performing the action
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct CloseRecordMetadata<'info> {
    #[account(
        mut,
        close = owner, // Rent returned to the owner
        seeds = [b"record", owner.key().as_ref(), record_metadata.cid.as_bytes()],
        bump = record_metadata.bump, // Use stored bump
        constraint = record_metadata.owner == owner.key() @ DeziError::Unauthorized
    )]
    pub record_metadata: Account<'info, RecordMetadata>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

// --- Account Data Structures ---

#[account]
pub struct RecordMetadata {
    pub owner: Pubkey,      // 32 bytes - The patient's wallet address
    pub cid: String,        // Max 64 bytes assumed for CID (e.g., IPFS v1 Base32) - adjust if needed
    pub encrypted_data_hash: String, // Max 64 bytes assumed for SHA256 hash hex - adjust
    pub file_name: String,  // Max 100 bytes assumed for file name - adjust
    pub created_at: i64,    // 8 bytes - Unix timestamp
    pub bump: u8,           // 1 byte - PDA bump seed
}

impl RecordMetadata {
    // Calculate space: discriminator (8) + Pubkey (32) + String(len+data) + String + String + i64 + u8
    // Use generous estimates for strings: 4+64, 4+64, 4+100
    const LEN: usize = 8 + 32 + (4 + 64) + (4 + 64) + (4 + 100) + 8 + 1;
}

#[account]
pub struct AccessGrant {
    pub record_cid: String,  // Max 64 bytes - CID of the record access is granted to
    pub requester: Pubkey,   // 32 bytes - Wallet address granted access
    pub granter: Pubkey,     // 32 bytes - Wallet address who granted access (owner)
    pub re_encryption_key: String, // Max 256 bytes? Key encrypted for requester - adjust size
    pub granted_at: i64,     // 8 bytes - Unix timestamp
    pub bump: u8,            // 1 byte - PDA bump seed
}

impl AccessGrant {
    // Calculate space: discriminator (8) + String(4+64) + Pubkey(32) + Pubkey(32) + String(4+256) + i64(8) + u8(1)
    const LEN: usize = 8 + (4 + 64) + 32 + 32 + (4 + 256) + 8 + 1;
}

// --- Events ---

#[event]
pub struct RecordRegistered {
    owner: Pubkey,
    cid: String,
    encrypted_data_hash: String,
    file_name: String,
    timestamp: i64,
}

#[event]
pub struct AccessGranted {
    cid: String,
    granter: Pubkey,
    requester: Pubkey,
    granted_at: i64,
}

#[event]
pub struct AccessRevoked {
    cid: String,
    granter: Pubkey,
    requester: Pubkey,
    revoked_at: i64,
}

// --- Errors ---

#[error_code]
pub enum DeziError {
    #[msg("Unauthorized: Signer does not match owner.")]
    Unauthorized,
    #[msg("Invalid Access Grant Account.")]
    InvalidGrant,
    #[msg("String too long.")] // Example, add more specific errors as needed
    StringTooLong,
}