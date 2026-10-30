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
    "type": "error",
    "name": "NotImplemented",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ZeroAddress",
    "inputs": []
  }
] as const

const configuredAddress = import.meta.env.VITE_PIPELINE_CONTRACT_ADDRESS ?? ''

export const pipelineCoordinatorAddress: Address | '' = isAddress(configuredAddress)
  ? (configuredAddress as Address)
  : ''

export const isPipelineConfigured = pipelineCoordinatorAddress !== ''
