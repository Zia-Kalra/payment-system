# hashing.py - SHA-256 Hash Generation

import hashlib
import json
from datetime import datetime
from typing import Dict, Any

def generate_transaction_hash(transaction_data: Dict[str, Any]) -> str:
    """
    Generate SHA-256 hash from transaction details
    
    Args:
        transaction_data: Dictionary containing transaction details
            Required keys: transaction_id, user_id, amount, payment_method, timestamp
    
    Returns:
        SHA-256 hash as hexadecimal string
    """
    # Ensure all required fields are present
    required_fields = ['transaction_id', 'user_id', 'amount', 'payment_method', 'timestamp']
    for field in required_fields:
        if field not in transaction_data:
            raise ValueError(f"Missing required field: {field}")
    
    # Create a consistent string representation
    # Sort keys to ensure same order always
    sorted_data = {
        'transaction_id': str(transaction_data['transaction_id']),
        'user_id': str(transaction_data['user_id']),
        'amount': str(transaction_data['amount']),
        'payment_method': str(transaction_data['payment_method']),
        'timestamp': str(transaction_data['timestamp'])
    }
    
    # Add optional fields if present (for more robust hashing)
    if 'fraud_score' in transaction_data:
        sorted_data['fraud_score'] = str(transaction_data['fraud_score'])
    if 'device_type' in transaction_data:
        sorted_data['device_type'] = str(transaction_data['device_type'])
    if 'location' in transaction_data:
        sorted_data['location'] = str(transaction_data['location'])
    
    # Convert to JSON string with no extra spaces
    data_string = json.dumps(sorted_data, separators=(',', ':'))
    
    # Generate SHA-256 hash
    hash_object = hashlib.sha256(data_string.encode('utf-8'))
    hash_hex = hash_object.hexdigest()
    
    return hash_hex

def verify_hash(transaction_data: Dict[str, Any], expected_hash: str) -> bool:
    """
    Verify if transaction data matches a given hash
    
    Args:
        transaction_data: Transaction details
        expected_hash: Hash to compare against
    
    Returns:
        True if matches, False otherwise
    """
    generated_hash = generate_transaction_hash(transaction_data)
    return generated_hash == expected_hash

# Example usage and testing
if __name__ == "__main__":
    # Sample transaction
    sample_tx = {
        'transaction_id': 'TXN123456',
        'user_id': 'USER001',
        'amount': 5000.00,
        'payment_method': 'UPI',
        'timestamp': datetime.now().isoformat(),
        'device_type': 'mobile',
        'location': 'Mumbai'
    }
    
    # Generate hash
    tx_hash = generate_transaction_hash(sample_tx)
    print(f"Transaction Data: {sample_tx}")
    print(f"Generated Hash: {tx_hash}")
    print(f"Hash Length: {len(tx_hash)} characters")
    
    # Verify hash
    is_valid = verify_hash(sample_tx, tx_hash)
    print(f"Hash Valid: {is_valid}")
    
    # Test tampering
    tampered_tx = sample_tx.copy()
    tampered_tx['amount'] = 10000.00
    is_valid = verify_hash(tampered_tx, tx_hash)
    print(f"After tampering (amount changed): {is_valid}")