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
    nftAddress: string
    collectionAddress: string
}

export interface UnwrapSolanaMetaplexNFTTransactionCache {
    nftAddress: string
    collectionAddress: string
}

