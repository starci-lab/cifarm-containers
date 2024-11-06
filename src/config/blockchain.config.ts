import { ChainKeyNotFoundException } from "@/exceptions"

export enum Network {
  Testnet = "testnet",
  Mainnet = "mainnet",
}

export interface NftCollectionInfo {
    collectionId: string
    defaultTitlePrefix: string
    defaultImageUrl: string
}

export enum NftCollectionKey {
    //đất phù sa
    FertileTile = "fertileTile",
    //bò
    Cow = "cow",
}
export interface ChainInfo {
    decimals: number
    nftCollections: Record<string, Record<Network, NftCollectionInfo>>
}

export enum SupportedChainKey {
    Sui = "sui",
    Aptos = "aptos",
    Avalanche = "avalanche",
    Solana = "solana",
    Bsc = "bsc",
    Algorand = "algorand",
    Polkadot = "polkadot",
    Near = "near",
  }

const DEFAULT_FERTILE_TILE_NFT_IMAGE_URL = "https://violet-lazy-yak-333.mypinata.cloud/ipfs/Qmd1x1KvmS4geRkHtXjXwNdUuBWN3unugXMbjBb5wpdqdp"
const DEFAULT_FERTILE_TILE_NFT_TITLE_PREFIX = "Fertile Tile #"

export type BlockchainConfig = Record<string, ChainInfo>
export const blockchainConfig = (): BlockchainConfig => ({
    [SupportedChainKey.Avalanche]: {
        decimals: 18,
        nftCollections: {
            [NftCollectionKey.FertileTile]: {
                [Network.Mainnet]: {
                    collectionId: "",
                    defaultImageUrl: DEFAULT_FERTILE_TILE_NFT_IMAGE_URL,
                    defaultTitlePrefix: DEFAULT_FERTILE_TILE_NFT_TITLE_PREFIX
                },
                [Network.Testnet]: {
                    collectionId: "0x2a86d07b6f49e8794051580e107d96f6feed0d27b52359e8d8c62af32c07cc34",
                    defaultImageUrl: DEFAULT_FERTILE_TILE_NFT_IMAGE_URL,
                    defaultTitlePrefix: DEFAULT_FERTILE_TILE_NFT_TITLE_PREFIX
                }
            },
        },
    },
    [SupportedChainKey.Solana]: {
        decimals: 9,
        nftCollections: {
            [NftCollectionKey.FertileTile]: {
                [Network.Mainnet]: {
                    collectionId: "",
                    defaultImageUrl: DEFAULT_FERTILE_TILE_NFT_IMAGE_URL,
                    defaultTitlePrefix: DEFAULT_FERTILE_TILE_NFT_TITLE_PREFIX
                },
                [Network.Testnet]: {
                    collectionId: "E31eadBc4uLfcHRSCLVVDPVngPavmZDVjzdGdjyCkbWZ",
                    defaultImageUrl: DEFAULT_FERTILE_TILE_NFT_IMAGE_URL,
                    defaultTitlePrefix: DEFAULT_FERTILE_TILE_NFT_TITLE_PREFIX
                }
            },
        },
    },
    [SupportedChainKey.Aptos]: {
        decimals: 18,
        nftCollections: {
            [NftCollectionKey.FertileTile]: {
                [Network.Mainnet]: {
                    collectionId: "",
                    defaultImageUrl: DEFAULT_FERTILE_TILE_NFT_IMAGE_URL,
                    defaultTitlePrefix: DEFAULT_FERTILE_TILE_NFT_TITLE_PREFIX
                },
                [Network.Testnet]: {
                    collectionId: "0x2a86d07b6f49e8794051580e107d96f6feed0d27b52359e8d8c62af32c07cc34",
                    defaultImageUrl: DEFAULT_FERTILE_TILE_NFT_IMAGE_URL,
                    defaultTitlePrefix: DEFAULT_FERTILE_TILE_NFT_TITLE_PREFIX
                }
            },
        },
    },
    [SupportedChainKey.Algorand]: {
        decimals: 6,
        nftCollections: {
            [NftCollectionKey.FertileTile]: {
                [Network.Mainnet]: {
                    collectionId: "",
                    defaultImageUrl: DEFAULT_FERTILE_TILE_NFT_IMAGE_URL,
                    defaultTitlePrefix: DEFAULT_FERTILE_TILE_NFT_TITLE_PREFIX
                },
                [Network.Testnet]: {
                    collectionId: "premiumTile1",
                    defaultImageUrl: DEFAULT_FERTILE_TILE_NFT_IMAGE_URL,
                    defaultTitlePrefix: DEFAULT_FERTILE_TILE_NFT_TITLE_PREFIX
                }
            },
        },
    },
    [SupportedChainKey.Polkadot]: {
        decimals: 10,
        nftCollections: {
            [NftCollectionKey.FertileTile]: {
                [Network.Mainnet]: {
                    collectionId: "",
                    defaultImageUrl: DEFAULT_FERTILE_TILE_NFT_IMAGE_URL,
                    defaultTitlePrefix: DEFAULT_FERTILE_TILE_NFT_TITLE_PREFIX
                },
                [Network.Testnet]: {
                    collectionId: "4191",
                    defaultImageUrl: DEFAULT_FERTILE_TILE_NFT_IMAGE_URL,
                    defaultTitlePrefix: DEFAULT_FERTILE_TILE_NFT_TITLE_PREFIX
                }
            },
        },
    },
    [SupportedChainKey.Near]: {
        decimals: 24,
        nftCollections: {
            [NftCollectionKey.FertileTile]: {
                [Network.Mainnet]: {
                    collectionId: "",
                    defaultImageUrl: DEFAULT_FERTILE_TILE_NFT_IMAGE_URL,
                    defaultTitlePrefix: DEFAULT_FERTILE_TILE_NFT_TITLE_PREFIX
                },
                [Network.Testnet]: {
                    collectionId: "starci123.testnet",
                    defaultImageUrl: DEFAULT_FERTILE_TILE_NFT_IMAGE_URL,
                    defaultTitlePrefix: DEFAULT_FERTILE_TILE_NFT_TITLE_PREFIX
                }
            },
        }
    }
})

export const defaultChainKey = Object.keys(blockchainConfig())[0] as SupportedChainKey
export const defaultNftCollectionKey = Object.keys(blockchainConfig()[defaultChainKey].nftCollections)[0]
export const defaultNetwork = Network.Testnet

export enum Platform {
  Evm = "evm",
  Solana = "solana",
  Aptos = "aptos",
  Algorand = "algorand",
  Polkadot = "polkadot",
  Near = "near",
}

export const chainKeyToPlatform = (chainKey: string): Platform => {
    switch (chainKey) {
    case SupportedChainKey.Avalanche:
        return Platform.Evm
    case SupportedChainKey.Solana:
        return Platform.Solana
    case SupportedChainKey.Aptos:
        return Platform.Aptos
    case SupportedChainKey.Algorand:
        return Platform.Algorand
    case SupportedChainKey.Polkadot:
        return Platform.Polkadot
    case SupportedChainKey.Near:
        return Platform.Near
    default:
        throw new ChainKeyNotFoundException(chainKey)
    }
}