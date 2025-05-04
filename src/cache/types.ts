import { NFTType, NFTRarity } from "@src/databases"

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

export interface PurchaseSolanaNFTBoxTransactionCache {
    nftType: NFTType
    rarity: NFTRarity
    nftName: string
    tokenAmount: number
}
