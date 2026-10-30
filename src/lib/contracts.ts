import { isAddress, type Address } from 'viem'

export const pipelineCoordinatorAbi = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_usdc",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "EVALUATION_WINDOW",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_BRIEF_BYTES",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_PIPELINE_BUDGET",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_STAGES",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_STAGE_DURATION",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_TITLE_BYTES",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_URI_BYTES",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MIN_BRIEF_BYTES",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MIN_STAGES",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MIN_STAGE_BUDGET",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MIN_STAGE_DURATION",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MIN_TITLE_BYTES",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MIN_URI_BYTES",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "USDC_UNIT",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approveStage",
    "inputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "stageIndex",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createPipeline",
    "inputs": [
      {
        "name": "stages",
        "type": "tuple[]",
        "internalType": "struct PipelineCoordinator.StageInput[]",
        "components": [
          {
            "name": "provider",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "budget",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "title",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "brief",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "durationSeconds",
            "type": "uint32",
            "internalType": "uint32"
          }
        ]
      }
    ],
    "outputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "expirePipeline",
    "inputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getPipelineSummary",
    "inputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct PipelineCoordinator.PipelineSummary",
        "components": [
          {
            "name": "client",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "totalBudget",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "paidOut",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "refundedAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "currentStageIndex",
            "type": "uint8",
            "internalType": "uint8"
          },
          {
            "name": "stageCount",
            "type": "uint8",
            "internalType": "uint8"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum PipelineCoordinator.PipelineStatus"
          },
          {
            "name": "createdAt",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "finishedAt",
            "type": "uint64",
            "internalType": "uint64"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getStage",
    "inputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "stageIndex",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct PipelineCoordinator.StageView",
        "components": [
          {
            "name": "provider",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "budget",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "title",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "brief",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "durationSeconds",
            "type": "uint32",
            "internalType": "uint32"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum PipelineCoordinator.StageStatus"
          },
          {
            "name": "startedAt",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "dueAt",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "submittedAt",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "evaluationDeadline",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "deliverableURI",
            "type": "string",
            "internalType": "string"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserPipelineIds",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pipelineCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "rejectStage",
    "inputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "stageIndex",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "submitStage",
    "inputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "stageIndex",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "deliverableURI",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "usdc",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IERC20"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "PipelineCompleted",
    "inputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "client",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PipelineCreated",
    "inputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "client",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "totalBudget",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "stageCount",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PipelineExpired",
    "inputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "client",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PipelineRefunded",
    "inputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "client",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PipelineRejected",
    "inputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "client",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "StageExpired",
    "inputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "stageIndex",
        "type": "uint8",
        "indexed": true,
        "internalType": "uint8"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "StageHired",
    "inputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "stageIndex",
        "type": "uint8",
        "indexed": true,
        "internalType": "uint8"
      },
      {
        "name": "provider",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "budget",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "dueAt",
        "type": "uint64",
        "indexed": false,
        "internalType": "uint64"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "StageRejected",
    "inputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "stageIndex",
        "type": "uint8",
        "indexed": true,
        "internalType": "uint8"
      },
      {
        "name": "client",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "StageReleased",
    "inputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "stageIndex",
        "type": "uint8",
        "indexed": true,
        "internalType": "uint8"
      },
      {
        "name": "provider",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "StageSubmitted",
    "inputs": [
      {
        "name": "pipelineId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "stageIndex",
        "type": "uint8",
        "indexed": true,
        "internalType": "uint8"
      },
      {
        "name": "provider",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "deliverableURI",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "evaluationDeadline",
        "type": "uint64",
        "indexed": false,
        "internalType": "uint64"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "DuplicateProvider",
    "inputs": []
  },
  {
    "type": "error",
    "name": "EvaluationDeadlinePassed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidBrief",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidBudget",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidDuration",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidProvider",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidStageCount",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidStageIndex",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidStageStatus",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidTitle",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidTotalBudget",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidURI",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotClient",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotExpired",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotProvider",
    "inputs": []
  },
  {
    "type": "error",
    "name": "PipelineNotActive",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "SafeERC20FailedOperation",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "StageNotActive",
    "inputs": []
  },
  {
    "type": "error",
    "name": "StageNotSubmitted",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UnknownPipeline",
    "inputs": []
  },
  {
    "type": "error",
    "name": "WorkDeadlinePassed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ZeroAddress",
    "inputs": []
  }
] as const

export const deployedPipelineCoordinatorAddress: Address =
  '0x7f9fc5bc88876e07e6674cd29bc73b9dbf02f070'

const configuredAddress = import.meta.env.VITE_PIPELINE_CONTRACT_ADDRESS?.trim() ?? ''

export const pipelineCoordinatorAddress: Address = isAddress(configuredAddress)
  ? (configuredAddress as Address)
  : deployedPipelineCoordinatorAddress

export const isPipelineConfigured = true
