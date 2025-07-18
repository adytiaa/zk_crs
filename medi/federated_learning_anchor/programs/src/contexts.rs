use anchor_lang::prelude::*;
use crate::{State, Participant, ModelSubmission};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 8)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterParticipant<'info> {
    #[account(init, payer = authority, space = 8 + 32)]
    pub participant: Account<'info, Participant>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateState<'info> {
    #[account(mut)]
    pub state: Account<'info, State>,
}

#[derive(Accounts)]
pub struct SubmitModel<'info> {
    #[account(mut)]
    pub participant: Account<'info, Participant>,
    #[account(init, payer = signer, space = 8 + 32 + 8 + 32)]
    pub submission: Account<'info, ModelSubmission>,
    #[account(mut)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}