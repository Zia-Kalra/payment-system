# Blockchain Module - Quick Start Guide for Backend

## Files Included
- `hashing.py` - Generate SHA-256 hashes
- `web3_integration.py` - Connect to blockchain
- `verification.py` - Verify transactions

## Contract Details
- Address: `0xC875bCcF47303AeE182703d342A6E60Cd0e4465c`
- Network: Ganache (localhost:7545)
- ABI: See `contract_abi.json`

## Quick Integration Example

```python
from hashing import generate_transaction_hash
from web3_integration import BlockchainService

# Initialize (once at startup)
blockchain = BlockchainService()

# When processing a payment:
tx_hash = generate_transaction_hash(transaction_data)
result = blockchain.store_transaction_hash(transaction_id, tx_hash)

# To verify:
verification = blockchain.verify_transaction(transaction_id, current_hash)