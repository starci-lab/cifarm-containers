import { NFTRarity, NFTCollectionKey } from "@src/databases"
import { Network } from "@src/env"

export enum CacheKey {
    DeliverInstantly = "DeliverInstantly",
    PlantLastSchedule = "PlantLastSchedule",
    AnimalGrowthLastSchedule = "AnimalGrowthLastSchedule",
    EnergyRegenerationLastSchedule = "EnergyRegenerationLastSchedule"
}

export interface CacheOptions {
    cacheType?: CacheType;
}

export enum CacheType {
    Memory = "memory",
    Redis = "redis"
}

export enum CacheKey {
    PlacedItems = "placed-items",
    Inventories = "inventories",
    BlockchainBalances = "blockchain-balances",
    BlockchainBalancesRefreshed = "blockchain-balances-refreshed",
    BlockchainCollections = "blockchain-collections",
    BlockchainCollectionsRefreshed = "blockchain-collections-refreshed"
}

export interface WrapSolanaMetaplexNFTTransactionCache {
    nftMetadataId: string
}

export interface UnwrapSolanaMetaplexNFTTransactionCache {
    nftMetadataId: string
}

export interface CreateBuyGoldsSolanaTransactionCache {
    selectionIndex: number
}

export interface CreateBuyEnergySolanaTransactionCache {
    selectionIndex: number
}

export interface ConvertMetaplexNFTSolanaTransactionCache {
    nftName: string
    nftCollectionKey: NFTCollectionKey
    rarity: NFTRarity
    nftAddress: string
}

export interface ExtendedNFTBox { nftName: string, nftCollectionKey: NFTCollectionKey, rarity: NFTRarity, nftAddress: string }
export interface PurchaseSolanaNFTBoxTransactionCache {
    nftBoxes: Array<ExtendedNFTBox>
    network: Network    
    tokenAmount: number
}

export interface CreateShipSolanaTransactionCacheData {
    bulkId: string
    paidAmount: number
}

export interface ConvertedNFT { nftName: string, nftCollectionKey: NFTCollectionKey, rarity: NFTRarity, nftAddress: string }
export interface ConvertSolanaMetaplexNFTsTransactionCache {
    convertedNFTs: Array<ConvertedNFT>
    network: Network 
}

export interface CreateExpandLandLimitSolanaTransactionCache {
    selectionIndex: number
}

