const CONTRACT_ERROR_MAP: Record<string, string> = {
  OwnableInvalidOwner: "Contract owner is misconfigured.",
  OwnableUnauthorizedAccount:
    "You are not authorized to perform this action.",
  ReentrancyGuardReentrantCall:
    "Another transaction is already in progress. Wait and try again.",
  SafeERC20FailedOperation:
    "USDC transfer or approval failed. Check your balance and allowance.",
  EnforcedPause: "This contract is paused right now.",
  ExpectedPause: "This action can only be performed while the contract is paused.",
  InsufficientDeposit: "The deposit is below the minimum required amount.",
  InvalidVRFRequest: "The randomness request is invalid or no longer active.",
  NoPlayersInRound: "There are no players in this round yet.",
  NotEnoughPlayers:
    "Not enough players have joined this round to continue yet.",
  RoundAlreadyEnded: "This round has already ended.",
  RoundNotActive: "This round is not active right now.",
  RoundNotEnded: "The round has not ended yet.",
  VRFAlreadyRequested: "Randomness has already been requested for this round.",
  "0x0f5eeea6": "This round has already ended. Wait for the new round to start.",
};

const USER_REJECTION_PATTERNS = [
  /user rejected/i,
  /rejected the request/i,
  /request rejected/i,
  /denied/i,
];

const LOW_LEVEL_PATTERNS: Array<[RegExp, string]> = [
  [/insufficient funds/i, "Insufficient wallet balance."],
  [/allowance/i, "USDC approval is missing or too small."],
  [/exceeds balance/i, "Your wallet balance is too low."],
  [/execution reverted/i, "The transaction was reverted by the contract."],
  [/returned no data/i, "The token contract could not be read on the current network. Switch to Base Sepolia and try again."],
  [/cannot decode zero data/i, "The token contract could not be read on the current network. Switch to Base Sepolia and try again."],
  [/address is not a contract/i, "The token contract address is invalid on the current network."],
];

function collectMessage(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) {
    const parts = [
      error.message,
      (error as { shortMessage?: string }).shortMessage,
      (error as { details?: string }).details,
      collectMessage((error as { cause?: unknown }).cause),
    ];
    return parts.filter(Boolean).join(" | ");
  }
  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    const parts = [
      typeof record.message === "string" ? record.message : "",
      typeof record.shortMessage === "string" ? record.shortMessage : "",
      typeof record.details === "string" ? record.details : "",
      collectMessage(record.cause),
    ];
    return parts.filter(Boolean).join(" | ");
  }
  return String(error);
}

export function normalizeContractError(
  error: unknown,
  fallback = "Transaction failed",
): { message: string; isUserRejected: boolean } {
  const message = collectMessage(error);

  if (!message) {
    return { message: fallback, isUserRejected: false };
  }

  if (USER_REJECTION_PATTERNS.some((pattern) => pattern.test(message))) {
    return { message, isUserRejected: true };
  }

  const mapped = Object.entries(CONTRACT_ERROR_MAP).find(([key]) =>
    message.includes(key),
  );
  if (mapped) {
    return { message: mapped[1], isUserRejected: false };
  }

  const lowLevel = LOW_LEVEL_PATTERNS.find(([pattern]) => pattern.test(message));
  if (lowLevel) {
    return { message: lowLevel[1], isUserRejected: false };
  }

  return { message, isUserRejected: false };
}
