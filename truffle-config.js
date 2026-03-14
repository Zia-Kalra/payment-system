module.exports = {
    // Tell Truffle where to find your contracts
    contracts_directory: "./blockchain/contracts",
    
    // Where to output the JSON build files
    contracts_build_directory: "./blockchain/truffle/build/contracts",
    
    // Tell Truffle where to find your migration files
    migrations_directory: "./blockchain/truffle/migrations",
    
    networks: {
      development: {
        host: "127.0.0.1",
        port: 7545,
        network_id: "*",
      }
    },
    
    compilers: {
      solc: {
        version: "0.8.31",
        settings: {
          evmVersion: "london"
        }
      }
    }
  };