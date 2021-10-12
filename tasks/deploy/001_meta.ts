import { DeployFunction } from ".";
import { ethers } from "hardhat";
import { doTx } from "@ubeswap/hardhat-celo";
import { ContractKit } from "@celo/contractkit";
import { Signer } from "@ethersproject/abstract-signer";
import { Contract } from "@ethersproject/contracts";

export const deployMetaPool: DeployFunction = async (env, args) => {
  const [deployer] = env.celo.getSigners();
  //const kit = env.celo.kit;
  const { pooledTokens, decimals, lpTokenName, lpTokenSymbol, baseSwap } = args;

  // Default initialization values - these can be changed later
  const a = 50;
  const fee = Math.pow(10, 7); // 0.1% swap fee
  const adminPortion = Math.pow(10, 9); // 10% to admin
  const withdrawFee = 0;
  const depositFee = 0;

  const deployerAddress = await deployer?.getAddress();
  console.log(`Deploying from address ${deployerAddress}`);

  const MetaPool = await ethers.getContractFactory("MetaPool");
  const metaPoolContract = await MetaPool.deploy();

  await doTx(
    "Initialize meta pool",
    metaPoolContract.initializeMetaSwap(
      pooledTokens,
      decimals,
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
