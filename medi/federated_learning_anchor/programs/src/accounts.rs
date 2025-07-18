use anchor_lang::prelude::*;

#[account]
pub struct State {
    pub round: u64,
}

#[account]
pub struct Participant {
    pub authority: Pubkey,
}

#[account]
pub struct ModelSubmission {
    pub participant: Pubkey,
    pub round: u64,
    pub model_hash: [u8; 32],
}