import { Attribute } from "@metaplex-foundation/mpl-core"
import { TransactionBuilder } from "@metaplex-foundation/umi"
import { WithFeePayer } from "@src/blockchain/types"

export interface TransactionResponse {
    serializedTx: string
}   

// mint nft - request and response
export interface CreateMintNFTTransactionParams extends WithFeePayer {
    name: string
    uri: string
    collectionAddress: string
    ownerAddress?: string
    attributes: Array<Attribute>
}
export interface CreateMintNFTTransactionResponse {
    transaction: TransactionBuilder
    nftAddress: string
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


