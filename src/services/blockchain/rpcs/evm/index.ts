import { Network } from "@/config"
import { avalancheHttpRpcUrl, avalancheWsRpcUrl } from "./avalanche.evm"

export const evmHttpRpcUrl = (chainKey: string, network: Network) => {
    switch (chainKey) {
    case "avalanche": {
        return avalancheHttpRpcUrl(network)
    }
    default: throw new Error(`Chain not supported: ${chainKey}`)
    }
}

export const evmWsRpcUrl = (chainKey: string, network: Network) => {
    switch (chainKey) {
    case "avalanche": {
        return avalancheWsRpcUrl(network)
    }
    default: throw new Error(`Chain not supported: ${chainKey}`)
    }
}