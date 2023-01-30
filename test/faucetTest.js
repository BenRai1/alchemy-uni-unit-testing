const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Faucet", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy();

    const [owner, signer1] = await ethers.getSigners();
    const withdrawAmount = ethers.utils.parseUnits("1", "ether");
    const contractAddress = faucet.address;

    console.log("Signer 1 address: ", owner.address);
    console.log("Contract address: ", faucet.address);
    return { faucet, owner, signer1, withdrawAmount, contractAddress };
  }

  it("should deploy and set the owner correctly", async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.owner()).to.equal(owner.address);
  });

  it("should revert if someone tries to withdraw more than 0.1 ETH", async function () {
    const { faucet, withdrawAmount } = await loadFixture(
      deployContractAndSetVariables
    );
    await expect(faucet.withdraw(withdrawAmount)).to.be.revertedWith(
      "You want to much eth"
    );
  });

  it("should revert if not the owner trys to destroy the contract", async function () {
    const { faucet, signer1 } = await loadFixture(
      deployContractAndSetVariables
    );
    await expect(faucet.connect(signer1).destroyFaucet()).to.be.revertedWith(
      "You are not the owner"
    );
  });

  it("should revert if not the owner trys to withdraw all", async function () {
    const { faucet, signer1 } = await loadFixture(
      deployContractAndSetVariables
    );
    await expect(faucet.connect(signer1).withdrawAll()).to.be.revertedWith(
      "You are not the owner"
    );
  });

  it("should destroy the contract if the owner calls destroyFaucet", async function () {
    const { faucet, contractAddress } = await loadFixture(
      deployContractAndSetVariables
    );
    await faucet.destroyFaucet();
    expect(await ethers.provider.getCode(contractAddress)).to.equal("0x");
  });
});
