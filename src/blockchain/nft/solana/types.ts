import { Attribute } from "@metaplex-foundation/mpl-core"
import { TransactionBuilder } from "@metaplex-foundation/umi"
import { WithFeePayer, WithNetwork } from "@src/blockchain/types"

export interface CreateFreezeNFTTransactionParams extends WithFeePayer {
    nftAddress: string
    collectionAddress?: string
}

export interface CreateCollectionParams extends WithNetwork {
    name: string
    metadata: MetaplexCollectionMetadata
}

export interface TransferNftParams extends WithNetwork {
    nftAddress: string
    toAddress: string
    collectionAddress: string
}

export interface MintNftParams extends WithNetwork {
    name: string
    collectionAddress: string
    metadata: MetaplexNFTMetadata
    ownerAddress?: string
}

export interface MetaplexCollectionMetadata {
    name: string
    description?: string
    image: string
    external_url?: string
    properties?: {
        files?: Array<{
            uri: string
            type: string
        }>
        category?: string
    }
    attributes?: Array<{
        trait_type: string
        value: string | number
    }>
    animation_url?: string
    youtube_url?: string
}

export interface CreateUnfreezeNFTTransactionParams extends WithFeePayer {
    nftAddress: string
    collectionAddress?: string
}

export interface CreateCollectionResponse {
    collectionAddress: string
    signature: string
}

export interface MetaplexNFTMetadata {
    name: string
    description?: string
    image: string
    external_url?: string
    properties?: {
        files?: Array<{
            uri: string
            type: string
        }>
        category?: string
    }
    attributes?: Array<{
        trait_type: string
        value: string | number
    }>
    animation_url?: string
    youtube_url?: string
}

export interface MintNFTResponse {
    nftAddress: string
    signature: string
}

export interface GetNFTParams extends WithNetwork {
    nftAddress: string
}

export interface TransferNftResponse {
    signature: string
}

export enum AttributeName {
    Stars = "stars",
    Rarity = "rarity",
    GrowthAcceleration = "growthAcceleration",
    QualityYield = "qualityYield",
    DiseaseResistance = "diseaseResistance",
    HarvestYieldBonus = "harvestYieldBonus",
    CurrentStage = "currentStage",
}

export enum AttributeTypeValue {
    Fruit = "fruit"
}

export interface TransactionResponse {
    serializedTx: string
}   

// mint nft - request and response
export interface CreateMintNFTTransactionParams extends WithFeePayer {
    name: string
    metadata: MetaplexNFTMetadata
    collectionAddress: string
    ownerAddress?: string
    attributes: Array<Attribute>
}
export interface CreateMintNFTTransactionResponse {
    transaction: TransactionBuilder
    nftAddress: string
    nftName: string
}

// transfer token 2022 - request and response
export interface CreateTransferTokenTransactionParams extends WithFeePayer {
    tokenAddress: string
    toAddress: string
    amount: number
    fromAddress: string
    decimals?: number
}

export interface CreateTransferTokenTransactionResponse {
    transaction: TransactionBuilder
}

export interface CreateUnfreezeNFTTransactionResponse {
    transaction: TransactionBuilder
}

export interface CreateFreezeNFTTransactionResponse {
    transaction: TransactionBuilder
}

export interface CreateUpgradeNFTTransactionParams extends WithFeePayer {
    nftAddress: string
    collectionAddress: string
    attributes: Array<Attribute>
}

export interface CreateUpgradeNFTTransactionResponse {
    transaction: TransactionBuilder
}

export interface CreateTransferSolTransactionParams extends WithFeePayer {
    fromAddress: string
    toAddress: string
    amount: number
}

export interface CreateTransferSolTransactionResponse {
    transaction: TransactionBuilder
}

export interface CreateComputeBudgetTransactionsParams extends WithNetwork {
    computeUnitLimit?: number
    computeUnitPrice?: number
}

export interface CreateComputeBudgetTransactionsResponse {
    limitTransaction: TransactionBuilder
    priceTransaction: TransactionBuilder
}