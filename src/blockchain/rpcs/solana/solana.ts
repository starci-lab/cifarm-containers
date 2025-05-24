import { Network } from "@src/env"
import { clusterApiUrl } from "@solana/web3.js"

export const solanaHttpRpcUrl = (network: Network) => {
    let rpcUrl = ""
    switch (network) {
    case Network.Mainnet: {
        rpcUrl = clusterApiUrl("mainnet-beta")
        break
    }
    case Network.Testnet: {
        rpcUrl = "https://compatible-proud-brook.solana-devnet.quiknode.pro/594f2e2b5607c2b261998e63247a445dce1d347a/"
        //clusterApiUrl("devnet")
        break
    }
    }
    return rpcUrl
}