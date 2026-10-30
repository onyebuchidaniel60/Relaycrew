// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title PipelineCoordinator
/// @notice Phase 2 interface scaffold. Every function reverts with NotImplemented().
contract PipelineCoordinator {
    error NotImplemented();
    error ZeroAddress();

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

    constructor(address _usdc) {
        if (_usdc == address(0)) revert ZeroAddress();
        usdc = IERC20(_usdc);
    }

    function createPipeline(StageInput[] calldata stages) external returns (uint256 pipelineId) {
        stages;
        pipelineId;
        revert NotImplemented();
    }

    function submitStage(uint256 pipelineId, uint256 stageIndex, string calldata deliverableURI) external {
        pipelineId;
        stageIndex;
        deliverableURI;
        revert NotImplemented();
    }

    function approveStage(uint256 pipelineId, uint256 stageIndex) external {
        pipelineId;
        stageIndex;
        revert NotImplemented();
    }

    function rejectStage(uint256 pipelineId, uint256 stageIndex) external {
        pipelineId;
        stageIndex;
        revert NotImplemented();
    }

    function expirePipeline(uint256 pipelineId) external {
        pipelineId;
        revert NotImplemented();
    }

    function pipelineCount() external view returns (uint256) {
        revert NotImplemented();
    }

    function getPipelineSummary(uint256 pipelineId) external view returns (PipelineSummary memory) {
        pipelineId;
        revert NotImplemented();
    }

    function getStage(uint256 pipelineId, uint256 stageIndex) external view returns (StageView memory) {
        pipelineId;
        stageIndex;
        revert NotImplemented();
    }

    function getUserPipelineIds(address user) external view returns (uint256[] memory) {
        user;
        revert NotImplemented();
    }
}
