import { task } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";

task('mint', 'Mint tokens')
    .addParam('amount', 'amount of tokens')
    .addOptionalParam('to', 'address to mint to')
    .setAction(async ({ amount, to }, { ethers }) => {
        if (!process.env.ERC20_ADDRESS) {
            throw new Error('process.env.ERC20_ADDRESS is not provided');
        }

        const erc20 = await ethers.getContractAt(
            "ERC20",
            process.env.ERC20_ADDRESS
        );
        const [owner] = await ethers.getSigners();
        const tx = await erc20.mint((Number(amount)*10**8).toString(), to || owner.address);
        await tx.wait();
    });