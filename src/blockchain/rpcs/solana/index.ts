import { Network } from "../../blockchain.config"
import { solanaHttpRpcUrl as _solanaHttpRpcUrl } from "./solana"

export * from "./solana"

export const solanaHttpRpcUrl = (chainKey: string, network: Network) => {
    switch (chainKey) {
    case "solana": {
        return _solanaHttpRpcUrl(network)
    }
    default: throw new Error(`Chain not supported: ${chainKey}`)
    }
}
