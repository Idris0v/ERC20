import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { ERC20 } from "../typechain";

describe("ERC20", function () {
  let erc20: ERC20;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let minterRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER'));

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    const Erc20: ContractFactory = await ethers.getContractFactory("ERC20");
    erc20 = (await Erc20.deploy("BURGER", "BURG")) as unknown as ERC20;
    await erc20.deployed();
  });

  it("Should create contract correctly", async function () {
    expect(await erc20.name()).to.equal("BURGER");
    expect(await erc20.symbol()).to.equal("BURG");
  });

  it("Should mint tokens", async function () {
    await mint();

    expect(await erc20.totalSupply()).to.equal(ethers.BigNumber.from(10));
  });

  it("Should forbid to mint tokens if not the owner", async function () {
    expect(erc20.connect(user1).mint(10, user1.address)).to.be.reverted;
    expect(await erc20.totalSupply()).to.equal(ethers.BigNumber.from(0));
  });

  it("Should grant minter role and grantee be able to mint", async function () {
    erc20.grantRole(minterRole, user1.address);
    await erc20.connect(user1).mint(10, user1.address);
    expect(await erc20.balanceOf(user1.address)).to.equal(ethers.BigNumber.from(10));
  });

  it("Should burn tokens", async function () {
    await mint();
    const burnTx = await erc20.burn(10, owner.address);
    await burnTx.wait();
    expect(await erc20.totalSupply()).to.equal(ethers.BigNumber.from(10));
  });

  it("Should forbid to burn tokens if not the owner", async function () {
    await mint();

    expect(erc20.connect(user1).burn(10, user1.address)).to.be.reverted;
    expect(await erc20.totalSupply()).to.equal(ethers.BigNumber.from(10));
  });

  it("Should transfer tokens", async function () {
    await mint();
    const transferTx = await erc20.transfer(user1.address, 5);
    await transferTx.wait();
    expect(await erc20.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(5));
    expect(await erc20.balanceOf(user1.address)).to.equal(ethers.BigNumber.from(5));
  });

  it("Should set approve for user", async function () {
    let approveTx = await erc20.approve(user1.address, 5);
    await approveTx.wait();

    const allowance = await erc20.allowance(owner.address, user1.address);
    
    expect(allowance).to.equal(ethers.BigNumber.from(5));
  });

  it("Should increase allowance for user", async function () {
    let tx = await erc20.approve(user1.address, 5);
    await tx.wait();
    tx = await erc20.increaseAllowance(user1.address, 5);
    await tx.wait();

    const allowance = await erc20.allowance(owner.address, user1.address);
    
    expect(allowance).to.equal(ethers.BigNumber.from(10));
  });

  it("Should decrease allowance for user", async function () {
    let tx = await erc20.approve(user1.address, 5);
    await tx.wait();
    tx = await erc20.decreaseAllowance(user1.address, 5);
    await tx.wait();

    const allowance = await erc20.allowance(owner.address, user1.address);
    
    expect(allowance).to.equal(ethers.BigNumber.from(0));
  });

  it("Should transferFrom tokens", async function () {
    await mint();
    let approveTx = await erc20.approve(user1.address, 5);
    await approveTx.wait();

    const transferTx = await erc20.connect(user1).transferFrom(owner.address, user2.address, 5);
    await transferTx.wait();
    expect(await erc20.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(5));
    expect(await erc20.balanceOf(user2.address)).to.equal(ethers.BigNumber.from(5));
  });

  it("Should revert transferFrom when requested more than allowed", async function () {
    await mint();
    let approveTx = await erc20.approve(user1.address, 5);
    await approveTx.wait();

    const transferFrom = erc20.connect(user1).transferFrom(owner.address, user2.address, 6);
    expect(transferFrom).to.be.revertedWith("Requested more than allowed");
    expect(await erc20.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(10));
    expect(await erc20.balanceOf(user2.address)).to.equal(ethers.BigNumber.from(0));
  });

  it("Should revert transferFrom when balances not enough", async function () {
    await mint();
    let approveTx = await erc20.approve(user1.address, 11);
    await approveTx.wait();

    const transferFrom = erc20.connect(user1).transferFrom(owner.address, user2.address, 11);
    expect(transferFrom).to.be.revertedWith("Not enough balance");
    expect(await erc20.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(10));
    expect(await erc20.balanceOf(user2.address)).to.equal(ethers.BigNumber.from(0));
  });

  async function mint(amount: number = 10) {
    const mintTx = await erc20.mint(amount, owner.address);
    await mintTx.wait();
  }
});
