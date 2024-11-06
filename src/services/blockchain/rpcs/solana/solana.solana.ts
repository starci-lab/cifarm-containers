import { Network } from "@/config"
import { clusterApiUrl } from "@solana/web3.js"

export const solanaHttpRpcUrl = (network: Network) => {
    let rpcUrl = ""
    switch (network) {
    case Network.Mainnet: {
        rpcUrl = clusterApiUrl("mainnet-beta")
        break
    }
    case Network.Testnet: {
        rpcUrl = clusterApiUrl("devnet")
        break
    }
    }
    return rpcUrl
}