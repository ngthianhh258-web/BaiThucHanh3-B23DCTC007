const hre = require("hardhat");

async function main() {
  const DAO = await hre.ethers.getContractFactory("DominionDAO");
  const dao = await DAO.deploy();
  await dao.waitForDeployment();
  console.log("DominionDAO deployed to:", await dao.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });