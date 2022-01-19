const dotenv = require("dotenv");
dotenv.config();

const { ethers } = require("ethers");

const json = require("./data.json");

const abi = require("./abi.json");

const { PRIVATE_KEY, CHAIN_ID, SC_ADDRESS, INFURA_KEY } = process.env;

if (!CHAIN_ID) throw new Error("CHAIN_ID is required in .env");
if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY is required in .env");
if (!SC_ADDRESS) throw new Error("SC_ADDRESS is required in .env");
if (!INFURA_KEY) throw new Error("INFURA_KEY is required in .env");

async function main() {
  function fromWeiWithDecimals(amount, decimals) {
    return amount / Math.pow(10, decimals);
  }

  function toWeiWithDecimals(amount, decimals) {
    return amount * Math.pow(10, decimals);
  }

  let provider = new ethers.providers.InfuraProvider(
    parseInt(CHAIN_ID),
    INFURA_KEY
  );

  let wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  let contract = new ethers.Contract(SC_ADDRESS, abi, wallet);

  let decimals = await contract.decimals();

  let amount = 0;
  let address = null;
  let estimation = null;
  let nonce = await wallet.getTransactionCount("pending");
  let tx = null;

  for (index in json) {
    address = json[index].from;
    amount = toWeiWithDecimals(json[index].amount, decimals);
    estimation = await contract.estimateGas.burn(address, amount);

    tx = await contract
      .burn(address, amount, {
        gasLimit: estimation,
        gasPrice: ethers.utils.parseUnits("68", "gwei"),
        nonce: nonce,
      })
      .then((transferResult) => {
        console.log(transferResult);
        nonce++;
      });
  }
}

main();
