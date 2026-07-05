export const RAFFLE_ADDRESS =
  "0x1e058E56E75b72D0CcBcC2d169eAf937e65d5488" as const;
export const FLIP_ADDRESS = "0xcB6f6FB034e5e4Dc85672fC8A88dda193782DABE" as const;
export const SPIN_ADDRESS = "0x34b73f9C4f0b156296C551E78Eea503867860716" as const;
// Base Sepolia USDC address
export const OAR_COIN_ADDRESS = "0x5EF2370E0FB0444cC06A18476101D18aDc933b3D" as const;
export const USDC_ADDRESS =
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
export const FLIP_ABI = [{"inputs":[{"internalType":"address","name":"_oarCoin","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"SafeERC20FailedOperation","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"enum Flip.Side","name":"choice","type":"uint8"},{"indexed":false,"internalType":"enum Flip.Side","name":"result","type":"uint8"},{"indexed":false,"internalType":"bool","name":"won","type":"bool"}],"name":"Flipped","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"HouseFunded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"HouseWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"minBet","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxBetPercentage","type":"uint256"}],"name":"LimitsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"FEE_PERCENT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"enum Flip.Side","name":"choice","type":"uint8"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"flip","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"fundHouse","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"maxBetPercentage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minBet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"oarCoin","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_minBet","type":"uint256"},{"internalType":"uint256","name":"_maxBetPercentage","type":"uint256"}],"name":"updateLimits","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawHouse","outputs":[],"stateMutability":"nonpayable","type":"function"}] as  const
export const SPIN_ABI =[{"inputs":[{"internalType":"address","name":"_oarCoin","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"SafeERC20FailedOperation","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"HouseFunded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"HouseWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"minBet","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxBetPercentage","type":"uint256"}],"name":"LimitsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"roll","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"multiplier","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"payout","type":"uint256"}],"name":"Spun","type":"event"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"fundHouse","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"maxBetPercentage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minBet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"oarCoin","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"spin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tiers","outputs":[{"internalType":"uint256","name":"multiplier","type":"uint256"},{"internalType":"uint256","name":"upperRange","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_minBet","type":"uint256"},{"internalType":"uint256","name":"_maxBetPercentage","type":"uint256"}],"name":"updateLimits","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"multipliers","type":"uint256[]"},{"internalType":"uint256[]","name":"upperRanges","type":"uint256[]"}],"name":"updateTiers","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawHouse","outputs":[],"stateMutability":"nonpayable","type":"function"}] as const
export const RAFFLE_ABI = [{"inputs":[{"internalType":"address","name":"_usdc","type":"address"},{"internalType":"address","name":"_oarCoin","type":"address"},{"internalType":"address","name":"_vrfCoordinator","type":"address"},{"internalType":"bytes32","name":"_keyHash","type":"bytes32"},{"internalType":"uint256","name":"_subscriptionId","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"EnforcedPause","type":"error"},{"inputs":[],"name":"ExpectedPause","type":"error"},{"inputs":[],"name":"InsufficientDeposit","type":"error"},{"inputs":[],"name":"InvalidVRFRequest","type":"error"},{"inputs":[],"name":"NoPendingWithdrawal","type":"error"},{"inputs":[],"name":"NotEnoughPlayers","type":"error"},{"inputs":[{"internalType":"address","name":"have","type":"address"},{"internalType":"address","name":"want","type":"address"}],"name":"OnlyCoordinatorCanFulfill","type":"error"},{"inputs":[{"internalType":"address","name":"have","type":"address"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"coordinator","type":"address"}],"name":"OnlyOwnerOrCoordinator","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"inputs":[],"name":"RoundAlreadyEnded","type":"error"},{"inputs":[],"name":"RoundFull","type":"error"},{"inputs":[],"name":"RoundNotActive","type":"error"},{"inputs":[],"name":"RoundNotEnded","type":"error"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"SafeERC20FailedOperation","type":"error"},{"inputs":[],"name":"SameTokenAddress","type":"error"},{"inputs":[],"name":"TransferFailed","type":"error"},{"inputs":[],"name":"VRFAlreadyRequested","type":"error"},{"inputs":[],"name":"VRFPending","type":"error"},{"inputs":[],"name":"ZeroAddress","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"vrfCoordinator","type":"address"}],"name":"CoordinatorSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"enum Raffle.TokenType","name":"tokenType","type":"uint8"}],"name":"Deposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EthWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"ethAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"usdcAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"oarAmount","type":"uint256"}],"name":"FeesWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"OwnershipTransferRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":false,"internalType":"uint256","name":"ethAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"usdcAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"oarAmount","type":"uint256"}],"name":"Refunded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"}],"name":"RoundCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"startTime","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"endTime","type":"uint256"}],"name":"RoundStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"requestId","type":"uint256"}],"name":"VRFRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":true,"internalType":"address","name":"winner","type":"address"},{"indexed":false,"internalType":"uint256","name":"ethPrize","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"usdcPrize","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"oarPrize","type":"uint256"}],"name":"WinnerSelected","type":"event"},{"inputs":[],"name":"FEE_PERCENT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_PLAYERS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MIN_ETH_DEPOSIT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MIN_OAR_DEPOSIT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MIN_PLAYERS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MIN_USDC_DEPOSIT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ROUND_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"callbackGasLimit","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentRoundId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"depositETH","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"depositOARCOIN","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"depositUSDC","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"endRound","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getCurrentRound","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"prizePool","type":"uint256"},{"internalType":"uint256","name":"playerCount","type":"uint256"},{"internalType":"address","name":"winner","type":"address"},{"internalType":"enum Raffle.RoundStatus","name":"status","type":"uint8"},{"internalType":"uint256","name":"timeRemaining","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"address","name":"player","type":"address"}],"name":"getPlayerDeposit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"address","name":"player","type":"address"}],"name":"getPlayerTokenDeposits","outputs":[{"internalType":"uint256","name":"ethAmount","type":"uint256"},{"internalType":"uint256","name":"usdcAmount","type":"uint256"},{"internalType":"uint256","name":"oarAmount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"}],"name":"getRoundPlayers","outputs":[{"components":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct Raffle.Player[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"}],"name":"getRoundPools","outputs":[{"internalType":"uint256","name":"ethPool","type":"uint256"},{"internalType":"uint256","name":"usdcPool","type":"uint256"},{"internalType":"uint256","name":"oarPool","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"address","name":"player","type":"address"}],"name":"getWinChance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"keyHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"oarCoin","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"pendingEthWithdrawals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"playerDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"playerEthDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"playerOarDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"playerUsdcDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"requestId","type":"uint256"},{"internalType":"uint256[]","name":"randomWords","type":"uint256[]"}],"name":"rawFulfillRandomWords","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"requestConfirmations","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"roundEthPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"roundOarPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"roundPlayers","outputs":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"roundUsdcPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"rounds","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"prizePool","type":"uint256"},{"internalType":"uint256","name":"playerCount","type":"uint256"},{"internalType":"address","name":"winner","type":"address"},{"internalType":"enum Raffle.RoundStatus","name":"status","type":"uint8"},{"internalType":"bool","name":"vrfRequested","type":"bool"},{"internalType":"uint256","name":"vrfRequestId","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"s_vrfCoordinator","outputs":[{"internalType":"contract IVRFCoordinatorV2Plus","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_vrfCoordinator","type":"address"}],"name":"setCoordinator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"subscriptionId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalEthFeesCollected","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalOarFeesCollected","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalUsdcFeesCollected","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_keyHash","type":"bytes32"},{"internalType":"uint256","name":"_subscriptionId","type":"uint256"},{"internalType":"uint16","name":"_requestConfirmations","type":"uint16"},{"internalType":"uint32","name":"_callbackGasLimit","type":"uint32"}],"name":"updateVRFConfig","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"usdc","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"vrfRequestToRound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"withdrawFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawPendingEth","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}] as const;
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

// Convert dollar amount to USDC raw units (6 dec)
export function toUSDCUnits(dollars: number): bigint {
  return BigInt(Math.round(dollars * 10 ** USDC_DECIMALS));
}

// Convert USDC raw units to dollar amount (6 dec)
export function fromUSDCUnits(raw: bigint): number {
  return Number(raw) / 10 ** USDC_DECIMALS;
}

// OARCOIN has 18 decimals
export const OAR_DECIMALS = 18;

// Convert a human-readable OAR amount to raw wei-like units (18 dec)
export function toOARUnits(amount: number): bigint {
  // Use string-based conversion to avoid float precision issues
  const [whole, frac = ""] = amount.toString().split(".");
  const padded = frac.padEnd(OAR_DECIMALS, "0").slice(0, OAR_DECIMALS);
  return BigInt(whole) * BigInt(10 ** OAR_DECIMALS) + BigInt(padded);
}

// Convert raw OAR units (18 dec) to human-readable number
export function fromOARUnits(raw: bigint): number {
  return Number(raw) / 10 ** OAR_DECIMALS;
}

// Round status enum matching contract
export enum RoundStatus {
  Active = 0,
  PendingVRF = 1,
  Completed = 2,
  Cancelled = 3,
}

import { keccak256, toBytes } from "viem";

/**
 * Convert a DB room ID string (CUID) to a deterministic bytes32
 * for use as the on-chain private room identifier.
 */
export function roomIdToBytes32(roomId: string): `0x${string}` {
  return keccak256(toBytes(roomId));
}

/** Default private room duration in seconds (30 min). Used when drawTime is unknown. */
export const DEFAULT_PRIVATE_ROOM_DURATION_SECS = 1800;

/**
 * ABI fragment for the private room functions added in the upgraded Raffle contract.
 * Use alongside RAFFLE_ABI once the new contract is deployed.
 */
export const RAFFLE_PRIVATE_ROOM_ABI = [
  // ── Custom errors ────────────────────────────────────────────────────────────
  { inputs: [], name: "InvalidRoomId",        type: "error" },
  { inputs: [], name: "InvalidMinPlayers",     type: "error" },
  { inputs: [], name: "InvalidDuration",       type: "error" },
  { inputs: [], name: "MismatchedTokenType",   type: "error" },
  { inputs: [], name: "MismatchedStakeAmount", type: "error" },
  // ── Events ───────────────────────────────────────────────────────────────────
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: "bytes32", name: "roomId",    type: "bytes32" },
      { indexed: true,  internalType: "address", name: "winner",    type: "address" },
      { indexed: false, internalType: "uint256", name: "ethPrize",  type: "uint256" },
      { indexed: false, internalType: "uint256", name: "usdcPrize", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "oarPrize",  type: "uint256" },
    ],
    name: "PrivateWinnerSelected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: "bytes32", name: "roomId",    type: "bytes32" },
      { indexed: true,  internalType: "address", name: "player",    type: "address" },
      { indexed: false, internalType: "uint256", name: "amount",    type: "uint256" },
      { indexed: false, internalType: "uint8",   name: "tokenType", type: "uint8"   },
    ],
    name: "PrivateDeposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "bytes32", name: "roomId", type: "bytes32" }],
    name: "PrivateRoomCancelled",
    type: "event",
  },
  // ── Functions ─────────────────────────────────────────────────────────────────
  {
    inputs: [
      { internalType: "bytes32", name: "roomId",     type: "bytes32" },
      { internalType: "uint256", name: "minPlayers", type: "uint256" },
      { internalType: "uint256", name: "duration",   type: "uint256" },
    ],
    name: "depositPrivateETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "roomId",     type: "bytes32" },
      { internalType: "uint256", name: "amount",     type: "uint256" },
      { internalType: "uint256", name: "minPlayers", type: "uint256" },
      { internalType: "uint256", name: "duration",   type: "uint256" },
    ],
    name: "depositPrivateUSDC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "roomId",     type: "bytes32" },
      { internalType: "uint256", name: "amount",     type: "uint256" },
      { internalType: "uint256", name: "minPlayers", type: "uint256" },
      { internalType: "uint256", name: "duration",   type: "uint256" },
    ],
    name: "depositPrivateOARCOIN",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "roomId", type: "bytes32" }],
    name: "endPrivateRoom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
