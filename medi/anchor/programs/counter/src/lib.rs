// /medi/anchor/programs/medicrypt/src/lib.rs
use anchor_lang::prelude::*;

// IMPORTANT: Replace this with your program's actual ID after first deployment
// You can get this by running `solana address -k target/deploy/medicrypt-keypair.json`
// after `anchor build` and `anchor deploy`.
declare_id!("2khvaPnKAhpdCi31KWd5ZLYsWBQxjs9v3J1HAbC1hEqP"); // Temporary valid placeholder

#[program]
pub mod medicrypt {
    use super::*;

    /// Registers metadata for a new encrypted medical record.
    /// The owner is implicitly the signer (patient).
    pub fn register_record(
        ctx: Context<RegisterRecord>,
        cid: String,          // Content Identifier from off-chain storage (e.g., IPFS)
        encrypted_data_hash: String, // SHA-256 hash of the *encrypted* data
        file_name: String,    // Original file name (encrypted or plaintext, user's choice for display)
        initial_symmetric_key_encrypted_for_owner: String, // Symmetric key, encrypted with owner's public key
    ) -> Result<()> {
        let record_metadata = &mut ctx.accounts.record_metadata;
        record_metadata.owner = ctx.accounts.owner.key();
        record_metadata.cid = cid.clone();
        record_metadata.encrypted_data_hash = encrypted_data_hash;
        record_metadata.file_name = file_name;
        record_metadata.created_at = Clock::get()?.unix_timestamp;
        record_metadata.bump = ctx.bumps.record_metadata;
        record_metadata.is_active = true;
        // Store the owner's version of the encrypted symmetric key
        record_metadata.owner_encrypted_symmetric_key = initial_symmetric_key_encrypted_for_owner;


        emit!(RecordRegistered {
            record_pda: record_metadata.key(),
            owner: record_metadata.owner,
            cid: record_metadata.cid.clone(),
            encrypted_data_hash: record_metadata.encrypted_data_hash.clone(),
            file_name: record_metadata.file_name.clone(),
            timestamp: record_metadata.created_at,
        });

        Ok(())
    }

    /// Grants access to a specific record for a requester.
    /// Only the owner of the record can call this.
    /// The `re_encrypted_symmetric_key` is the original symmetric key,
    /// re-encrypted by the owner (off-chain) using the requester's public key.
    pub fn grant_access(
        ctx: Context<ManageAccess>,
        requester_pubkey: Pubkey,
        re_encrypted_symmetric_key: String, // Symmetric key for the file, re-encrypted for the requester
        // Optional: purpose_of_access: String,
        // Optional: expiry_timestamp: i64,
    ) -> Result<()> {
        let record_metadata = &ctx.accounts.record_metadata;
        let access_grant = &mut ctx.accounts.access_grant;

        require_keys_eq!(ctx.accounts.owner.key(), record_metadata.owner, MedicryptError::UnauthorizedOwner);
        require!(record_metadata.is_active, MedicryptError::RecordNotActive);

        access_grant.record_pda = record_metadata.key();
        access_grant.requester = requester_pubkey;
        access_grant.granter = record_metadata.owner;
        access_grant.re_encrypted_symmetric_key = re_encrypted_symmetric_key;
        access_grant.granted_at = Clock::get()?.unix_timestamp;
        access_grant.bump = ctx.bumps.access_grant;
        access_grant.is_active = true;
        // access_grant.purpose = purpose_of_access;
        // access_grant.expires_at = expiry_timestamp;

        emit!(AccessGranted {
            grant_pda: access_grant.key(),
            record_pda: access_grant.record_pda,
            granter: access_grant.granter,
            requester: access_grant.requester,
            granted_at: access_grant.granted_at,
        });

        Ok(())
    }

    /// Revokes access previously granted.
    /// Can be called by the record owner (granter) or the requester (if they want to relinquish access).
    /// For simplicity here, only owner revokes.
    pub fn revoke_access(ctx: Context<ManageAccess>) -> Result<()> {
        let record_metadata = &ctx.accounts.record_metadata;
        let access_grant = &mut ctx.accounts.access_grant;

        // Ensure signer is the owner OR the requester (if we allowed self-revoke)
        require_keys_eq!(ctx.accounts.owner.key(), record_metadata.owner, MedicryptError::UnauthorizedOwner);
        require_keys_eq!(access_grant.granter, record_metadata.owner, MedicryptError::InvalidGrantState);
        require!(access_grant.is_active, MedicryptError::GrantNotActive);

        access_grant.is_active = false; // Soft delete by marking inactive

        emit!(AccessRevoked {
            grant_pda: access_grant.key(),
            record_pda: access_grant.record_pda,
            granter: access_grant.granter,
            requester: access_grant.requester,
            revoked_at: Clock::get()?.unix_timestamp,
        });
        // Note: We are not closing the account to preserve history.
        // A separate 'close_grant_account' could be added if rent recovery is critical.
        Ok(())
    }

