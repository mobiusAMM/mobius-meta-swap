import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-solhint";
import "@nomiclabs/hardhat-waffle";
import "@ubeswap/hardhat-celo";
import { fornoURLs, ICeloNetwork } from "@ubeswap/hardhat-celo";
import "dotenv/config";
import "hardhat-abi-exporter";
import "hardhat-gas-reporter";
import { removeConsoleLog } from "hardhat-preprocessor";
import "hardhat-spdx-license-identifier";
import "hardhat-watcher";
import { HardhatUserConfig, task } from "hardhat/config";
import { ActionType, HDAccountsUserConfig } from "hardhat/types";
import "solidity-coverage";
require("hardhat-deploy");

task(
  "deploy-contracts",
  "Deploys contracts",
  async (...args: Parameters<ActionType<{ step: string }>>) => {
    return await (await import("./tasks/deploy")).deploy(...args);
  }
)
  .addParam("step", "The step to deploy")
  .addParam("pooledTokens", "Tokens in the pool")
  .addParam("decimals", "token decimals")
  .addParam("lpTokenName", "Name of the lp token for this swap")
  .addParam("lpTokenSymbol", "Symbol for the lp token")
  .addParam(
    "baseSwap",
    "Address of the base swap contract to be built on top of"
  );

// task(
//   "liveTest",
//   "Tests the connectors on the specified network",
//   async (...args: Parameters<ActionType<{ step: string }>>) => {
//     return await (await import("./tasks/tests")).test(...args);
//   }
// ).addParam("step", "The step to deploy");

// task("test", "Test the contracts", async () => {});
const accounts: HDAccountsUserConfig = {
  mnemonic:
    process.env.MNEMONIC ||
    "test test test test test test test test test test test junk",
  path: "m/44'/52752'/0'/0/",
};

//const accounts = [`0x${process.env.PRIVATE_KEY_DEV}`];

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  abiExporter: {
    path: "./build/abi",
    flat: true,
  },
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  networks: {
    mainnet: {
      url: fornoURLs[ICeloNetwork.MAINNET],
      accounts,
      chainId: ICeloNetwork.MAINNET,
      live: true,
      gasPrice: 0.5 * 10 ** 9,
      gas: 8000000,
    },
    alfajores: {
      url: fornoURLs[ICeloNetwork.ALFAJORES],
      accounts,
      chainId: ICeloNetwork.ALFAJORES,
      live: true,
      gasPrice: 0.5 * 10 ** 9,
      gas: 8000000,
    },
    hardhat: {
      chainId: 31337,
      accounts,
    },
  },
  paths: {
    deploy: "scripts/deploy",
    sources: "./contracts",
    tests: "./test",
    cache: "./build/cache",
    artifacts: "./build/artifacts",
  },
  preprocess: {
    eachLine: removeConsoleLog(
      (bre) =>
        bre.network.name !== "hardhat" && bre.network.name !== "localhost"
    ),
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 5000,
      },
    },
  },
  spdxLicenseIdentifier: {
    overwrite: false,
    runOnCompile: true,
  },
  tenderly: {
    project: process.env.TENDERLY_PROJECT,
    username: process.env.TENDERLY_USERNAME,
  },
  watcher: {
    compile: {
      tasks: ["compile"],
      files: ["./contracts"],
      verbose: true,
    },
  },
  namedAccounts: {
    deployer: 0,
  },
} as HardhatUserConfig;
