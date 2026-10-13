require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com", // Đã thay đổi
      accounts: ["e81207c6d62b8a61f209077d69378d8b045530d5d90346467ecc1f7df3417142"]
    }
  }
};