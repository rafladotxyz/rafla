# Contract Error Catalog

This document is based on the ABIs in `lib/contract.ts`.
The reasons below are inferred from the custom error names and the way the
front end calls each contract. For the exact revert conditions, the Solidity
source is still the final authority.

## Shared Errors

### `OwnableInvalidOwner`
- Seen in `Flip`, `Spin`, and `Raffle`.
- Likely reason: the contract was deployed or configured with an invalid owner
  address, or an ownership transfer was attempted with a bad target.
- User impact: admin-only flows may fail during deployment or configuration.

### `OwnableUnauthorizedAccount`
- Seen in `Flip`, `Spin`, and `Raffle`.
- Likely reason: a non-owner tried to call an admin-only function such as
  funding the house, updating limits, withdrawing fees, or changing config.
- User impact: admin controls should show a clear "not authorized" message.

### `ReentrancyGuardReentrantCall`
- Seen in all three contracts.
- Likely reason: a protected function was called while another guarded call was
  still executing.
- User impact: usually indicates a duplicate click, concurrent transaction, or
  contract-level protection kicking in.

### `SafeERC20FailedOperation`
- Seen in all three contracts.
- Likely reason: USDC approve/transfer/transferFrom failed.
- Typical causes:
  - insufficient balance
  - allowance not set correctly
  - token transfer rejected by the token contract
- User impact: deposit or payout flows can fail even if the game logic is valid.

## Raffle Errors

### `EnforcedPause`
- Likely reason: the raffle is paused and the call is blocked.
- User impact: deposits, settlement, and other active flows should be disabled
  or shown as unavailable.

### `ExpectedPause`
- Likely reason: a pause-only administrative function was called while the
  contract was not paused.
- User impact: admin tooling should hide or gate pause-only actions.

### `InsufficientDeposit`
- Likely reason: the caller tried to deposit less than the contract minimum.
- User impact: show the minimum deposit before the user signs.

### `InvalidVRFRequest`
- Likely reason: the provided VRF request id does not match the round or is no
  longer valid.
- User impact: settlement should fail with a "round randomness invalid" style
  message, not a raw revert string.

### `NoPlayersInRound`
- Likely reason: end-round or winner selection was attempted with zero players.
- User impact: the UI should prevent finalization when nobody has joined.

### `NotEnoughPlayers`
- Likely reason: the round was ended before the minimum player threshold was met.
- User impact: the UI should surface the required player count and current count.

### `RoundAlreadyEnded`
- Likely reason: a second close/settle action was attempted after completion.
- User impact: repeated settlement requests should be treated as idempotent or
  silently ignored client-side.

### `RoundNotActive`
- Likely reason: a deposit was attempted after the round stopped accepting bets.
- User impact: the UI should disable join/deposit actions when the round is not active.

### `RoundNotEnded`
- Likely reason: a winner selection or settlement call was attempted too early.
- User impact: show the countdown or remaining time and block premature actions.

### `VRFAlreadyRequested`
- Likely reason: randomness has already been requested for the current round.
- User impact: prevent double-clicking or duplicate settlement triggers.

## Flip Errors

The Flip ABI exposes only shared admin/token errors, so most game-specific
failures are likely surfaced as generic reverts unless the Solidity contract has
custom `require` messages.

Possible failure modes inferred from the function signatures:
- bet amount below `minBet`
- bet amount above the max-bet ratio
- house not funded enough to cover payouts
- invalid side/choice value
- allowance or balance failure on USDC approval/transfer

## Spin Errors

The Spin ABI exposes only shared admin/token errors, so similar generic failures
are likely unless the Solidity source adds more custom errors.

Possible failure modes inferred from the function signatures:
- bet amount below `minBet`
- bet amount above the max-bet ratio
- invalid tier configuration during admin updates
- house not funded enough to cover payouts
- allowance or balance failure on USDC approval/transfer

## Error-Handling Review

### What is good
- The UI already catches most contract calls and avoids crashing the page.
- Wallet rejection is partially suppressed so user-cancelled signatures do not
  always show as hard errors.
- USDC balance and minimum-bet checks are performed before writing on-chain.

### What needs improvement
- Raw revert text is currently shown to users in many paths.
- Contract-specific custom errors are not normalized into readable messages.
- Several API follow-up writes in `useGameState` are fire-and-forget, so a room
  record or settlement failure can fail silently.
- Some catch blocks log errors but do not surface a fallback message to the UI.

### Recommended next step
- Add a shared error normalizer for `useContractGame` and route all on-chain
  errors through it.
- Make API persistence failures explicit in the UI where the action depends on
  them.
- Keep raw error details in console logs, but show short action-oriented
  messages to users.
