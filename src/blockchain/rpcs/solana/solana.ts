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
        rpcUrl = "https://compatible-proud-brook.solana-devnet.quiknode.pro/594f2e2b5607c2b261998e63247a445dce1d347a/"
        //clusterApiUrl("devnet")
        break
    }
    }
    return rpcUrl
}