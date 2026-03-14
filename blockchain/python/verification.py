# verification.py - Verification API endpoints (for FastAPI integration)

from typing import Dict, Any, Optional
from datetime import datetime

# This file contains the functions that will be imported by Zia's FastAPI backend

class BlockchainVerification:
    """Verification class for FastAPI integration"""
    
    def __init__(self, blockchain_service):
        """
        Initialize with blockchain service instance
        
        Args:
            blockchain_service: Instance of BlockchainService
        """
        self.blockchain = blockchain_service
    
    async def verify_transaction_integrity(
        self, 
        transaction_id: str, 
        transaction_data: Optional[Dict[str, Any]] = None,
        transaction_hash: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Complete verification of transaction integrity
        
        Args:
            transaction_id: ID of transaction to verify
            transaction_data: Full transaction data (to generate hash if not provided)
            transaction_hash: Pre-generated hash (if available)
            
        Returns:
            Complete verification result
        """
        # If hash not provided, generate from transaction data
        if not transaction_hash and transaction_data:
            from hashing import generate_transaction_hash
            transaction_hash = generate_transaction_hash(transaction_data)
        elif not transaction_hash and not transaction_data:
            return {
                'success': False,
                'message': 'Either transaction_hash or transaction_data must be provided',
                'status': 'ERROR'
            }
        
        # Verify with blockchain
        verification_result = self.blockchain.verify_transaction(
            transaction_id,
            transaction_hash
        )
        
        return verification_result
    
    async def get_verification_status(self, transaction_id: str) -> Dict[str, Any]:
        """
        Get verification status without providing hash
        (Useful for admin dashboard)
        
        Args:
            transaction_id: Transaction ID to check
            
        Returns:
            Status of transaction on blockchain
        """
        # Get from blockchain
        stored = self.blockchain.get_transaction_hash(transaction_id)
        
        if not stored:
            return {
                'transaction_id': transaction_id,
                'registered_on_blockchain': False,
                'status': 'NOT_REGISTERED'
            }
        
        return {
            'transaction_id': transaction_id,
            'registered_on_blockchain': True,
            'stored_hash': stored['transaction_hash'],
            'timestamp': stored['timestamp_readable'],
            'status': 'REGISTERED',
            'needs_verification': True
        }
    
    async def bulk_verify_transactions(
        self, 
        transactions: list
    ) -> Dict[str, Any]:
        """
        Verify multiple transactions at once
        
        Args:
            transactions: List of dicts with transaction_id and either data or hash
            
        Returns:
            Summary of verification results
        """
        results = []
        verified_count = 0
        tampered_count = 0
        not_found_count = 0
        
        for tx in transactions:
            result = await self.verify_transaction_integrity(
                tx['transaction_id'],
                transaction_data=tx.get('transaction_data'),
                transaction_hash=tx.get('transaction_hash')
            )
            
            results.append(result)
            
            if result.get('status') == 'VALID':
                verified_count += 1
            elif result.get('status') == 'TAMPERED':
                tampered_count += 1
            elif result.get('status') == 'NOT_FOUND':
                not_found_count += 1
        
        return {
            'total_checked': len(transactions),
            'verified': verified_count,
            'tampered': tampered_count,
            'not_found': not_found_count,
            'results': results
        }