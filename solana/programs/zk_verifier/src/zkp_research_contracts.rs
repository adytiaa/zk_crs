// ZKP Verification Contract (Solana, Anchor Framework)
use anchor_lang::prelude::*;

#[program]
pub mod zkp_verification {
    use super::*;

    pub fn verify_proof(ctx: Context<VerifyProof>, proof_data: Vec<u8>) -> Result<()> {
        // Dummy placeholder - integrate with a real ZKP verifier
        require!(proof_data.len() > 0, ZKPError::InvalidProof);

        // Store proof hash or mark as verified (as needed)
        ctx.accounts.verification_state.verified = true;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct VerifyProof<'info> {
    #[account(init_if_needed, payer = user, space = 8 + 1, seeds = [b"zkp", user.key().as_ref()], bump)]
    pub verification_state: Account<'info, VerificationState>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct VerificationState {
    pub verified: bool,
}

#[error_code]
pub enum ZKPError {
    #[msg("Invalid Zero-Knowledge Proof")]
    InvalidProof,
}


// Research Proposal Contract (Solana, Anchor Framework)
use anchor_lang::prelude::*;

#[program]
pub mod research_proposals {
    use super::*;

    pub fn submit_proposal(
        ctx: Context<SubmitProposal>,
        description: String,
        data_types: Vec<String>,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        proposal.researcher = ctx.accounts.researcher.key();
        proposal.description = description;
        proposal.data_types = data_types;
        proposal.status = ProposalStatus::Pending;
        Ok(())
    }

    pub fn update_proposal_status(
        ctx: Context<UpdateProposalStatus>,
        new_status: ProposalStatus,
    ) -> Result<()> {
        ctx.accounts.proposal.status = new_status;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SubmitProposal<'info> {
    #[account(init, payer = researcher, space = Proposal::SIZE)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub researcher: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateProposalStatus<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
}

#[account]
pub struct Proposal {
    pub researcher: Pubkey,
    pub description: String,
    pub data_types: Vec<String>,
    pub status: ProposalStatus,
}

impl Proposal {
    pub const SIZE: usize = 8 + 32 + 4 + 512 + 4 + (32 * 10) + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalStatus {
    Pending,
    Approved,
    Rejected,
}