    /// Marks a record metadata account as inactive. Only the owner can do this.
    /// This is a "soft delete". Associated AccessGrant accounts are not automatically affected
    /// but new grants cannot be made for an inactive record.
    pub fn deactivate_record(ctx: Context<DeactivateRecord>) -> Result<()> {
        let record_metadata = &mut ctx.accounts.record_metadata;
        require_keys_eq!(ctx.accounts.owner.key(), record_metadata.owner, MedicryptError::UnauthorizedOwner);
        require!(record_metadata.is_active, MedicryptError::RecordNotActive);

        record_metadata.is_active = false;

        emit!(RecordDeactivated {
            record_pda: record_metadata.key(),
            owner: record_metadata.owner,
            deactivated_at: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }
}

// --- Account Contexts ---

#[derive(Accounts)]
#[instruction(cid: String)] // Used in PDA seed derivation
pub struct RegisterRecord<'info> {
    #[account(
        init,
        payer = owner,
        space = RecordMetadata::LEN,
        seeds = [b"record", owner.key().as_ref(), cid.as_bytes()], // CID is unique per owner for a given file content
        bump
    )]
    pub record_metadata: Account<'info, RecordMetadata>,
    #[account(mut)]
    pub owner: Signer<'info>, // Patient
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(requester_pubkey: Pubkey)] // Used in PDA seed derivation
pub struct ManageAccess<'info> {
    // RecordMetadata PDA is derived using its original owner and CID
    // The CID needs to be passed as an argument or fetched from AccessGrant if modifying existing
    #[account(
        mut, // may need mut if record_metadata itself is updated by access changes
        seeds = [b"record", record_metadata.owner.as_ref(), record_metadata.cid.as_bytes()],
        bump = record_metadata.bump,
        constraint = record_metadata.owner == owner.key() @ MedicryptError::UnauthorizedOwner
    )]
    pub record_metadata: Account<'info, RecordMetadata>,

    #[account(
        init_if_needed,
        payer = owner,  // Payer for grant creation
        space = AccessGrant::LEN,
        seeds = [b"grant", record_metadata.key().as_ref(), requester_pubkey.as_ref()], // Grant is unique per record_pda and requester
        bump
    )]
    // For revoke_access, account needs to be mutable.
    // We will not 'close' the account to keep history, but mark it inactive.
    // If closing, the 'close = owner' attribute would be here.
    pub access_grant: Account<'info, AccessGrant>,

    #[account(mut)]
    pub owner: Signer<'info>, // The record owner performing the grant/revoke action
    /// CHECK: The requester account. Not signing for grant/revoke by owner. Used for PDA derivation.
    /// If requester could revoke, this would be a Signer.
    // pub requester_account_info: AccountInfo<'info>, // Not strictly needed if requester_pubkey is passed
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct DeactivateRecord<'info> {
    #[account(
        mut,
        seeds = [b"record", owner.key().as_ref(), record_metadata.cid.as_bytes()],
        bump = record_metadata.bump,
        constraint = record_metadata.owner == owner.key() @ MedicryptError::UnauthorizedOwner
    )]
    pub record_metadata: Account<'info, RecordMetadata>,
    #[account(mut)]
    pub owner: Signer<'info>,
}


// --- Account Data Structures ---

#[account]
pub struct RecordMetadata {
    pub owner: Pubkey,      // 32 bytes - Patient's wallet address
    pub cid: String,        // Max 64 bytes for CID (e.g., IPFS v1 Base58BTC)
    pub encrypted_data_hash: String, // Max 64 bytes for SHA256 hash hex
    pub file_name: String,  // Max 100 bytes for file name
    pub created_at: i64,    // 8 bytes - Unix timestamp
    pub owner_encrypted_symmetric_key: String, // Max 256 bytes for base64/hex encoded encrypted key
    pub is_active: bool,    // 1 byte
    pub bump: u8,           // 1 byte - PDA bump seed
}

impl RecordMetadata {
    // Discriminator (8) + owner(32) + cid(4+64) + hash(4+64) + filename(4+100) + created_at(8) + key(4+256) + is_active(1) + bump(1)
    const LEN: usize = 8 + 32 + (4 + 64) + (4 + 64) + (4 + 100) + 8 + (4 + 256) + 1 + 1;
}

#[account]
pub struct AccessGrant {
    pub record_pda: Pubkey,   // 32 bytes - PDA of the RecordMetadata this grant refers to
    pub requester: Pubkey,    // 32 bytes - Wallet address granted access
    pub granter: Pubkey,      // 32 bytes - Wallet address who granted access (owner of record)
    pub re_encrypted_symmetric_key: String, // Max 256 bytes - Symmetric key, re-encrypted for the requester
    pub granted_at: i64,      // 8 bytes - Unix timestamp
    // pub purpose: String, // Optional: Max 100 bytes
    // pub expires_at: i64, // Optional: 8 bytes
    pub is_active: bool,      // 1 byte
    pub bump: u8,             // 1 byte - PDA bump seed
}

impl AccessGrant {
    // Discriminator (8) + record_pda(32) + requester(32) + granter(32) + key(4+256) + granted_at(8) + is_active(1) + bump(1)
    // + purpose(4+100) + expires_at(8) if added
    const LEN: usize = 8 + 32 + 32 + 32 + (4 + 256) + 8 + 1 + 1;
}

// --- Events ---

#[event]
pub struct RecordRegistered {
    record_pda: Pubkey,
    owner: Pubkey,
    cid: String,
    encrypted_data_hash: String,
    file_name: String,
    timestamp: i64,
}

#[event]
pub struct AccessGranted {
    grant_pda: Pubkey,
    record_pda: Pubkey,
    granter: Pubkey,
    requester: Pubkey,
    granted_at: i64,
}

#[event]
pub struct AccessRevoked {
    grant_pda: Pubkey,
    record_pda: Pubkey,
    granter: Pubkey,
    requester: Pubkey,
    revoked_at: i64,
}

#[event]
pub struct RecordDeactivated {
    record_pda: Pubkey,
    owner: Pubkey,
    deactivated_at: i64,
}

// --- Errors ---

#[error_code]
pub enum MedicryptError {
    #[msg("Unauthorized: Signer is not the owner of the record.")]
    UnauthorizedOwner,
    #[msg("Record is not active. Operations cannot be performed.")]
    RecordNotActive,
    #[msg("Access grant is not active.")]
    GrantNotActive,
    #[msg("Invalid grant state for operation.")]
    InvalidGrantState,
    #[msg("String is too long for defined account space.")]
    StringTooLong, // Example, can be more specific
}
