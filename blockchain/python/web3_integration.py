# web3_integration.py - Blockchain Connection and Interaction

from web3 import Web3
import json
import os
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
import time

from config import *

class BlockchainService:
    """Service to interact with Ethereum blockchain"""
    
    def __init__(self, use_testnet: bool = USE_TESTNET):
        """
        Initialize blockchain connection
        
        Args:
            use_testnet: True for Sepolia, False for Ganache
        """
        self.use_testnet = use_testnet
        self.w3 = self._connect_to_blockchain()
        self.contract = self._load_contract()
        self.account = self._load_account()
        
    def _connect_to_blockchain(self) -> Web3:
        """Establish connection to blockchain"""
        if self.use_testnet:
            # Connect to Sepolia
            w3 = Web3(Web3.HTTPProvider(SEPOLIA_RPC_URL))
        else:
            # Connect to local Ganache
            w3 = Web3(Web3.HTTPProvider(GANACHE_RPC_URL))
        
        # Check connection
        if not w3.is_connected():
            raise ConnectionError(f"Failed to connect to blockchain at {w3.provider.endpoint_uri}")
        
        print(f"✅ Connected to blockchain at {w3.provider.endpoint_uri}")
        print(f"   Current block: {w3.eth.block_number}")
        return w3
    
    def _load_contract(self):
        """Load smart contract"""
        # Get contract address
        if not Web3.is_address(CONTRACT_ADDRESS):
            raise ValueError(f"Invalid contract address: {CONTRACT_ADDRESS}")
        
        # Create contract instance
        contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(CONTRACT_ADDRESS),
            abi=CONTRACT_ABI
        )
        
        print(f"✅ Contract loaded at {CONTRACT_ADDRESS}")
        return contract
    
    def _load_account(self):
        """Load account from private key"""
        if not YOUR_PRIVATE_KEY or YOUR_PRIVATE_KEY == "0x...":
            raise ValueError("Please set YOUR_PRIVATE_KEY in config.py")
        
        account = self.w3.eth.account.from_key(YOUR_PRIVATE_KEY)
        print(f"✅ Account loaded: {account.address}")
        print(f"   Balance: {self.w3.eth.get_balance(account.address) / 1e18} ETH")
        
        return account
    
    def store_transaction_hash(self, transaction_id: str, transaction_hash: str) -> Dict[str, Any]:
        """
        Store transaction hash on blockchain
        
        Args:
            transaction_id: Unique transaction ID
            transaction_hash: SHA-256 hash of transaction
            
        Returns:
            Dictionary with blockchain transaction details
        """
        try:
            print(f"\n📝 Storing transaction {transaction_id} on blockchain...")
            
            # Check if transaction already exists
            exists = self.contract.functions.transactionExists(transaction_id).call()
            if exists:
                print(f"⚠️ Transaction {transaction_id} already exists on blockchain")
                existing = self.get_transaction_hash(transaction_id)
                return {
                    'success': False,
                    'message': 'Transaction already exists',
                    'existing_hash': existing['transaction_hash']
                }
            
            # Build transaction
            tx = self.contract.functions.storeTransaction(
                transaction_id,
                transaction_hash
            ).build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': GAS_LIMIT,
                'gasPrice': self.w3.eth.gas_price if not self.use_testnet else self.w3.to_wei(GAS_PRICE_GWEI, 'gwei')
            })
            
            # Sign transaction
            signed_tx = self.account.sign_transaction(tx)
            
            # Send transaction
            # NEW VERSION (for Web3.py v6+):
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            print(f"   Transaction sent: {tx_hash.hex()}")
            
            # Wait for receipt
            print("   Waiting for confirmation...")
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if tx_receipt['status'] == 1:
                print(f"   ✅ Transaction confirmed in block {tx_receipt['blockNumber']}")
                
                # Get the stored data to verify
                stored = self.get_transaction_hash(transaction_id)
                
                return {
                    'success': True,
                    'transaction_id': transaction_id,
                    'transaction_hash': transaction_hash,
                    'blockchain_tx_id': tx_hash.hex(),
                    'block_number': tx_receipt['blockNumber'],
                    'gas_used': tx_receipt['gasUsed'],
                    'blockchain_stored_hash': stored['transaction_hash'],
                    'timestamp': stored['timestamp']
                }
            else:
                print(f"   ❌ Transaction failed")
                return {
                    'success': False,
                    'message': 'Transaction failed',
                    'blockchain_tx_id': tx_hash.hex()
                }
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            return {
                'success': False,
                'message': str(e)
            }
    
    def get_transaction_hash(self, transaction_id: str) -> Optional[Dict[str, Any]]:
        """Get transaction hash from blockchain with retry logic"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Check if exists
                exists = self.contract.functions.transactionExists(transaction_id).call()
                if not exists:
                    return None
                
                # Get transaction data
                hash_str, timestamp, _ = self.contract.functions.getTransaction(transaction_id).call()
                dt_object = datetime.utcfromtimestamp(timestamp)
                
                return {
                    'transaction_id': transaction_id,
                    'transaction_hash': hash_str,
                    'timestamp': timestamp,
                    'timestamp_readable': dt_object.strftime('%Y-%m-%d %H:%M:%S'),
                    'exists': exists
                }
                
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"   ⚠️ Attempt {attempt + 1} failed, retrying in 2 seconds...")
                    time.sleep(2)
                    # Reconnect to blockchain
                    self.w3 = self._connect_to_blockchain()
                    self.contract = self._load_contract()
                else:
                    print(f"❌ Error getting transaction after {max_retries} attempts: {str(e)}")
                    return None
    
    def verify_transaction(self, transaction_id: str, transaction_hash: str) -> Dict[str, Any]:
        """
        Verify if transaction hash matches blockchain record
        
        Args:
            transaction_id: Transaction ID to verify
            transaction_hash: Hash to verify against
            
        Returns:
            Dictionary with verification result
        """
        try:
            print(f"\n🔍 Verifying transaction {transaction_id}...")
            
            # Check if exists
            exists = self.contract.functions.transactionExists(transaction_id).call()
            if not exists:
                return {
                    'verified': False,
                    'message': 'Transaction not found on blockchain',
                    'status': 'NOT_FOUND'
                }
            
            # Call verify function
            is_valid = self.contract.functions.verifyTransaction(
                transaction_id,
                transaction_hash
            ).call()
            
            # Get stored hash for comparison
            stored = self.get_transaction_hash(transaction_id)
            
            result = {
                'verified': is_valid,
                'transaction_id': transaction_id,
                'provided_hash': transaction_hash,
                'stored_hash': stored['transaction_hash'],
                'timestamp': stored['timestamp'],
                'timestamp_readable': stored['timestamp_readable'],
                'status': 'VALID' if is_valid else 'TAMPERED'
            }
            
            if is_valid:
                print(f"   ✅ Transaction is VALID - Hashes match")
            else:
                print(f"   ❌ Transaction TAMPERED - Hashes don't match")
                print(f"      Stored: {stored['transaction_hash'][:20]}...")
                print(f"      Provided: {transaction_hash[:20]}...")
            
            return result
            
        except Exception as e:
            print(f"❌ Error verifying transaction: {str(e)}")
            return {
                'verified': False,
                'message': str(e),
                'status': 'ERROR'
            }
    
    def get_all_transactions(self) -> Dict[str, Any]:
        """Get all transaction IDs from blockchain"""
        try:
            tx_ids = self.contract.functions.getAllTransactionIds().call()
            count = self.contract.functions.getTransactionCount().call()
            
            transactions = []
            for tx_id in tx_ids:
                tx_data = self.get_transaction_hash(tx_id)
                if tx_data:
                    transactions.append(tx_data)
            
            return {
                'total_count': count,
                'transactions': transactions
            }
            
        except Exception as e:
            print(f"❌ Error getting all transactions: {str(e)}")
            return {
                'total_count': 0,
                'transactions': [],
                'error': str(e)
            }
    
    def get_latest_transaction(self) -> Optional[Dict[str, Any]]:
        """Get latest transaction from blockchain"""
        try:
            hash_str, timestamp, tx_id = self.contract.functions.getLatestTransaction().call()
            
            dt_object = datetime.fromtimestamp(timestamp)
            
            return {
                'transaction_id': tx_id,
                'transaction_hash': hash_str,
                'timestamp': timestamp,
                'timestamp_readable': dt_object.strftime('%Y-%m-%d %H:%M:%S')
            }
            
        except Exception as e:
            print(f"❌ Error getting latest transaction: {str(e)}")
            return None
    
    def get_transaction_count(self) -> int:
        """Get total number of transactions stored"""
        try:
            return self.contract.functions.getTransactionCount().call()
        except Exception as e:
            print(f"❌ Error getting count: {str(e)}")
            return 0