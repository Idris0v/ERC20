import { task } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";

task('mint', 'Mint tokens')
    .addParam('amount', 'amount of tokens')
    .setAction(async ({ amount }, { ethers }) => {
        if (!process.env.ERC20_ADDRESS) {
            throw new Error('process.env.ERC20_ADDRESS is not provided');
        }

        const erc20 = await ethers.getContractAt(
            "ERC20",
            process.env.ERC20_ADDRESS
        );
        const tx = await erc20.mint(amount);
        await tx.wait();
    });