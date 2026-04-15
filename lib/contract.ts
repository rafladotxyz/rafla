export const RAFFLE_ADDRESS =
  "0x8057E4da875a31329c9b13BE4a7C808fcB211626" as const;

// Base Sepolia USDC address
export const USDC_ADDRESS =
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;

export const RAFFLE_ABI = [
  // ── Write functions ──────────────────────────────────────────────────
  {
    name: "depositETH",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    name: "depositUSDC",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "endRound",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "fulfillRandomWords",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "requestId", type: "uint256" },
      { name: "randomWords", type: "uint256[]" },
    ],
    outputs: [],
  },
  {
    name: "selectWinnerManual",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "roundId", type: "uint256" }],
    outputs: [],
  },
  // ── Read functions ───────────────────────────────────────────────────
  {
    name: "getCurrentRound",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "prizePool", type: "uint256" },
      { name: "playerCount", type: "uint256" },
      { name: "winner", type: "address" },
      { name: "status", type: "uint8" },
      { name: "timeRemaining", type: "uint256" },
    ],
  },
  {
    name: "getRoundPlayers",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "roundId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "addr", type: "address" },
          { name: "amount", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getPlayerDeposit",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "roundId", type: "uint256" },
      { name: "player", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getWinChance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "roundId", type: "uint256" },
      { name: "player", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "currentRoundId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // ── Events ───────────────────────────────────────────────────────────
  {
    name: "RoundStarted",
    type: "event",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "startTime", type: "uint256", indexed: false },
      { name: "endTime", type: "uint256", indexed: false },
    ],
  },
  {
    name: "Deposited",
    type: "event",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "isUsdc", type: "bool", indexed: false },
    ],
  },
  {
    name: "WinnerSelected",
    type: "event",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: true },
      { name: "prizeAmount", type: "uint256", indexed: false },
      { name: "fee", type: "uint256", indexed: false },
    ],
  },
  {
    name: "VRFRequested",
    type: "event",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "requestId", type: "uint256", indexed: false },
    ],
  },
  {
    name: "RoundCancelled",
    type: "event",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "refundedAmount", type: "uint256", indexed: false },
    ],
  },
] as const;

// ERC-20 approve ABI (needed before depositUSDC)
export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// USDC has 6 decimals
export const USDC_DECIMALS = 6;

// Convert dollar amount to USDC raw units
export function toUSDCUnits(dollars: number): bigint {
  return BigInt(Math.round(dollars * 10 ** USDC_DECIMALS));
}

// Convert USDC raw units to dollar amount
export function fromUSDCUnits(raw: bigint): number {
  return Number(raw) / 10 ** USDC_DECIMALS;
}

// Round status enum matching contract
export enum RoundStatus {
  Active = 0,
  PendingVRF = 1,
  Completed = 2,
  Cancelled = 3,
}
