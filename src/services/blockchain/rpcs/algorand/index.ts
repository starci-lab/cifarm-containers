import { Network } from "@/config"
import { Algodv2, Indexer } from "algosdk"

export const TESTNET_ALGOD_SERVER_URL = "https://testnet-api.algonode.cloud"
export const TESTNET_INDEXER_SERVER_URL = "https://testnet-idx.algonode.cloud"

export const MAINNET_ALGOD_SERVER_URL = "https://mainnet-api.algonode.cloud"
export const MAINNET_INDEXER_SERVER_URL = "https://mainnet-idx.algonode.cloud"

const algodNetworkMap: Record<Network, string> = {
    [Network.Mainnet]: MAINNET_ALGOD_SERVER_URL,
    [Network.Testnet]: TESTNET_ALGOD_SERVER_URL
}

export const algorandAlgodClient = (network: Network) => {
    const algodNetwork = algodNetworkMap[network]
    return new Algodv2("", algodNetwork)
}

const indexerNetworkMap: Record<Network, string> = {
    [Network.Mainnet]: MAINNET_INDEXER_SERVER_URL,
    [Network.Testnet]: TESTNET_INDEXER_SERVER_URL
}

export const algorandIndexerClient = (network: Network) => {
    const indexerNetwork = indexerNetworkMap[network]
    return new Indexer("", indexerNetwork, 443)
}