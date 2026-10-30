// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title PipelineCoordinator
/// @notice Fixed linear multi-stage USDC escrow with client evaluation.
/// @dev Experimental and unaudited. No owner, upgrade, rescue, or fee path.
contract PipelineCoordinator is ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant USDC_UNIT = 1_000_000;
    uint256 public constant MIN_STAGE_BUDGET = 1 * USDC_UNIT;
    uint256 public constant MAX_PIPELINE_BUDGET = 100 * USDC_UNIT;
    uint256 public constant MIN_STAGES = 2;
    uint256 public constant MAX_STAGES = 5;
    uint256 public constant MIN_STAGE_DURATION = 900;
    uint256 public constant MAX_STAGE_DURATION = 604_800;
    uint256 public constant EVALUATION_WINDOW = 86_400;
    uint256 public constant MIN_TITLE_BYTES = 1;
    uint256 public constant MAX_TITLE_BYTES = 64;
    uint256 public constant MIN_BRIEF_BYTES = 1;
    uint256 public constant MAX_BRIEF_BYTES = 240;
    uint256 public constant MIN_URI_BYTES = 9;
    uint256 public constant MAX_URI_BYTES = 256;

    enum PipelineStatus {
        Active,
        Completed,
        Rejected,
        Expired
    }

    enum StageStatus {
        Queued,
        Active,
        Submitted,
        Paid,
        Rejected,
        Expired
    }

    struct StageInput {
        address provider;
        uint256 budget;
        string title;
        string brief;
        uint32 durationSeconds;
    }

    struct Pipeline {
        address client;
        uint256 totalBudget;
        uint256 paidOut;
        uint256 refundedAmount;
        uint8 currentStageIndex;
        uint8 stageCount;
        PipelineStatus status;
        uint64 createdAt;
        uint64 finishedAt;
    }

    struct Stage {
        address provider;
        uint256 budget;
        string title;
        string brief;
        uint32 durationSeconds;
        StageStatus status;
        uint64 startedAt;
        uint64 dueAt;
        uint64 submittedAt;
        uint64 evaluationDeadline;
        string deliverableURI;
    }

    struct PipelineSummary {
        address client;
        uint256 totalBudget;
        uint256 paidOut;
        uint256 refundedAmount;
        uint8 currentStageIndex;
        uint8 stageCount;
        PipelineStatus status;
        uint64 createdAt;
        uint64 finishedAt;
    }

    struct StageView {
        address provider;
        uint256 budget;
        string title;
        string brief;
        uint32 durationSeconds;
        StageStatus status;
        uint64 startedAt;
        uint64 dueAt;
        uint64 submittedAt;
        uint64 evaluationDeadline;
        string deliverableURI;
    }

    IERC20 public immutable usdc;
    uint256 public pipelineCount;

    mapping(uint256 => Pipeline) private _pipelines;
    mapping(uint256 => Stage[]) private _stages;
    mapping(address => uint256[]) private _userPipelineIds;
    mapping(uint256 => mapping(address => bool)) private _userIndexed;

    error ZeroAddress();
    error UnknownPipeline();
    error InvalidStageCount();
    error InvalidProvider();
    error DuplicateProvider();
    error InvalidBudget();
    error InvalidTotalBudget();
    error InvalidTitle();
    error InvalidBrief();
    error InvalidDuration();
    error InvalidURI();
    error PipelineNotActive();
    error InvalidStageIndex();
    error StageNotActive();
    error StageNotSubmitted();
    error InvalidStageStatus();
    error NotClient();
    error NotProvider();
    error WorkDeadlinePassed();
    error EvaluationDeadlinePassed();
    error NotExpired();

    event PipelineCreated(
        uint256 indexed pipelineId,
        address indexed client,
        uint256 totalBudget,
        uint8 stageCount
    );
    event StageHired(
        uint256 indexed pipelineId,
        uint8 indexed stageIndex,
        address indexed provider,
        uint256 budget,
        uint64 dueAt
    );
    event StageSubmitted(
        uint256 indexed pipelineId,
        uint8 indexed stageIndex,
        address indexed provider,
        string deliverableURI,
        uint64 evaluationDeadline
    );
    event StageReleased(
        uint256 indexed pipelineId,
        uint8 indexed stageIndex,
        address indexed provider,
        uint256 amount
    );
    event StageRejected(uint256 indexed pipelineId, uint8 indexed stageIndex, address indexed client);
    event StageExpired(uint256 indexed pipelineId, uint8 indexed stageIndex);
    event PipelineCompleted(uint256 indexed pipelineId, address indexed client);
    event PipelineRejected(uint256 indexed pipelineId, address indexed client);
    event PipelineExpired(uint256 indexed pipelineId, address indexed client);
    event PipelineRefunded(uint256 indexed pipelineId, address indexed client, uint256 amount);

    constructor(address _usdc) {
        if (_usdc == address(0)) revert ZeroAddress();
        usdc = IERC20(_usdc);
    }

    function createPipeline(StageInput[] calldata stages) external nonReentrant returns (uint256 pipelineId) {
        uint256 stageCount = stages.length;
        if (stageCount < MIN_STAGES || stageCount > MAX_STAGES) revert InvalidStageCount();

        uint256 totalBudget;

        for (uint256 i = 0; i < stageCount; i++) {
            StageInput calldata input = stages[i];

            if (input.provider == address(0) || input.provider == msg.sender) {
                revert InvalidProvider();
            }

            for (uint256 j = 0; j < i; j++) {
                if (stages[j].provider == input.provider) revert DuplicateProvider();
            }

            if (input.budget < MIN_STAGE_BUDGET) revert InvalidBudget();
            totalBudget += input.budget;
            if (totalBudget > MAX_PIPELINE_BUDGET) revert InvalidTotalBudget();

            uint256 titleLength = bytes(input.title).length;
            if (titleLength < MIN_TITLE_BYTES || titleLength > MAX_TITLE_BYTES) revert InvalidTitle();

            uint256 briefLength = bytes(input.brief).length;
            if (briefLength < MIN_BRIEF_BYTES || briefLength > MAX_BRIEF_BYTES) revert InvalidBrief();

            if (
                input.durationSeconds < MIN_STAGE_DURATION ||
                input.durationSeconds > MAX_STAGE_DURATION
            ) {
                revert InvalidDuration();
            }
        }

        usdc.safeTransferFrom(msg.sender, address(this), totalBudget);

        pipelineId = ++pipelineCount;
        Pipeline storage pipeline = _pipelines[pipelineId];
        pipeline.client = msg.sender;
        pipeline.totalBudget = totalBudget;
        pipeline.currentStageIndex = 0;
        pipeline.stageCount = uint8(stageCount);
        pipeline.status = PipelineStatus.Active;
        pipeline.createdAt = uint64(block.timestamp);

        for (uint256 i = 0; i < stageCount; i++) {
            StageInput calldata input = stages[i];
            _stages[pipelineId].push();
            Stage storage stage = _stages[pipelineId][i];
            stage.provider = input.provider;
            stage.budget = input.budget;
            stage.title = input.title;
            stage.brief = input.brief;
            stage.durationSeconds = input.durationSeconds;
            stage.status = StageStatus.Queued;
        }

        Stage storage firstStage = _stages[pipelineId][0];
        firstStage.status = StageStatus.Active;
        firstStage.startedAt = uint64(block.timestamp);
        firstStage.dueAt = uint64(block.timestamp + firstStage.durationSeconds);

        _indexUser(pipelineId, msg.sender);
        for (uint256 i = 0; i < stageCount; i++) {
            _indexUser(pipelineId, stages[i].provider);
        }

        emit PipelineCreated(pipelineId, msg.sender, totalBudget, uint8(stageCount));
        emit StageHired(
            pipelineId,
            0,
            firstStage.provider,
            firstStage.budget,
            firstStage.dueAt
        );
    }

    function submitStage(
        uint256 pipelineId,
        uint256 stageIndex,
        string calldata deliverableURI
    ) external {
        Pipeline storage pipeline = _pipelines[pipelineId];
        if (pipeline.stageCount == 0) revert UnknownPipeline();
        if (pipeline.status != PipelineStatus.Active) revert PipelineNotActive();
        if (stageIndex != pipeline.currentStageIndex) revert InvalidStageIndex();

        Stage storage stage = _stages[pipelineId][stageIndex];
        if (stage.status != StageStatus.Active) revert StageNotActive();
        if (msg.sender != stage.provider) revert NotProvider();
        if (block.timestamp >= stage.dueAt) revert WorkDeadlinePassed();
        if (!_isValidURI(deliverableURI)) revert InvalidURI();

        stage.status = StageStatus.Submitted;
        stage.submittedAt = uint64(block.timestamp);
        stage.evaluationDeadline = uint64(block.timestamp + EVALUATION_WINDOW);
        stage.deliverableURI = deliverableURI;

        emit StageSubmitted(
            pipelineId,
            uint8(stageIndex),
            msg.sender,
            deliverableURI,
            stage.evaluationDeadline
        );
    }

    function approveStage(uint256 pipelineId, uint256 stageIndex) external nonReentrant {
        Pipeline storage pipeline = _pipelines[pipelineId];
        if (pipeline.stageCount == 0) revert UnknownPipeline();
        if (msg.sender != pipeline.client) revert NotClient();
        if (pipeline.status != PipelineStatus.Active) revert PipelineNotActive();
        if (stageIndex != pipeline.currentStageIndex) revert InvalidStageIndex();

        Stage storage stage = _stages[pipelineId][stageIndex];
        if (stage.status != StageStatus.Submitted) revert StageNotSubmitted();
        if (block.timestamp >= stage.evaluationDeadline) revert EvaluationDeadlinePassed();

        stage.status = StageStatus.Paid;
        pipeline.paidOut += stage.budget;

        bool isFinal = stageIndex + 1 == pipeline.stageCount;
        uint8 nextStageIndex;
        address nextProvider;
        uint256 nextBudget;
        uint64 nextDueAt;

        if (isFinal) {
            pipeline.status = PipelineStatus.Completed;
            pipeline.finishedAt = uint64(block.timestamp);
        } else {
            uint256 nextIndex = stageIndex + 1;
            Stage storage nextStage = _stages[pipelineId][nextIndex];
            nextStage.status = StageStatus.Active;
            nextStage.startedAt = uint64(block.timestamp);
            nextStage.dueAt = uint64(block.timestamp + nextStage.durationSeconds);

            pipeline.currentStageIndex = uint8(nextIndex);
            nextStageIndex = uint8(nextIndex);
            nextProvider = nextStage.provider;
            nextBudget = nextStage.budget;
            nextDueAt = nextStage.dueAt;
        }

        usdc.safeTransfer(stage.provider, stage.budget);

        emit StageReleased(pipelineId, uint8(stageIndex), stage.provider, stage.budget);

        if (isFinal) {
            emit PipelineCompleted(pipelineId, pipeline.client);
        } else {
            emit StageHired(pipelineId, nextStageIndex, nextProvider, nextBudget, nextDueAt);
        }
    }

    function rejectStage(uint256 pipelineId, uint256 stageIndex) external nonReentrant {
        Pipeline storage pipeline = _pipelines[pipelineId];
        if (pipeline.stageCount == 0) revert UnknownPipeline();
        if (msg.sender != pipeline.client) revert NotClient();
        if (pipeline.status != PipelineStatus.Active) revert PipelineNotActive();
        if (stageIndex != pipeline.currentStageIndex) revert InvalidStageIndex();

        Stage storage stage = _stages[pipelineId][stageIndex];

        if (stage.status == StageStatus.Active) {
            if (block.timestamp >= stage.dueAt) revert WorkDeadlinePassed();
        } else if (stage.status == StageStatus.Submitted) {
            if (block.timestamp >= stage.evaluationDeadline) revert EvaluationDeadlinePassed();
        } else {
            revert InvalidStageStatus();
        }

        stage.status = StageStatus.Rejected;
        pipeline.status = PipelineStatus.Rejected;
        pipeline.finishedAt = uint64(block.timestamp);

        uint256 remaining = pipeline.totalBudget - pipeline.paidOut - pipeline.refundedAmount;
        pipeline.refundedAmount += remaining;

        usdc.safeTransfer(pipeline.client, remaining);

        emit StageRejected(pipelineId, uint8(stageIndex), pipeline.client);
        emit PipelineRejected(pipelineId, pipeline.client);
        emit PipelineRefunded(pipelineId, pipeline.client, remaining);
    }

    function expirePipeline(uint256 pipelineId) external nonReentrant {
        Pipeline storage pipeline = _pipelines[pipelineId];
        if (pipeline.stageCount == 0) revert UnknownPipeline();
        if (pipeline.status != PipelineStatus.Active) revert PipelineNotActive();

        uint256 stageIndex = pipeline.currentStageIndex;
        Stage storage stage = _stages[pipelineId][stageIndex];

        bool eligible;
        if (stage.status == StageStatus.Active) {
            eligible = block.timestamp >= stage.dueAt;
        } else if (stage.status == StageStatus.Submitted) {
            eligible = block.timestamp >= stage.evaluationDeadline;
        } else {
            revert InvalidStageStatus();
        }

        if (!eligible) revert NotExpired();

        stage.status = StageStatus.Expired;
        pipeline.status = PipelineStatus.Expired;
        pipeline.finishedAt = uint64(block.timestamp);

        uint256 remaining = pipeline.totalBudget - pipeline.paidOut - pipeline.refundedAmount;
        pipeline.refundedAmount += remaining;

        usdc.safeTransfer(pipeline.client, remaining);

        emit StageExpired(pipelineId, uint8(stageIndex));
        emit PipelineExpired(pipelineId, pipeline.client);
        emit PipelineRefunded(pipelineId, pipeline.client, remaining);
    }

    function getPipelineSummary(uint256 pipelineId) external view returns (PipelineSummary memory) {
        Pipeline storage pipeline = _pipelines[pipelineId];
        if (pipeline.stageCount == 0) revert UnknownPipeline();

        return
            PipelineSummary({
                client: pipeline.client,
                totalBudget: pipeline.totalBudget,
                paidOut: pipeline.paidOut,
                refundedAmount: pipeline.refundedAmount,
                currentStageIndex: pipeline.currentStageIndex,
                stageCount: pipeline.stageCount,
                status: pipeline.status,
                createdAt: pipeline.createdAt,
                finishedAt: pipeline.finishedAt
            });
    }

    function getStage(uint256 pipelineId, uint256 stageIndex) external view returns (StageView memory) {
        Pipeline storage pipeline = _pipelines[pipelineId];
        if (pipeline.stageCount == 0) revert UnknownPipeline();
        if (stageIndex >= pipeline.stageCount) revert InvalidStageIndex();

        Stage storage stage = _stages[pipelineId][stageIndex];

        return
            StageView({
                provider: stage.provider,
                budget: stage.budget,
                title: stage.title,
                brief: stage.brief,
                durationSeconds: stage.durationSeconds,
                status: stage.status,
                startedAt: stage.startedAt,
                dueAt: stage.dueAt,
                submittedAt: stage.submittedAt,
                evaluationDeadline: stage.evaluationDeadline,
                deliverableURI: stage.deliverableURI
            });
    }

    function getUserPipelineIds(address user) external view returns (uint256[] memory) {
        return _userPipelineIds[user];
    }

    function _indexUser(uint256 pipelineId, address user) internal {
        if (_userIndexed[pipelineId][user]) return;
        _userIndexed[pipelineId][user] = true;
        _userPipelineIds[user].push(pipelineId);
    }

    function _isValidURI(string calldata uri) internal pure returns (bool) {
        bytes calldata data = bytes(uri);
        if (data.length < MIN_URI_BYTES || data.length > MAX_URI_BYTES) return false;

        bool https =
            data[0] == bytes1("h") &&
            data[1] == bytes1("t") &&
            data[2] == bytes1("t") &&
            data[3] == bytes1("p") &&
            data[4] == bytes1("s") &&
            data[5] == bytes1(":") &&
            data[6] == bytes1("/") &&
            data[7] == bytes1("/");

        bool ipfs =
            data[0] == bytes1("i") &&
            data[1] == bytes1("p") &&
            data[2] == bytes1("f") &&
            data[3] == bytes1("s") &&
            data[4] == bytes1(":") &&
            data[5] == bytes1("/") &&
            data[6] == bytes1("/");

        return https || ipfs;
    }
}
