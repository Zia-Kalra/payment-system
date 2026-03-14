# config.py - Configuration for Blockchain Module

import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Contract Details - UPDATE THESE AFTER DEPLOYMENT
CONTRACT_ADDRESS = "0xC875bCcF47303AeE182703d342A6E60Cd0e4465c"  # Replace with your deployed contract address

# Contract ABI - Copy from Remix after compilation
CONTRACT_ABI =[
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": True,
				"internalType": "string",
				"name": "transactionId",
				"type": "string"
			},
			{
				"indexed": False,
				"internalType": "string",
				"name": "transactionHash",
				"type": "string"
			},
			{
				"indexed": False,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "TransactionStored",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "getAllTransactionIds",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getLatestTransaction",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_transactionId",
				"type": "string"
			}
		],
		"name": "getTransaction",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTransactionCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_transactionId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_transactionHash",
				"type": "string"
			}
		],
		"name": "storeTransaction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_transactionId",
				"type": "string"
			}
		],
		"name": "transactionExists",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_transactionId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_transactionHash",
				"type": "string"
			}
		],
		"name": "verifyTransaction",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

# Blockchain Network Configuration
# For Sepolia Testnet (using Infura)
SEPOLIA_RPC_URL = "https://sepolia.infura.io/v3/d92c297145da4ed6a9d101b0edd3dbbd"  # Get from infura.io

# For local Ganache
GANACHE_RPC_URL = "http://127.0.0.1:7545"

# Choose which network to use
USE_TESTNET = False   # Set to True for Sepolia, False for Ganache

# Your wallet private key (for signing transactions)
# ⚠️ IMPORTANT: Never commit this to GitHub! Use environment variable
# Get from MetaMask or Ganache
YOUR_PRIVATE_KEY = "0xb03c75ac2a45de5daa7911342fd0f57e0c308bf06d301bfe8a4ebd6e7f0bc13a"  # Replace with your private key

# Gas settings
GAS_LIMIT = 300000
GAS_PRICE_GWEI = 20  # For Sepolia

# File paths
CONTRACT_ADDRESS_FILE = BASE_DIR / "docs" / "contract_address.txt"
CONTRACT_ABI_FILE = BASE_DIR / "docs" / "contract_abi.json"