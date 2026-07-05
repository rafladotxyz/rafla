// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Chainlink VRF v2.5
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";

// OpenZeppelin
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Raffle
 * @author Raflr by Web3Nigeria
 * @notice A provably fair raffle where players deposit ETH, USDC, or OARCOIN.
 *         Randomness is sourced from Chainlink VRF v2.5.
 *         Supports both global public rounds and isolated private rooms.
 *
 * Base Sepolia addresses:
 *   VRF Coordinator: 0x5c210ef41cd1a72de73bf76ec39637bb0d3d7bee
 *   Key Hash:        0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71
 *   USDC:            0x036CbD53842c5426634e7929541eC2318f3dCF7e
 *   OARCOIN:         0x5EF2370E0FB0444cC06A18476101D18aDc933b3D
 */
contract Raffle is VRFConsumerBaseV2Plus, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============ Structs ============
    struct Player {
        address addr;
        uint256 amount; // combined raw deposit weight for win probability
    }

    struct Round {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 prizePool; // sum of all raw deposits (used for weighted selection)
        uint256 playerCount;
        address winner;
        RoundStatus status;
        bool vrfRequested;
        uint256 vrfRequestId;
    }

    struct PrivateRoom {
        bytes32 roomId;
        TokenType tokenType;
        uint256 stakeAmount;
        uint256 minPlayers;
        uint256 endTime;
        uint256 prizePool;
        address winner;
        bool vrfRequested;
        uint256 vrfRequestId;
        bool settled;
        bool cancelled;
        uint256 playerCount;
    }

    struct PrivatePlayer {
        address addr;
        uint256 amount;
    }

    enum RoundStatus {
        Active,
        PendingVRF,
        Completed,
        Cancelled
    }

    enum TokenType {
        ETH,
        USDC,
        OARCOIN
    }

    // ============ Constants ============
    uint256 public constant ROUND_DURATION = 3 minutes;
    uint256 public constant MIN_PLAYERS = 3;
    uint256 public constant MAX_PLAYERS = 200;
    uint256 public constant FEE_PERCENT = 5;
    uint256 public constant MIN_ETH_DEPOSIT = 0.0001 ether;
    uint256 public constant MIN_USDC_DEPOSIT = 100000;  // 0.1 USDC (6 decimals)
    uint256 public constant MIN_OAR_DEPOSIT  = 1 * 1e18; // 1 OARCOIN (18 decimals)

    // ============ Token Addresses ============
    IERC20 public immutable usdc;
    IERC20 public immutable oarCoin;

    // ============ VRF Configuration ============
    bytes32 public keyHash;
    uint256 public subscriptionId;
    uint16  public requestConfirmations = 3;
    uint32  public callbackGasLimit     = 500000; // covers winner selection + 3 token transfers

    // ============ State Variables ============
    uint256 public currentRoundId;

    // Per-round token pools (Public game)
    mapping(uint256 => uint256) public roundEthPool;
    mapping(uint256 => uint256) public roundUsdcPool;
    mapping(uint256 => uint256) public roundOarPool;

    // Per-player per-round token deposits (Public game)
    mapping(uint256 => mapping(address => uint256)) public playerEthDeposits;
    mapping(uint256 => mapping(address => uint256)) public playerUsdcDeposits;
    mapping(uint256 => mapping(address => uint256)) public playerOarDeposits;

    // Combined weight per player (Public game)
    mapping(uint256 => mapping(address => uint256)) public playerDeposits;

    // O(1) index lookup — 1-based so 0 means "not in array" (Public game)
    mapping(uint256 => mapping(address => uint256)) private playerIndex;

    mapping(uint256 => Round)   public rounds;
    mapping(uint256 => Player[]) public roundPlayers;
    mapping(uint256 => uint256) public vrfRequestToRound;

    // ============ Private Rooms State Variables ============
    mapping(bytes32 => PrivateRoom) public privateRooms;
    mapping(bytes32 => PrivatePlayer[]) public privateRoomPlayers;
    mapping(bytes32 => mapping(address => uint256)) public privatePlayerIndex;
    mapping(bytes32 => mapping(address => uint256)) public playerPrivateDeposits;
    
    // Per-player per-room token deposits (needed for refunds)
    mapping(bytes32 => mapping(address => uint256)) public playerPrivateEthDeposits;
    mapping(bytes32 => mapping(address => uint256)) public playerPrivateUsdcDeposits;
    mapping(bytes32 => mapping(address => uint256)) public playerPrivateOarDeposits;
    
    mapping(uint256 => bytes32) public vrfRequestToPrivateRoom;

    // Accumulated fees per token
    uint256 public totalEthFeesCollected;
    uint256 public totalUsdcFeesCollected;
    uint256 public totalOarFeesCollected;

    // Pull-payment ETH ledger — covers refunds and any failed prize pushes
    mapping(address => uint256) public pendingEthWithdrawals;

    // ============ Events ============
    event RoundStarted(uint256 indexed roundId, uint256 startTime, uint256 endTime);
    event Deposited(uint256 indexed roundId, address indexed player, uint256 amount, TokenType tokenType);
    event WinnerSelected(uint256 indexed roundId, address indexed winner, uint256 ethPrize, uint256 usdcPrize, uint256 oarPrize);
    event RoundCancelled(uint256 indexed roundId);
    event Refunded(uint256 indexed roundId, address indexed player, uint256 ethAmount, uint256 usdcAmount, uint256 oarAmount);
    event VRFRequested(uint256 indexed roundId, uint256 requestId);
    event FeesWithdrawn(address indexed to, uint256 ethAmount, uint256 usdcAmount, uint256 oarAmount);
    event EthWithdrawn(address indexed to, uint256 amount);

    // Private Room Events
    event PrivateDeposited(bytes32 indexed roomId, address indexed player, uint256 amount, TokenType tokenType);
    event PrivateWinnerSelected(bytes32 indexed roomId, address indexed winner, uint256 ethPrize, uint256 usdcPrize, uint256 oarPrize);
    event PrivateRoomCancelled(bytes32 indexed roomId);
    event PrivateRefunded(bytes32 indexed roomId, address indexed player, uint256 ethAmount, uint256 usdcAmount, uint256 oarAmount);
    event PrivateVRFRequested(bytes32 indexed roomId, uint256 requestId);

    // ============ Errors ============
    error RoundNotActive();
    error RoundNotEnded();
    error InsufficientDeposit();
    error NotEnoughPlayers();
    error RoundAlreadyEnded();
    error InvalidVRFRequest();
    error VRFAlreadyRequested();
    error VRFPending();
    error TransferFailed();
    error RoundFull();
    // ZeroAddress() is inherited from VRFConsumerBaseV2Plus
    error SameTokenAddress();
    error NoPendingWithdrawal();

    // Private Room Errors
    error InvalidRoomId();
    error InvalidMinPlayers();
    error InvalidDuration();
    error MismatchedTokenType();
    error MismatchedStakeAmount();

    // ============ Constructor ============
    constructor(
        address _usdc,
        address _oarCoin,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        if (_usdc == address(0) || _oarCoin == address(0) || _vrfCoordinator == address(0))
            revert ZeroAddress();
        if (_usdc == _oarCoin) revert SameTokenAddress();

        usdc         = IERC20(_usdc);
        oarCoin      = IERC20(_oarCoin);
        keyHash      = _keyHash;
        subscriptionId = _subscriptionId;

        _startNewRound();
    }

    // ============ External Deposit Functions (Public Game) ============

    function depositETH() external payable nonReentrant whenNotPaused {
        if (msg.value < MIN_ETH_DEPOSIT) revert InsufficientDeposit();

        Round storage round = rounds[currentRoundId];
        if (round.status != RoundStatus.Active) revert RoundNotActive();
        if (block.timestamp >= round.endTime) revert RoundAlreadyEnded();
        if (round.playerCount >= MAX_PLAYERS && playerDeposits[currentRoundId][msg.sender] == 0)
            revert RoundFull();

        roundEthPool[currentRoundId]                        += msg.value;
        playerEthDeposits[currentRoundId][msg.sender]       += msg.value;
        _processDeposit(currentRoundId, msg.sender, msg.value);

        emit Deposited(currentRoundId, msg.sender, msg.value, TokenType.ETH);
    }

    function depositUSDC(uint256 amount) external nonReentrant whenNotPaused {
        if (amount < MIN_USDC_DEPOSIT) revert InsufficientDeposit();

        Round storage round = rounds[currentRoundId];
        if (round.status != RoundStatus.Active) revert RoundNotActive();
        if (block.timestamp >= round.endTime) revert RoundAlreadyEnded();
        if (round.playerCount >= MAX_PLAYERS && playerDeposits[currentRoundId][msg.sender] == 0)
            revert RoundFull();

        usdc.safeTransferFrom(msg.sender, address(this), amount);
        roundUsdcPool[currentRoundId]                       += amount;
        playerUsdcDeposits[currentRoundId][msg.sender]      += amount;
        _processDeposit(currentRoundId, msg.sender, amount);

        emit Deposited(currentRoundId, msg.sender, amount, TokenType.USDC);
    }

    function depositOARCOIN(uint256 amount) external nonReentrant whenNotPaused {
        if (amount < MIN_OAR_DEPOSIT) revert InsufficientDeposit();

        Round storage round = rounds[currentRoundId];
        if (round.status != RoundStatus.Active) revert RoundNotActive();
        if (block.timestamp >= round.endTime) revert RoundAlreadyEnded();
        if (round.playerCount >= MAX_PLAYERS && playerDeposits[currentRoundId][msg.sender] == 0)
            revert RoundFull();

        oarCoin.safeTransferFrom(msg.sender, address(this), amount);
        roundOarPool[currentRoundId]                        += amount;
        playerOarDeposits[currentRoundId][msg.sender]       += amount;
        _processDeposit(currentRoundId, msg.sender, amount);

        emit Deposited(currentRoundId, msg.sender, amount, TokenType.OARCOIN);
    }

    // ============ External Deposit Functions (Private Rooms) ============

    function depositPrivateETH(
        bytes32 roomId,
        uint256 minPlayers,
        uint256 duration
    ) external payable nonReentrant whenNotPaused {
        if (roomId == bytes32(0)) revert InvalidRoomId();

        PrivateRoom storage room = privateRooms[roomId];

        if (room.endTime == 0) {
            if (msg.value < MIN_ETH_DEPOSIT) revert InsufficientDeposit();
            if (minPlayers < MIN_PLAYERS || minPlayers > MAX_PLAYERS) revert InvalidMinPlayers();
            if (duration == 0) revert InvalidDuration();

            room.roomId = roomId;
            room.tokenType = TokenType.ETH;
            room.stakeAmount = msg.value;
            room.minPlayers = minPlayers;
            room.endTime = block.timestamp + duration;
        } else {
            if (room.tokenType != TokenType.ETH) revert MismatchedTokenType();
            if (msg.value != room.stakeAmount) revert MismatchedStakeAmount();
            if (room.settled || room.cancelled || room.vrfRequested) revert RoundAlreadyEnded();
            if (block.timestamp >= room.endTime) revert RoundAlreadyEnded();
            if (room.playerCount >= MAX_PLAYERS && playerPrivateDeposits[roomId][msg.sender] == 0)
                revert RoundFull();
        }

        playerPrivateEthDeposits[roomId][msg.sender] += msg.value;
        _processPrivateDeposit(roomId, msg.sender, msg.value);

        emit PrivateDeposited(roomId, msg.sender, msg.value, TokenType.ETH);
    }

    function depositPrivateUSDC(
        bytes32 roomId,
        uint256 amount,
        uint256 minPlayers,
        uint256 duration
    ) external nonReentrant whenNotPaused {
        if (roomId == bytes32(0)) revert InvalidRoomId();

        PrivateRoom storage room = privateRooms[roomId];

        if (room.endTime == 0) {
            if (amount < MIN_USDC_DEPOSIT) revert InsufficientDeposit();
            if (minPlayers < MIN_PLAYERS || minPlayers > MAX_PLAYERS) revert InvalidMinPlayers();
            if (duration == 0) revert InvalidDuration();

            room.roomId = roomId;
            room.tokenType = TokenType.USDC;
            room.stakeAmount = amount;
            room.minPlayers = minPlayers;
            room.endTime = block.timestamp + duration;
        } else {
            if (room.tokenType != TokenType.USDC) revert MismatchedTokenType();
            if (amount != room.stakeAmount) revert MismatchedStakeAmount();
            if (room.settled || room.cancelled || room.vrfRequested) revert RoundAlreadyEnded();
            if (block.timestamp >= room.endTime) revert RoundAlreadyEnded();
            if (room.playerCount >= MAX_PLAYERS && playerPrivateDeposits[roomId][msg.sender] == 0)
                revert RoundFull();
        }

        usdc.safeTransferFrom(msg.sender, address(this), amount);
        playerPrivateUsdcDeposits[roomId][msg.sender] += amount;
        _processPrivateDeposit(roomId, msg.sender, amount);

        emit PrivateDeposited(roomId, msg.sender, amount, TokenType.USDC);
    }

    function depositPrivateOARCOIN(
        bytes32 roomId,
        uint256 amount,
        uint256 minPlayers,
        uint256 duration
    ) external nonReentrant whenNotPaused {
        if (roomId == bytes32(0)) revert InvalidRoomId();

        PrivateRoom storage room = privateRooms[roomId];

        if (room.endTime == 0) {
            if (amount < MIN_OAR_DEPOSIT) revert InsufficientDeposit();
            if (minPlayers < MIN_PLAYERS || minPlayers > MAX_PLAYERS) revert InvalidMinPlayers();
            if (duration == 0) revert InvalidDuration();

            room.roomId = roomId;
            room.tokenType = TokenType.OARCOIN;
            room.stakeAmount = amount;
            room.minPlayers = minPlayers;
            room.endTime = block.timestamp + duration;
        } else {
            if (room.tokenType != TokenType.OARCOIN) revert MismatchedTokenType();
            if (amount != room.stakeAmount) revert MismatchedStakeAmount();
            if (room.settled || room.cancelled || room.vrfRequested) revert RoundAlreadyEnded();
            if (block.timestamp >= room.endTime) revert RoundAlreadyEnded();
            if (room.playerCount >= MAX_PLAYERS && playerPrivateDeposits[roomId][msg.sender] == 0)
                revert RoundFull();
        }

        oarCoin.safeTransferFrom(msg.sender, address(this), amount);
        playerPrivateOarDeposits[roomId][msg.sender] += amount;
        _processPrivateDeposit(roomId, msg.sender, amount);

        emit PrivateDeposited(roomId, msg.sender, amount, TokenType.OARCOIN);
    }

    // ============ Round Management (Public Game) ============

    /**
     * @notice End the current round. Requests VRF randomness if enough players joined,
     *         otherwise cancels and refunds everyone.
     */
    function endRound() external nonReentrant {
        Round storage round = rounds[currentRoundId];

        if (round.status != RoundStatus.Active)  revert RoundNotActive();
        if (block.timestamp < round.endTime)      revert RoundNotEnded();
        if (round.vrfRequested)                   revert VRFAlreadyRequested();

        if (round.playerCount < MIN_PLAYERS) {
            _cancelRound(currentRoundId);
        } else {
            _requestRandomWinner(currentRoundId);
        }
    }

    // ============ Round Management (Private Rooms) ============

    function endPrivateRoom(bytes32 roomId) external nonReentrant {
        PrivateRoom storage room = privateRooms[roomId];

        if (room.endTime == 0) revert RoundNotActive();
        if (room.settled || room.cancelled) revert RoundAlreadyEnded();
        if (block.timestamp < room.endTime) revert RoundNotEnded();
        if (room.vrfRequested) revert VRFAlreadyRequested();

        if (room.playerCount < room.minPlayers) {
            _cancelPrivateRoom(roomId);
        } else {
            _requestPrivateRandomWinner(roomId);
        }
    }

    /**
     * @notice Called by Chainlink VRF Coordinator with the verified random words.
     * @dev Internal override — access control is enforced by VRFConsumerBaseV2Plus.
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        // Check if this VRF request belongs to a private room
        bytes32 privateRoomId = vrfRequestToPrivateRoom[requestId];
        if (privateRoomId != bytes32(0)) {
            PrivateRoom storage room = privateRooms[privateRoomId];
            if (room.vrfRequested && !room.settled && !room.cancelled) {
                _selectPrivateWinner(privateRoomId, randomWords[0]);
            }
            return;
        }

        // Otherwise handle as a public round
        uint256 roundId = vrfRequestToRound[requestId];
        if (roundId == 0) revert InvalidVRFRequest();

        Round storage round = rounds[roundId];
        if (round.status != RoundStatus.PendingVRF) revert InvalidVRFRequest();

        _selectWinner(roundId, randomWords[0]);
    }

    /**
     * @notice Pull any ETH owed (from cancelled-round refunds or failed prize pushes).
     */
    function withdrawPendingEth() external nonReentrant {
        uint256 amount = pendingEthWithdrawals[msg.sender];
        if (amount == 0) revert NoPendingWithdrawal();
        pendingEthWithdrawals[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();
        emit EthWithdrawn(msg.sender, amount);
    }

    // ============ Admin ============

    function withdrawFees(address to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();

        uint256 ethFees  = totalEthFeesCollected;
        uint256 usdcFees = totalUsdcFeesCollected;
        uint256 oarFees  = totalOarFeesCollected;

        totalEthFeesCollected  = 0;
        totalUsdcFeesCollected = 0;
        totalOarFeesCollected  = 0;

        if (ethFees > 0) {
            (bool success, ) = to.call{value: ethFees}("");
            if (!success) revert TransferFailed();
        }
        if (usdcFees > 0) usdc.safeTransfer(to, usdcFees);
        if (oarFees  > 0) oarCoin.safeTransfer(to, oarFees);

        emit FeesWithdrawn(to, ethFees, usdcFees, oarFees);
    }

    function pause()   external onlyOwner { _pause();   }
    function unpause() external onlyOwner { _unpause(); }

    /**
     * @notice Update VRF parameters. To change the coordinator address use
     *         the inherited setCoordinator() function.
     */
    function updateVRFConfig(
        bytes32 _keyHash,
        uint256 _subscriptionId,
        uint16  _requestConfirmations,
        uint32  _callbackGasLimit
    ) external onlyOwner {
        keyHash              = _keyHash;
        subscriptionId       = _subscriptionId;
        requestConfirmations = _requestConfirmations;
        callbackGasLimit     = _callbackGasLimit;
    }

    // ============ View Functions (Public Game) ============

    function getCurrentRound() external view returns (
        uint256 id,
        uint256 startTime,
        uint256 endTime,
        uint256 prizePool,
        uint256 playerCount,
        address winner,
        RoundStatus status,
        uint256 timeRemaining
    ) {
        Round storage round = rounds[currentRoundId];
        uint256 remaining = block.timestamp < round.endTime
            ? round.endTime - block.timestamp
            : 0;

        return (
            round.id,
            round.startTime,
            round.endTime,
            round.prizePool,
            round.playerCount,
            round.winner,
            round.status,
            remaining
        );
    }

    function getRoundPools(uint256 roundId) external view returns (
        uint256 ethPool,
        uint256 usdcPool,
        uint256 oarPool
    ) {
        return (roundEthPool[roundId], roundUsdcPool[roundId], roundOarPool[roundId]);
    }

    function getRoundPlayers(uint256 roundId) external view returns (Player[] memory) {
        return roundPlayers[roundId];
    }

    function getPlayerDeposit(uint256 roundId, address player) external view returns (uint256) {
        return playerDeposits[roundId][player];
    }

    function getPlayerTokenDeposits(uint256 roundId, address player) external view returns (
        uint256 ethAmount,
        uint256 usdcAmount,
        uint256 oarAmount
    ) {
        return (
            playerEthDeposits[roundId][player],
            playerUsdcDeposits[roundId][player],
            playerOarDeposits[roundId][player]
        );
    }

    // Win chance as basis points (100 = 1%, 10000 = 100%)
    function getWinChance(uint256 roundId, address player) external view returns (uint256) {
        Round storage round = rounds[roundId];
        if (round.prizePool == 0) return 0;
        return (playerDeposits[roundId][player] * 10000) / round.prizePool;
    }

    // ============ View Functions (Private Rooms) ============

    function getPrivateRoomPlayers(bytes32 roomId) external view returns (PrivatePlayer[] memory) {
        return privateRoomPlayers[roomId];
    }

    function getPlayerPrivateTokenDeposits(bytes32 roomId, address player) external view returns (
        uint256 ethAmount,
        uint256 usdcAmount,
        uint256 oarAmount
    ) {
        return (
            playerPrivateEthDeposits[roomId][player],
            playerPrivateUsdcDeposits[roomId][player],
            playerPrivateOarDeposits[roomId][player]
        );
    }

    function getPrivateWinChance(bytes32 roomId, address player) external view returns (uint256) {
        PrivateRoom storage room = privateRooms[roomId];
        if (room.prizePool == 0) return 0;
        return (playerPrivateDeposits[roomId][player] * 10000) / room.prizePool;
    }

    // ============ Internal Functions (Public Game) ============

    function _startNewRound() internal {
        currentRoundId++;

        Round storage round = rounds[currentRoundId];
        round.id        = currentRoundId;
        round.startTime = block.timestamp;
        round.endTime   = block.timestamp + ROUND_DURATION;
        round.status    = RoundStatus.Active;

        emit RoundStarted(currentRoundId, round.startTime, round.endTime);
    }

    function _processDeposit(uint256 roundId, address player, uint256 amount) internal {
        Round storage round = rounds[roundId];

        uint256 idx = playerIndex[roundId][player];
        if (idx == 0) {
            roundPlayers[roundId].push(Player({addr: player, amount: amount}));
            playerIndex[roundId][player] = roundPlayers[roundId].length; // 1-based
            round.playerCount++;
        } else {
            roundPlayers[roundId][idx - 1].amount += amount;
        }

        playerDeposits[roundId][player] += amount;
        round.prizePool                 += amount;
    }

    function _requestRandomWinner(uint256 roundId) internal {
        Round storage round = rounds[roundId];
        round.vrfRequested = true;
        round.status       = RoundStatus.PendingVRF;

        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash:             keyHash,
                subId:               subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit:    callbackGasLimit,
                numWords:            1,
                extraArgs:           VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false}) // pay with LINK
                )
            })
        );

        round.vrfRequestId              = requestId;
        vrfRequestToRound[requestId]    = roundId;

        emit VRFRequested(roundId, requestId);
    }

    function _selectWinner(uint256 roundId, uint256 randomness) internal {
        address winner = _pickWinner(roundId, randomness);
        _distributePrizes(roundId, winner);
        _startNewRound();
    }

    function _pickWinner(uint256 roundId, uint256 randomness) internal view returns (address) {
        Player[] storage players   = roundPlayers[roundId];
        uint256          target    = randomness % rounds[roundId].prizePool;
        uint256          cumulative = 0;

        for (uint256 i = 0; i < players.length; i++) {
            cumulative += players[i].amount;
            if (target < cumulative) return players[i].addr;
        }
        return players[players.length - 1].addr; // unreachable under normal conditions
    }

    function _distributePrizes(uint256 roundId, address winner) internal {
        Round storage round = rounds[roundId];

        uint256 ethFee  = (roundEthPool[roundId]  * FEE_PERCENT) / 100;
        uint256 usdcFee = (roundUsdcPool[roundId] * FEE_PERCENT) / 100;
        uint256 oarFee  = (roundOarPool[roundId]  * FEE_PERCENT) / 100;

        round.winner   = winner;
        round.status   = RoundStatus.Completed;
        totalEthFeesCollected  += ethFee;
        totalUsdcFeesCollected += usdcFee;
        totalOarFeesCollected  += oarFee;

        uint256 ethPrize  = roundEthPool[roundId]  - ethFee;
        uint256 usdcPrize = roundUsdcPool[roundId] - usdcFee;
        uint256 oarPrize  = roundOarPool[roundId]  - oarFee;

        // ETH: try push; on failure credit pull-payment ledger so funds are never lost
        if (ethPrize > 0) {
            (bool ok, ) = winner.call{value: ethPrize}("");
            if (!ok) pendingEthWithdrawals[winner] += ethPrize;
        }
        if (usdcPrize > 0) usdc.safeTransfer(winner, usdcPrize);
        if (oarPrize  > 0) oarCoin.safeTransfer(winner, oarPrize);

        emit WinnerSelected(roundId, winner, ethPrize, usdcPrize, oarPrize);
    }

    function _cancelRound(uint256 roundId) internal {
        Round storage round   = rounds[roundId];
        Player[] storage players = roundPlayers[roundId];

        round.status = RoundStatus.Cancelled;

        for (uint256 i = 0; i < players.length; i++) {
            address player  = players[i].addr;
            uint256 ethAmt  = playerEthDeposits[roundId][player];
            uint256 usdcAmt = playerUsdcDeposits[roundId][player];
            uint256 oarAmt  = playerOarDeposits[roundId][player];

            if (ethAmt  > 0) pendingEthWithdrawals[player] += ethAmt; // pull-payment
            if (usdcAmt > 0) usdc.safeTransfer(player, usdcAmt);
            if (oarAmt  > 0) oarCoin.safeTransfer(player, oarAmt);

            emit Refunded(roundId, player, ethAmt, usdcAmt, oarAmt);
        }

        emit RoundCancelled(roundId);
        _startNewRound();
    }

    // ============ Internal Functions (Private Rooms) ============

    function _processPrivateDeposit(bytes32 roomId, address player, uint256 amount) internal {
        PrivateRoom storage room = privateRooms[roomId];

        uint256 idx = privatePlayerIndex[roomId][player];
        if (idx == 0) {
            privateRoomPlayers[roomId].push(PrivatePlayer({addr: player, amount: amount}));
            privatePlayerIndex[roomId][player] = privateRoomPlayers[roomId].length; // 1-based
            room.playerCount++;
        } else {
            privateRoomPlayers[roomId][idx - 1].amount += amount;
        }

        playerPrivateDeposits[roomId][player] += amount;
        room.prizePool += amount;
    }

    function _requestPrivateRandomWinner(bytes32 roomId) internal {
        PrivateRoom storage room = privateRooms[roomId];
        room.vrfRequested = true;

        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash:             keyHash,
                subId:               subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit:    callbackGasLimit,
                numWords:            1,
                extraArgs:           VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false}) // pay with LINK
                )
            })
        );

        room.vrfRequestId = requestId;
        vrfRequestToPrivateRoom[requestId] = roomId;

        emit PrivateVRFRequested(roomId, requestId);
    }

    function _selectPrivateWinner(bytes32 roomId, uint256 randomness) internal {
        address winner = _pickPrivateWinner(roomId, randomness);
        _distributePrivatePrizes(roomId, winner);
    }

    function _pickPrivateWinner(bytes32 roomId, uint256 randomness) internal view returns (address) {
        PrivatePlayer[] storage players = privateRoomPlayers[roomId];
        uint256 target = randomness % privateRooms[roomId].prizePool;
        uint256 cumulative = 0;

        for (uint256 i = 0; i < players.length; i++) {
            cumulative += players[i].amount;
            if (target < cumulative) return players[i].addr;
        }
        return players[players.length - 1].addr; // unreachable under normal conditions
    }

    function _distributePrivatePrizes(bytes32 roomId, address winner) internal {
        PrivateRoom storage room = privateRooms[roomId];
        
        uint256 prizePool = room.prizePool;
        uint256 fee = (prizePool * FEE_PERCENT) / 100;
        uint256 winnerPrize = prizePool - fee;

        room.winner = winner;
        room.settled = true;

        if (room.tokenType == TokenType.ETH) {
            totalEthFeesCollected += fee;
            (bool ok, ) = winner.call{value: winnerPrize}("");
            if (!ok) pendingEthWithdrawals[winner] += winnerPrize;
            emit PrivateWinnerSelected(roomId, winner, winnerPrize, 0, 0);
        } else if (room.tokenType == TokenType.USDC) {
            totalUsdcFeesCollected += fee;
            usdc.safeTransfer(winner, winnerPrize);
            emit PrivateWinnerSelected(roomId, winner, 0, winnerPrize, 0);
        } else if (room.tokenType == TokenType.OARCOIN) {
            totalOarFeesCollected += fee;
            oarCoin.safeTransfer(winner, winnerPrize);
            emit PrivateWinnerSelected(roomId, winner, 0, 0, winnerPrize);
        }
    }

    function _cancelPrivateRoom(bytes32 roomId) internal {
        PrivateRoom storage room = privateRooms[roomId];
        PrivatePlayer[] storage players = privateRoomPlayers[roomId];

        room.cancelled = true;

        for (uint256 i = 0; i < players.length; i++) {
            address player  = players[i].addr;
            uint256 ethAmt  = playerPrivateEthDeposits[roomId][player];
            uint256 usdcAmt = playerPrivateUsdcDeposits[roomId][player];
            uint256 oarAmt  = playerPrivateOarDeposits[roomId][player];

            playerPrivateEthDeposits[roomId][player] = 0;
            playerPrivateUsdcDeposits[roomId][player] = 0;
            playerPrivateOarDeposits[roomId][player] = 0;

            if (ethAmt  > 0) pendingEthWithdrawals[player] += ethAmt; // pull-payment
            if (usdcAmt > 0) usdc.safeTransfer(player, usdcAmt);
            if (oarAmt  > 0) oarCoin.safeTransfer(player, oarAmt);

            emit PrivateRefunded(roomId, player, ethAmt, usdcAmt, oarAmt);
        }

        emit PrivateRoomCancelled(roomId);
    }

    // Revert on direct ETH sends — untracked ETH would be permanently stuck
    receive() external payable {
        revert("Use depositETH()");
    }
}
