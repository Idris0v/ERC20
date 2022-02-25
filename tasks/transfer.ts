import { task } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";

task('transfer', 'Transfer tokens to address')
    .addParam('recipient', 'Address of recipient')
    .addParam('amount', 'amount of tokens')
    .setAction(async ({ recipient, amount }, { ethers }) => {
        if (!process.env.ERC20_ADDRESS) {
            throw new Error('process.env.ERC20_ADDRESS is not provided');
        }

        const erc20 = await ethers.getContractAt("ERC20", process.env.ERC20_ADDRESS);
        const tx = await erc20.transfer(recipient, amount);
        await tx.wait();
    });