import { UniqueChain, UniqueIndexer } from "@unique-nft/sdk"
import { Network } from "@/config"

const MAINNET_UNIQUE_CHAIN_SDK_RPC_URL = "https://rest.unique.network/v2/unique"
const TESTNET_UNIQUE_CHAIN_SDK_RPC_URL = "https://rest.unique.network/v2/opal"

const MAINNET_UNIQUE_CHAIN_INDEXER_RPC_URL = "https://api-unique.uniquescan.io/v2"
const TESTNET_UNIQUE_CHAIN_INDEXER_RPC_URL = "https://api-opal.uniquescan.io/v2"


const sdkRpcUrlMap: Record<Network, string> = {
    [Network.Mainnet]: MAINNET_UNIQUE_CHAIN_SDK_RPC_URL,
    [Network.Testnet]: TESTNET_UNIQUE_CHAIN_SDK_RPC_URL,
}

const indexerRpcUrlMap: Record<Network, string> = {
    [Network.Mainnet]: MAINNET_UNIQUE_CHAIN_INDEXER_RPC_URL,
    [Network.Testnet]: TESTNET_UNIQUE_CHAIN_INDEXER_RPC_URL,
}

export type PolkadotUniqueNetworkSdkClient = ReturnType<typeof UniqueChain>;
export type PolkadotUniqueNetworkIndexerClient = ReturnType<typeof UniqueIndexer>;

export const polkadotUniqueNetworkSdkClient = (
    network: Network,
): PolkadotUniqueNetworkSdkClient => {
    return UniqueChain({
        baseUrl: sdkRpcUrlMap[network],
    })
}

export const polkadotUniqueNetworkIndexerClient = (
    network: Network,
): PolkadotUniqueNetworkIndexerClient => {
    return UniqueIndexer({
        baseUrl: indexerRpcUrlMap[network],
    })
}