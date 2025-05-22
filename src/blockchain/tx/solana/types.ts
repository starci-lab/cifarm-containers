import { Attribute } from "@metaplex-foundation/mpl-core"
import { TransactionBuilder } from "@metaplex-foundation/umi"
import { WithFeePayer, WithNetwork } from "@src/blockchain/types"

export interface CreateSolanaFreezeNFTTransactionParams extends WithFeePayer {
    nftAddress: string
    collectionAddress?: string
}

export interface CreateSolanaCollectionParams extends WithNetwork {
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

export interface CreateSolanaUnfreezeNFTTransactionParams extends WithFeePayer {
    nftAddress: string
    collectionAddress?: string
}

export interface CreateSolanaCollectionResponse {
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

export interface TransactionResponse {
    serializedTx: string
}   

// mint nft - request and response
export interface CreateSolanaMintNFTTransactionParams extends WithFeePayer {
    name: string
    metadata: MetaplexNFTMetadata
    collectionAddress: string
    ownerAddress?: string
    attributes: Array<Attribute>
}

export interface CreateSolanaMintNFTTransactionResponse {
    transaction: TransactionBuilder
    nftAddress: string
    nftName: string
}

// transfer token 2022 - request and response
export interface CreateSolanaTransferTokenTransactionParams extends WithFeePayer {
    tokenAddress: string
    toAddress: string
    amount: number
    fromAddress: string
    decimals?: number
}

export interface CreateSolanaTransferTokenTransactionResponse {
    transaction: TransactionBuilder
}

export interface CreateSolanaUnfreezeNFTTransactionResponse {
    transaction: TransactionBuilder
}

export interface CreateSolanaFreezeNFTTransactionResponse {
    transaction: TransactionBuilder
}

export interface CreateSolanaUpgradeNFTTransactionParams extends WithFeePayer {
    nftAddress: string
    collectionAddress: string
    attributes: Array<Attribute>
}

export interface CreateSolanaUpgradeNFTTransactionResponse {
    transaction: TransactionBuilder
}

export interface CreateSolanaTransferSolTransactionParams extends WithFeePayer {
    fromAddress: string
    toAddress: string
    amount: number
}

export interface CreateSolanaTransferSolTransactionResponse {
    transaction: TransactionBuilder
}

export interface CreateSolanaComputeBudgetTransactionsParams extends WithNetwork {
    computeUnitLimit?: number
    computeUnitPrice?: number
}

export interface CreateSolanaComputeBudgetTransactionsResponse {
    limitTransaction: TransactionBuilder
    priceTransaction: TransactionBuilder
}