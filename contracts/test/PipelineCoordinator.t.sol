// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {PipelineCoordinator} from "../PipelineCoordinator.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract PipelineCoordinatorTest is Test {
    PipelineCoordinator internal coordinator;
    MockUSDC internal usdc;

    address internal client;
    address internal provider1;
    address internal provider2;
    address internal provider3;
    address internal provider4;
    address internal provider5;
    address internal outsider;

    uint256 internal constant UNIT = 1_000_000;
    uint256 internal constant TOTAL_TWO = 30 * UNIT;
    uint256 internal constant TOTAL_TEN = 100 * UNIT;
    uint32 internal constant DURATION = 86_400;
    uint32 internal constant DURATION2 = 172_800;
    string internal constant HTTPS_URI = "https://example.com/deliverable";

    function setUp() public {
        client = makeAddr("client");
        provider1 = makeAddr("provider1");
        provider2 = makeAddr("provider2");
        provider3 = makeAddr("provider3");
        provider4 = makeAddr("provider4");
        provider5 = makeAddr("provider5");
        outsider = makeAddr("outsider");

        usdc = new MockUSDC();
        coordinator = new PipelineCoordinator(address(usdc));

        usdc.mint(client, 1_000 * UNIT);
        vm.prank(client);
        usdc.approve(address(coordinator), type(uint256).max);
    }

    function _stage(
        address provider,
        uint256 budget,
        uint32 duration
    ) internal pure returns (PipelineCoordinator.StageInput memory) {
        return
            PipelineCoordinator.StageInput({
                provider: provider,
                budget: budget,
                title: "Stage",
                brief: "Public brief",
                durationSeconds: duration
            });
    }

    function _twoStages() internal view returns (PipelineCoordinator.StageInput[] memory stages) {
        stages = new PipelineCoordinator.StageInput[](2);
        stages[0] = _stage(provider1, 10 * UNIT, DURATION);
        stages[1] = _stage(provider2, 20 * UNIT, DURATION2);
    }

    function _stages(uint256 count) internal pure returns (PipelineCoordinator.StageInput[] memory stages) {
        stages = new PipelineCoordinator.StageInput[](count);
        for (uint256 i = 0; i < count; i++) {
            stages[i] = PipelineCoordinator.StageInput({
                provider: address(uint160(0x1000 + i)),
                budget: 10 * UNIT,
                title: "Stage",
                brief: "Public brief",
                durationSeconds: DURATION
            });
        }
    }

    function _createTwo() internal returns (uint256 pipelineId) {
        PipelineCoordinator.StageInput[] memory stages = _twoStages();
        vm.prank(client);
        pipelineId = coordinator.createPipeline(stages);
    }

    function _createStages(uint256 count) internal returns (uint256 pipelineId) {
        PipelineCoordinator.StageInput[] memory stages = _stages(count);
        vm.prank(client);
        pipelineId = coordinator.createPipeline(stages);
    }

    function testConstructorRejectsZeroUsdc() public {
        vm.expectRevert(PipelineCoordinator.ZeroAddress.selector);
        new PipelineCoordinator(address(0));
    }

    function testCreateTwoStages() public {
        uint256 id = _createTwo();

        assertEq(id, 1);
        assertEq(coordinator.pipelineCount(), 1);
        assertEq(usdc.balanceOf(address(coordinator)), TOTAL_TWO);
        assertEq(address(coordinator.usdc()), address(usdc));

        PipelineCoordinator.PipelineSummary memory pipeline = coordinator.getPipelineSummary(id);
        assertEq(pipeline.client, client);
        assertEq(pipeline.totalBudget, TOTAL_TWO);
        assertEq(pipeline.paidOut, 0);
        assertEq(pipeline.refundedAmount, 0);
        assertEq(uint256(pipeline.currentStageIndex), 0);
        assertEq(uint256(pipeline.stageCount), 2);
        assertEq(uint256(pipeline.status), uint256(PipelineCoordinator.PipelineStatus.Active));
        assertEq(uint256(pipeline.createdAt), block.timestamp);
        assertEq(uint256(pipeline.finishedAt), 0);

        PipelineCoordinator.StageView memory first = coordinator.getStage(id, 0);
        assertEq(first.provider, provider1);
        assertEq(first.budget, 10 * UNIT);
        assertEq(first.title, "Stage");
        assertEq(first.brief, "Public brief");
        assertEq(uint256(first.durationSeconds), uint256(DURATION));
        assertEq(uint256(first.status), uint256(PipelineCoordinator.StageStatus.Active));
        assertEq(uint256(first.startedAt), block.timestamp);
        assertEq(uint256(first.dueAt), block.timestamp + DURATION);
        assertEq(uint256(first.submittedAt), 0);
        assertEq(uint256(first.evaluationDeadline), 0);
        assertEq(first.deliverableURI, "");

        PipelineCoordinator.StageView memory second = coordinator.getStage(id, 1);
        assertEq(second.provider, provider2);
        assertEq(uint256(second.status), uint256(PipelineCoordinator.StageStatus.Queued));
        assertEq(uint256(second.startedAt), 0);
        assertEq(uint256(second.dueAt), 0);

        uint256[] memory clientIds = coordinator.getUserPipelineIds(client);
        assertEq(clientIds.length, 1);
        assertEq(clientIds[0], id);
        uint256[] memory providerIds = coordinator.getUserPipelineIds(provider1);
        assertEq(providerIds.length, 1);
        assertEq(providerIds[0], id);
        assertEq(coordinator.getUserPipelineIds(outsider).length, 0);
    }

    function testMaxStagesIsTen() public view {
        assertEq(coordinator.MAX_STAGES(), 10);
    }

    function testCreateThreeFiveAndTenStages() public {
        uint256 id3 = _createStages(3);
        assertEq(id3, 1);
        assertEq(coordinator.pipelineCount(), 1);
        assertEq(usdc.balanceOf(address(coordinator)), 30 * UNIT);
        assertEq(uint256(coordinator.getPipelineSummary(id3).stageCount), 3);

        uint256 id5 = _createStages(5);
        assertEq(id5, 2);
        assertEq(coordinator.pipelineCount(), 2);
        assertEq(usdc.balanceOf(address(coordinator)), 80 * UNIT);
        assertEq(uint256(coordinator.getPipelineSummary(id5).stageCount), 5);

        uint256 id10 = _createStages(10);
        assertEq(id10, 3);
        assertEq(coordinator.pipelineCount(), 3);
        assertEq(usdc.balanceOf(address(coordinator)), 180 * UNIT);
        assertEq(uint256(coordinator.getPipelineSummary(id10).stageCount), 10);
    }

    function testCreateTenStages() public {
        uint256 id = _createStages(10);

        PipelineCoordinator.PipelineSummary memory pipeline = coordinator.getPipelineSummary(id);
        assertEq(pipeline.client, client);
        assertEq(pipeline.totalBudget, TOTAL_TEN);
        assertEq(pipeline.paidOut, 0);
        assertEq(pipeline.refundedAmount, 0);
        assertEq(uint256(pipeline.currentStageIndex), 0);
        assertEq(uint256(pipeline.stageCount), 10);
        assertEq(uint256(pipeline.status), uint256(PipelineCoordinator.PipelineStatus.Active));

        assertEq(usdc.balanceOf(address(coordinator)), TOTAL_TEN);

        for (uint256 i = 0; i < 10; i++) {
            PipelineCoordinator.StageView memory stage = coordinator.getStage(id, i);
            assertEq(stage.budget, 10 * UNIT);
            assertEq(uint256(stage.durationSeconds), uint256(DURATION));
            if (i == 0) {
                assertEq(uint256(stage.status), uint256(PipelineCoordinator.StageStatus.Active));
                assertEq(uint256(stage.startedAt), block.timestamp);
                assertEq(uint256(stage.dueAt), block.timestamp + DURATION);
            } else {
                assertEq(uint256(stage.status), uint256(PipelineCoordinator.StageStatus.Queued));
                assertEq(uint256(stage.startedAt), 0);
                assertEq(uint256(stage.dueAt), 0);
            }
        }

        assertEq(coordinator.getUserPipelineIds(client).length, 1);
    }

    function testRevertInvalidStageCounts() public {
        PipelineCoordinator.StageInput[] memory zero = _stages(0);
        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.InvalidStageCount.selector);
        coordinator.createPipeline(zero);

        PipelineCoordinator.StageInput[] memory one = _stages(1);
        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.InvalidStageCount.selector);
        coordinator.createPipeline(one);

        PipelineCoordinator.StageInput[] memory eleven = _stages(11);
        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.InvalidStageCount.selector);
        coordinator.createPipeline(eleven);
    }

    function testRevertInvalidProviders() public {
        PipelineCoordinator.StageInput[] memory zeroProvider = _stages(2);
        zeroProvider[0].provider = address(0);
        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.InvalidProvider.selector);
        coordinator.createPipeline(zeroProvider);

        PipelineCoordinator.StageInput[] memory clientProvider = _stages(2);
        clientProvider[0].provider = client;
        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.InvalidProvider.selector);
        coordinator.createPipeline(clientProvider);

        PipelineCoordinator.StageInput[] memory duplicate = _stages(2);
        duplicate[1].provider = duplicate[0].provider;
        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.DuplicateProvider.selector);
        coordinator.createPipeline(duplicate);
    }

    function testRevertInvalidBudgets() public {
        PipelineCoordinator.StageInput[] memory tooSmall = _stages(2);
        tooSmall[0].budget = UNIT - 1;
        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.InvalidBudget.selector);
        coordinator.createPipeline(tooSmall);

        PipelineCoordinator.StageInput[] memory tooLarge = _stages(5);
        tooLarge[0].budget = 60 * UNIT + 1;
        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.InvalidTotalBudget.selector);
        coordinator.createPipeline(tooLarge);
    }

    function testRevertInvalidDurations() public {
        PipelineCoordinator.StageInput[] memory tooShort = _stages(2);
        tooShort[0].durationSeconds = 899;
        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.InvalidDuration.selector);
        coordinator.createPipeline(tooShort);

        PipelineCoordinator.StageInput[] memory tooLong = _stages(2);
        tooLong[0].durationSeconds = 604_801;
        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.InvalidDuration.selector);
        coordinator.createPipeline(tooLong);
    }

    function testRevertInvalidText() public {
        PipelineCoordinator.StageInput[] memory emptyTitle = _stages(2);
        emptyTitle[0].title = "";
        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.InvalidTitle.selector);
        coordinator.createPipeline(emptyTitle);

        PipelineCoordinator.StageInput[] memory longTitle = _stages(2);
        longTitle[0].title = new string(65);
        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.InvalidTitle.selector);
        coordinator.createPipeline(longTitle);

        PipelineCoordinator.StageInput[] memory emptyBrief = _stages(2);
        emptyBrief[0].brief = "";
        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.InvalidBrief.selector);
        coordinator.createPipeline(emptyBrief);

        PipelineCoordinator.StageInput[] memory longBrief = _stages(2);
        longBrief[0].brief = new string(241);
        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.InvalidBrief.selector);
        coordinator.createPipeline(longBrief);
    }

    function testSubmitUpdatesStageAndSetsEvaluationDeadline() public {
        uint256 id = _createTwo();

        vm.prank(provider1);
        coordinator.submitStage(id, 0, HTTPS_URI);

        PipelineCoordinator.StageView memory stage = coordinator.getStage(id, 0);
        assertEq(uint256(stage.status), uint256(PipelineCoordinator.StageStatus.Submitted));
        assertEq(uint256(stage.submittedAt), block.timestamp);
        assertEq(uint256(stage.evaluationDeadline), block.timestamp + 86_400);
        assertEq(stage.deliverableURI, HTTPS_URI);
    }

    function testSubmitAcceptsIpfsUri() public {
        uint256 id = _createTwo();
        string memory ipfsUri = "ipfs://bafybeigdyrzt";

        vm.prank(provider1);
        coordinator.submitStage(id, 0, ipfsUri);

        assertEq(coordinator.getStage(id, 0).deliverableURI, ipfsUri);
    }

    function testSubmitRevertsForWrongCallerOrStage() public {
        uint256 id = _createTwo();

        vm.prank(provider2);
        vm.expectRevert(PipelineCoordinator.NotProvider.selector);
        coordinator.submitStage(id, 0, HTTPS_URI);

        vm.prank(provider1);
        vm.expectRevert(PipelineCoordinator.InvalidStageIndex.selector);
        coordinator.submitStage(id, 1, HTTPS_URI);

        vm.prank(provider1);
        coordinator.submitStage(id, 0, HTTPS_URI);

        vm.prank(provider1);
        vm.expectRevert(PipelineCoordinator.StageNotActive.selector);
        coordinator.submitStage(id, 0, HTTPS_URI);
    }

    function testSubmitRevertsAfterWorkDeadline() public {
        uint256 id = _createTwo();
        vm.warp(block.timestamp + DURATION);

        vm.prank(provider1);
        vm.expectRevert(PipelineCoordinator.WorkDeadlinePassed.selector);
        coordinator.submitStage(id, 0, HTTPS_URI);
    }

    function testSubmitRevertsInvalidUri() public {
        uint256 id = _createTwo();

        vm.prank(provider1);
        vm.expectRevert(PipelineCoordinator.InvalidURI.selector);
        coordinator.submitStage(id, 0, "ftp://example.com/file");

        vm.prank(provider1);
        vm.expectRevert(PipelineCoordinator.InvalidURI.selector);
        coordinator.submitStage(id, 0, "https://");

        vm.prank(provider1);
        vm.expectRevert(PipelineCoordinator.InvalidURI.selector);
        coordinator.submitStage(id, 0, new string(257));
    }

    function testApprovePaysProviderAndActivatesNext() public {
        uint256 id = _createTwo();
        vm.prank(provider1);
        coordinator.submitStage(id, 0, HTTPS_URI);

        uint256 providerBalanceBefore = usdc.balanceOf(provider1);

        vm.prank(client);
        coordinator.approveStage(id, 0);

        assertEq(usdc.balanceOf(provider1), providerBalanceBefore + 10 * UNIT);
        assertEq(usdc.balanceOf(address(coordinator)), 20 * UNIT);

        PipelineCoordinator.PipelineSummary memory pipeline = coordinator.getPipelineSummary(id);
        assertEq(pipeline.paidOut, 10 * UNIT);
        assertEq(pipeline.refundedAmount, 0);
        assertEq(uint256(pipeline.currentStageIndex), 1);
        assertEq(uint256(pipeline.status), uint256(PipelineCoordinator.PipelineStatus.Active));

        PipelineCoordinator.StageView memory first = coordinator.getStage(id, 0);
        assertEq(uint256(first.status), uint256(PipelineCoordinator.StageStatus.Paid));

        PipelineCoordinator.StageView memory second = coordinator.getStage(id, 1);
        assertEq(uint256(second.status), uint256(PipelineCoordinator.StageStatus.Active));
        assertEq(uint256(second.startedAt), block.timestamp);
        assertEq(uint256(second.dueAt), block.timestamp + DURATION2);
    }

    function testApproveFinalStageCompletesPipeline() public {
        uint256 id = _createTwo();

        vm.prank(provider1);
        coordinator.submitStage(id, 0, HTTPS_URI);
        vm.prank(client);
        coordinator.approveStage(id, 0);

        vm.prank(provider2);
        coordinator.submitStage(id, 1, "ipfs://bafybeigdyrzt");
        vm.prank(client);
        coordinator.approveStage(id, 1);

        PipelineCoordinator.PipelineSummary memory pipeline = coordinator.getPipelineSummary(id);
        assertEq(uint256(pipeline.status), uint256(PipelineCoordinator.PipelineStatus.Completed));
        assertEq(pipeline.paidOut, TOTAL_TWO);
        assertEq(pipeline.refundedAmount, 0);
        assertGt(pipeline.finishedAt, 0);
        assertEq(usdc.balanceOf(provider1), 10 * UNIT);
        assertEq(usdc.balanceOf(provider2), 20 * UNIT);
        assertEq(usdc.balanceOf(address(coordinator)), 0);
    }

    function testApproveRevertsForNonClientOrBeforeSubmit() public {
        uint256 id = _createTwo();

        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.StageNotSubmitted.selector);
        coordinator.approveStage(id, 0);

        vm.prank(provider1);
        coordinator.submitStage(id, 0, HTTPS_URI);

        vm.prank(provider2);
        vm.expectRevert(PipelineCoordinator.NotClient.selector);
        coordinator.approveStage(id, 0);
    }

    function testApproveRevertsAfterEvaluationDeadline() public {
        uint256 id = _createTwo();
        vm.prank(provider1);
        coordinator.submitStage(id, 0, HTTPS_URI);

        vm.warp(block.timestamp + 86_400);

        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.EvaluationDeadlinePassed.selector);
        coordinator.approveStage(id, 0);
    }

    function testApproveEmitsReleaseAndHireInSameTransaction() public {
        uint256 id = _createTwo();
        vm.prank(provider1);
        coordinator.submitStage(id, 0, HTTPS_URI);

        uint64 expectedDueAt = uint64(block.timestamp + DURATION2);

        vm.expectEmit(true, true, true, true, address(coordinator));
        emit PipelineCoordinator.StageReleased(id, 0, provider1, 10 * UNIT);

        vm.expectEmit(true, true, true, true, address(coordinator));
        emit PipelineCoordinator.StageHired(id, 1, provider2, 20 * UNIT, expectedDueAt);

        vm.prank(client);
        coordinator.approveStage(id, 0);
    }

    function testRejectRefundsFullRemainingAfterPriorPayout() public {
        uint256 id = _createTwo();
        uint256 clientBalanceBefore = usdc.balanceOf(client);

        vm.prank(provider1);
        coordinator.submitStage(id, 0, HTTPS_URI);
        vm.prank(client);
        coordinator.approveStage(id, 0);

        vm.prank(provider2);
        coordinator.submitStage(id, 1, "ipfs://bafybeigdyrzt");
        vm.prank(client);
        coordinator.rejectStage(id, 1);

        assertEq(usdc.balanceOf(provider1), 10 * UNIT);
        assertEq(usdc.balanceOf(provider2), 0);
        assertEq(usdc.balanceOf(client), clientBalanceBefore + 20 * UNIT);
        assertEq(usdc.balanceOf(address(coordinator)), 0);

        PipelineCoordinator.PipelineSummary memory pipeline = coordinator.getPipelineSummary(id);
        assertEq(uint256(pipeline.status), uint256(PipelineCoordinator.PipelineStatus.Rejected));
        assertEq(pipeline.paidOut, 10 * UNIT);
        assertEq(pipeline.refundedAmount, 20 * UNIT);
        assertGt(pipeline.finishedAt, 0);
        assertEq(uint256(coordinator.getStage(id, 1).status), uint256(PipelineCoordinator.StageStatus.Rejected));
    }

    function testRejectFullRefundBeforeAnyPayout() public {
        uint256 id = _createTwo();
        uint256 clientBalanceBefore = usdc.balanceOf(client);

        vm.prank(provider1);
        coordinator.submitStage(id, 0, HTTPS_URI);
        vm.prank(client);
        coordinator.rejectStage(id, 0);

        assertEq(usdc.balanceOf(client), clientBalanceBefore + TOTAL_TWO);
        assertEq(usdc.balanceOf(address(coordinator)), 0);
        assertEq(uint256(coordinator.getStage(id, 0).status), uint256(PipelineCoordinator.StageStatus.Rejected));
    }

    function testRejectRevertsForNonClient() public {
        uint256 id = _createTwo();

        vm.prank(provider1);
        vm.expectRevert(PipelineCoordinator.NotClient.selector);
        coordinator.rejectStage(id, 0);
    }

    function testRejectRevertsAfterRelevantDeadline() public {
        uint256 activeId = _createTwo();
        vm.warp(block.timestamp + DURATION);
        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.WorkDeadlinePassed.selector);
        coordinator.rejectStage(activeId, 0);

        uint256 submittedId = _createTwo();
        vm.prank(provider1);
        coordinator.submitStage(submittedId, 0, HTTPS_URI);
        vm.warp(block.timestamp + 86_400);
        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.EvaluationDeadlinePassed.selector);
        coordinator.rejectStage(submittedId, 0);
    }

    function testExpireAfterWorkDeadlineRefundsClient() public {
        uint256 id = _createTwo();
        vm.warp(block.timestamp + DURATION);

        vm.prank(outsider);
        coordinator.expirePipeline(id);

        assertEq(usdc.balanceOf(client), 1_000 * UNIT);
        assertEq(usdc.balanceOf(address(coordinator)), 0);

        PipelineCoordinator.PipelineSummary memory pipeline = coordinator.getPipelineSummary(id);
        assertEq(uint256(pipeline.status), uint256(PipelineCoordinator.PipelineStatus.Expired));
        assertEq(pipeline.refundedAmount, TOTAL_TWO);
        assertGt(pipeline.finishedAt, 0);
        assertEq(uint256(coordinator.getStage(id, 0).status), uint256(PipelineCoordinator.StageStatus.Expired));
    }

    function testExpireAfterEvaluationDeadlineRefundsClient() public {
        uint256 id = _createTwo();
        vm.prank(provider1);
        coordinator.submitStage(id, 0, HTTPS_URI);

        vm.warp(block.timestamp + 86_400);
        vm.prank(outsider);
        coordinator.expirePipeline(id);

        assertEq(usdc.balanceOf(client), 1_000 * UNIT);
        assertEq(usdc.balanceOf(address(coordinator)), 0);
        assertEq(
            uint256(coordinator.getPipelineSummary(id).status),
            uint256(PipelineCoordinator.PipelineStatus.Expired)
        );
    }

    function testExpireEarlyReverts() public {
        uint256 id = _createTwo();

        vm.prank(outsider);
        vm.expectRevert(PipelineCoordinator.NotExpired.selector);
        coordinator.expirePipeline(id);
    }

    function testExpireTerminalPipelineReverts() public {
        uint256 id = _createTwo();
        vm.warp(block.timestamp + DURATION);
        vm.prank(outsider);
        coordinator.expirePipeline(id);

        vm.prank(outsider);
        vm.expectRevert(PipelineCoordinator.PipelineNotActive.selector);
        coordinator.expirePipeline(id);
    }

    function testDoubleApproveReverts() public {
        uint256 id = _createTwo();
        vm.prank(provider1);
        coordinator.submitStage(id, 0, HTTPS_URI);
        vm.prank(client);
        coordinator.approveStage(id, 0);

        vm.prank(client);
        vm.expectRevert(PipelineCoordinator.InvalidStageIndex.selector);
        coordinator.approveStage(id, 0);
    }

    function testUnknownViewsRevert() public {
        vm.expectRevert(PipelineCoordinator.UnknownPipeline.selector);
        coordinator.getPipelineSummary(99);

        vm.expectRevert(PipelineCoordinator.UnknownPipeline.selector);
        coordinator.getStage(99, 0);

        uint256 id = _createTwo();
        vm.expectRevert(PipelineCoordinator.InvalidStageIndex.selector);
        coordinator.getStage(id, 2);
    }

    function testPipelineIndexesIncludeEveryParticipant() public {
        uint256 first = _createTwo();
        uint256 second = _createTwo();

        uint256[] memory clientIds = coordinator.getUserPipelineIds(client);
        assertEq(clientIds.length, 2);
        assertEq(clientIds[0], first);
        assertEq(clientIds[1], second);

        uint256[] memory providerIds = coordinator.getUserPipelineIds(provider1);
        assertEq(providerIds.length, 2);
        assertEq(providerIds[0], first);
        assertEq(providerIds[1], second);
    }
}
