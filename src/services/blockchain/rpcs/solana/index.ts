import { Network } from "@/config"
import { solanaHttpRpcUrl as _solanaHttpRpcUrl } from "./solana.solana"

export * from "./solana.solana"

export const solanaHttpRpcUrl = (chainKey: string, network: Network) => {
    switch (chainKey) {
    case "solana": {
        return _solanaHttpRpcUrl(network)
    }
    default: throw new Error(`Chain not supported: ${chainKey}`)
    }
}
