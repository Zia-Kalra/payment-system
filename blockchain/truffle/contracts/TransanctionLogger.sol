// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

contract TransactionLogger {
    
    // Structure to store each transaction's data
    struct TransactionRecord {
        string transactionHash;
        uint256 timestamp;
        bool exists;
    }
    
    // Mapping from transaction ID to its record
    mapping(string => TransactionRecord) private transactions;
    
    // Array to keep track of all transaction IDs
    string[] private transactionIds;
    
    // Events for logging
    event TransactionStored(string indexed transactionId, string transactionHash, uint256 timestamp);
    
    // Store transaction hash with its ID
    function storeTransaction(string memory _transactionId, string memory _transactionHash) public {
        // Create new record
        transactions[_transactionId] = TransactionRecord({
            transactionHash: _transactionHash,
            timestamp: block.timestamp,
            exists: true
        });
        
        // Add to IDs array
        transactionIds.push(_transactionId);
        
        // Emit event
        emit TransactionStored(_transactionId, _transactionHash, block.timestamp);
    }
    
    // Get transaction hash by ID
    function getTransaction(string memory _transactionId) public view returns (string memory, uint256, bool) {
        require(transactions[_transactionId].exists, "Transaction ID not found");
        TransactionRecord memory record = transactions[_transactionId];
        return (record.transactionHash, record.timestamp, record.exists);
    }
    
    // Get latest transaction (optional)
    function getLatestTransaction() public view returns (string memory, uint256, string memory) {
        require(transactionIds.length > 0, "No transactions");
        string memory latestId = transactionIds[transactionIds.length - 1];
        TransactionRecord memory record = transactions[latestId];
        return (record.transactionHash, record.timestamp, latestId);
    }
    
    // Verify if hash matches
    function verifyTransaction(string memory _transactionId, string memory _transactionHash) public view returns (bool) {
        require(transactions[_transactionId].exists, "Transaction ID not found");
        return keccak256(abi.encodePacked(transactions[_transactionId].transactionHash)) == keccak256(abi.encodePacked(_transactionHash));
    }
    
    // Get total transaction count
    function getTransactionCount() public view returns (uint256) {
        return transactionIds.length;
    }
    
    // Get all transaction IDs (for admin)
    function getAllTransactionIds() public view returns (string[] memory) {
        return transactionIds;
    }
    
    // Check if transaction exists
    function transactionExists(string memory _transactionId) public view returns (bool) {
        return transactions[_transactionId].exists;
    }
}