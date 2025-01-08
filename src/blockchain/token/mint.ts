import { Contract, JsonRpcProvider, Wallet } from "ethers"
import { Network, Platform, chainKeyToPlatform } from "../blockchain.config"
import { PlatformNotFoundException } from "@src/exceptions"
import { evmHttpRpcUrl } from "../rpcs"
import { erc20Abi } from "../abis"

export interface MintParams {
    mintAmount: number,
    tokenAddress: string,
    toAddress: string,
    //go cannot sign the message by itself due to lack of sdk, so that this api assign go to send the privateKey,
    // via SSL data is encrypted and periphery do not collect privateKey
    minterPrivateKey: string,
    chainKey: string,
    network: Network
}

export interface MintResult {
    transactionHash: string,
}

export const _mintEvm = async ({
    chainKey,
    mintAmount,
    toAddress,
    minterPrivateKey,
    network,
    tokenAddress
}: MintParams): Promise<MintResult> => {
    const rpc = evmHttpRpcUrl(chainKey, network)
    const provider = new JsonRpcProvider(rpc)
    const wallet = new Wallet(minterPrivateKey, provider)
    const tokenContract = new Contract(tokenAddress, erc20Abi, wallet)
    
    const transaction = await tokenContract.getFunction("mint").send(toAddress, mintAmount)
    const receipt = await provider.waitForTransaction(transaction.hash)
    return {
        transactionHash: receipt.hash
    }
}

export const _mint = (params: MintParams) => {
    const platform = chainKeyToPlatform(params.chainKey)
    switch (platform) {
    case Platform.Evm: {
        return _mintEvm(params)
    }
    default:
        throw new PlatformNotFoundException(platform)
    }
}
