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
        rpcUrl = "https://rpc.test.honeycombprotocol.com"
        break
    }
    }
    return rpcUrl
}