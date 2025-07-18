use anchor_lang::prelude::*;
pub mod accounts;
pub mod contexts;
use accounts::*;
use contexts::*;

declare_id!("Fg6PaFpoGXkYsidMpWxqSWuD6Fv4dFNT6HExdYAX1ZGu");

#[program]
pub mod federated_learning_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.round = 0;
        Ok(())
    }

    pub fn register_participant(ctx: Context<RegisterParticipant>) -> Result<()> {
        let participant = &mut ctx.accounts.participant;
        participant.authority = *ctx.accounts.authority.key;
        Ok(())
    }

    pub fn start_round(ctx: Context<UpdateState>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.round += 1;
        Ok(())
    }

    pub fn submit_model(ctx: Context<SubmitModel>, model_hash: [u8; 32]) -> Result<()> {
        let submission = &mut ctx.accounts.submission;
        submission.participant = ctx.accounts.participant.key();
        submission.model_hash = model_hash;
        submission.round = ctx.accounts.state.round;
        Ok(())
    }
}