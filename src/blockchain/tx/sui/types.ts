import { Attribute } from "@metaplex-foundation/mpl-core"
import { TransactionBuilder } from "@metaplex-foundation/umi"
import { Transaction } from "@mysten/sui/transactions"
import { WithFeePayer, WithNetwork } from "@src/blockchain/types"

export interface CreateSuiFreezeNFTTransactionParams extends WithFeePayer {
    nftAddress: string
    collectionAddress?: string
}

export interface CreateSuiUnfreezeNFTTransactionParams extends WithFeePayer {
    nftAddress: string
    collectionAddress?: string
}

export interface CreateSuiCollectionResponse {
    collectionAddress: string
    signature: string
}

export interface SuiNFTMetadata {
    name: string
    description?: string
    image: string
}

// mint nft - request and response
export interface CreateSuiMintNFTTransactionParams {
    nftTreasuryCapId: string
    name: string
    metadata: SuiNFTMetadata
    collectionAddress: string
    ownerAddress?: string
    attributes: Array<Attribute>
    transaction?: Transaction
}

export interface CreateSuiMintNFTTransactionResponse {
    transaction: Transaction
}

// transfer token 2022 - request and response
export interface CreateSuiTransferTokenTransactionParams extends WithFeePayer {
    tokenAddress: string
    toAddress: string
    amount: number
    fromAddress: string
    decimals?: number
}

export interface CreateSuiTransferTokenTransactionResponse {
    transaction: TransactionBuilder
}

export interface CreateSuiUnfreezeNFTTransactionResponse {
    transaction: TransactionBuilder
}

export interface CreateSuiFreezeNFTTransactionResponse {
    transaction: TransactionBuilder
}

export interface CreateSuiUpgradeNFTTransactionParams extends WithFeePayer {
    nftAddress: string
    collectionAddress: string
    attributes: Array<Attribute>
}

export interface CreateSuiUpgradeNFTTransactionResponse {
    transaction: TransactionBuilder
}

export interface CreateSuiTransferSolTransactionParams extends WithFeePayer {
    fromAddress: string
    toAddress: string
    amount: number
}

export interface CreateSuiTransferSolTransactionResponse {
    transaction: TransactionBuilder
}

export interface CreateSuiComputeBudgetTransactionsParams extends WithNetwork {
    computeUnitLimit?: number
    computeUnitPrice?: number
}

export interface CreateSuiComputeBudgetTransactionsResponse {
    limitTransaction: TransactionBuilder
    priceTransaction: TransactionBuilder
}