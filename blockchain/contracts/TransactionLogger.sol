// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TransactionLogger {

    string public lastTransactionHash;

    function storeTransaction(string memory _hash) public {
        lastTransactionHash = _hash;
    }

    function getTransaction() public view returns (string memory) {
        return lastTransactionHash;
    }
}