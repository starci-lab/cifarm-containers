import { NFTRarity, NFTType } from "@src/databases"
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
    Inventories = "inventories"
}

export interface WrapSolanaMetaplexNFTTransactionCache {
    nftMetadataId: string
}

export interface UnwrapSolanaMetaplexNFTTransactionCache {
    nftMetadataId: string
}

export interface BuyGoldsSolanaTransactionCache {
    selectionIndex: number
}

export interface BuyEnergySolanaTransactionCache {
    selectionIndex: number
}

export interface ConvertMetaplexNFTSolanaTransactionCache {
    nftName: string
    nftType: NFTType
    rarity: NFTRarity
    nftAddress: string
}

export interface ExtendedNFTBox { nftName: string, nftType: NFTType, rarity: NFTRarity, nftAddress: string }
export interface PurchaseSolanaNFTBoxTransactionCache {
    nftBoxes: Array<ExtendedNFTBox>
    network: Network    
    tokenAmount: number
}

export interface CreateShipSolanaTransactionCacheData {
    bulkId: string
}

export interface ConvertedNFT { nftName: string, nftType: NFTType, rarity: NFTRarity, nftAddress: string }
export interface ConvertSolanaMetaplexNFTsTransactionCache {
    convertedNFTs: Array<ConvertedNFT>
    network: Network 
}

