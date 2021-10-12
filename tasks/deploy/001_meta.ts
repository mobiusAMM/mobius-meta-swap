import { DeployFunction } from ".";
import { ethers } from "hardhat";
import { doTx } from "@ubeswap/hardhat-celo";

export const deployMetaPool: DeployFunction = async (env, args) => {
  const [deployer] = env.celo.getSigners();
  //const kit = env.celo.kit;
  const { pooledTokens, decimals, lpTokenName, lpTokenSymbol, baseSwap } = args;
  const pool = pooledTokens.split(",").map((s: string) => s.trim());
  const decimalsSplit = decimals.split(",").map((s: string) => s.trim());

  // Default initialization values - these can be changed later
  const a = 50;
  const fee = Math.pow(10, 7); // 0.1% swap fee
  const adminPortion = Math.pow(10, 9); // 10% to admin
  const withdrawFee = 0;
  const depositFee = 0;

  const deployerAddress = await deployer?.getAddress();
  console.log(`Deploying from address ${deployerAddress}`);
  const AmplificationUtils = await ethers.getContractFactory(
    "AmplificationUtils"
  );
  const ampLib = await AmplificationUtils.deploy();

  const MetaSwapUtils = await ethers.getContractFactory("MetaSwapUtils");
  const metaLib = await MetaSwapUtils.deploy();

  const SwapUtils = await ethers.getContractFactory("SwapUtils");
  const swapLib = await SwapUtils.deploy();

  const libraries = {
    AmplificationUtils: ampLib.address,
    MetaSwapUtils: metaLib.address,
    SwapUtils: swapLib.address,
  };
  const MetaPool = await ethers.getContractFactory("MetaSwap", { libraries });
  const metaPoolContract = await MetaPool.deploy();

  await doTx(
    "Initialize meta pool",
    metaPoolContract.initializeMetaSwap(
      pool,
      decimalsSplit,
      lpTokenName,
      lpTokenSymbol,
      a,
      fee,
      adminPortion,
      withdrawFee,
      depositFee,
      deployerAddress,
      baseSwap
    )
  );
  return {
    [`meta-${lpTokenName}`]: metaPoolContract.address,
  };
};
