import { clusterApiUrl } from "@solana/web3.js"
import { Network } from "@src/env"
// import { clusterApiUrl } from "@solana/web3.js"

export const solanaHttpRpcUrl = (network: Network) => {
    let rpcUrl = ""
    switch (network) {
    case Network.Mainnet: {
        rpcUrl = "https://mainnet.helius-rpc.com/?api-key=195f7f46-73d5-46df-989e-9d743bf3caad"
        break
    }
    case Network.Testnet: {
        rpcUrl = clusterApiUrl("devnet", true)
        break
    }
    }
    return rpcUrl
}