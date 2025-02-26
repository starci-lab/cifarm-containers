import { Inject, Injectable, Logger } from "@nestjs/common"
import { ChainKey, envConfig, Network } from "@src/env"
import { HONEYCOMB_EDGE_CLIENT_URL } from "./constants"
import createEdgeClient, { ResourceStorageEnum } from "@honeycomb-protocol/edge-client"
import { EdgeClient } from "@honeycomb-protocol/edge-client/client/types"
import { MODULE_OPTIONS_TOKEN } from "./honeycomb.module-definition"
import { HoneycombOptions } from "./types"
import { SolanaCoreService } from "@src/blockchain"
import { Keypair, VersionedTransaction } from "@solana/web3.js"
import { decode, encode } from "bs58"
import { sendTransaction } from "@honeycomb-protocol/edge-client/client/helpers"

@Injectable()
export class HoneycombService {
    private readonly logger = new Logger(HoneycombService.name)
    private readonly edgeClient: EdgeClient
    private authorityKeypairs: Record<Network, Keypair>
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: HoneycombOptions,
        private readonly solanaCoreService: SolanaCoreService
    ) {
        this.edgeClient = createEdgeClient(HONEYCOMB_EDGE_CLIENT_URL, true)

        this.authorityKeypairs = {
            [Network.Mainnet]: this.solanaCoreService.getKeypair(
                (this.options.authorityPrivateKeys?.[Network.Mainnet]) ??
                    envConfig().chainCredentials[ChainKey.Solana].honeycombAuthority[
                        Network.Mainnet
                    ].privateKey
            ),
            [Network.Testnet]: this.solanaCoreService.getKeypair(
                (this.options.authorityPrivateKeys?.[Network.Testnet]) ??
                    envConfig().chainCredentials[ChainKey.Solana].honeycombAuthority[
                        Network.Testnet
                    ].privateKey
            )
        }
    }

    private signTransaction({ network, parsedTransaction }: SignTransactionParams) {
        const tx = VersionedTransaction.deserialize(decode(parsedTransaction))
        console.log(tx)
        tx.sign([this.authorityKeypairs[network]])
        console.log(tx)
        return encode(tx.serialize())
    }

    public sendTransaction({ txResponse, network = Network.Testnet }: SendTransactionParams) {
        return sendTransaction(this.edgeClient, txResponse, [this.authorityKeypairs[network]])
    }

    public async createCreateCreateProjectTransaction({
        network = Network.Testnet,
        projectName,
        achievements,
        customDataFields
    }: CreateCreateProjectTransactionParams): Promise<CreateCreateProjectTransactionResponse> {
        const {
            createCreateProjectTransaction: {
                project: projectAddress, // This is the project address once it'll be created
                tx: txResponse // This is the transaction response, you'll need to sign and send this transaction
            }
        } = await this.edgeClient.createCreateProjectTransaction({
            name: projectName, // Name of the project
            authority: this.authorityKeypairs[network].publicKey.toBase58(), // Public key of the project authority, this authority has complete control over the project
            profileDataConfig: {
                achievements: achievements || [], // List of achievements
                customDataFields: customDataFields || [] // List of custom data fields
            }
        })
        // sign only, not sending the transaction
        const signedTransaction = this.signTransaction({
            network,
            parsedTransaction: txResponse.transaction
        })

        return {
            projectAddress,
            txResponse: {
                ...txResponse,
                transaction: signedTransaction
            }
        }
    }

    public async createCreateResourceTransaction({
        network = Network.Testnet,
        projectAddress,
        decimals = 6,
        name = "$CARROT",
        symbol = "$CARROT",
        uri = "https://example.com",
        storage = ResourceStorageEnum.AccountState
    }: CreateCreateResourceTransactionParams): Promise<CreateCreateResourceResponse> {
        const {
            createCreateNewResourceTransaction: {
                resource: resourceAddress, // This is the resource address once it'll be created
                tx: txResponse // This is the transaction response, you'll need to sign and send this transaction
            }
        } = await this.edgeClient.createCreateNewResourceTransaction({
            project: projectAddress,
            authority: this.authorityKeypairs[network].publicKey.toBase58(), // Public key of the resource authority, this authority has complete control over the resource
            params: {
                decimals, // Decimals of the resource
                name, // Name of the resource
                symbol, // Symbol of the resource
                uri, // URI of the resource
                storage // Type of the resource, can be either AccountState (uncompressed/unwrapped) or LedgerState (compressed/wrapped)
            }
        })
        // sign only, not sending the transaction
        const signedTransaction = this.signTransaction({
            network,
            parsedTransaction: txResponse.transaction
        })
        return {
            resourceAddress,
            txResponse: {
                ...txResponse,
                transaction: signedTransaction
            }
        }
    }

    public async createMintResourceTransaction({
        network = Network.Testnet,
        resourceAddress,
        amount,
        toAddress,
        payerAddress
    }: CreateMintResourceTransactionParams): Promise<CreateMintResourceTransactionResponse> {
        const {
            createMintResourceTransaction: txResponse // This is the transaction response, you'll need to sign and send this transaction
        } = await this.edgeClient.createMintResourceTransaction({
            resource: resourceAddress.toString(), // Resource public key as a string
            amount: amount.toString(), // Amount of the resource to mint
            authority: this.authorityKeypairs[network].publicKey.toBase58(), // Project authority's public key
            owner: toAddress, // The owner's public key, this wallet will receive the resource
            payer: payerAddress // Optional, specify when you want a different wallet to pay for the tx
        })
        const signedTransaction = this.signTransaction({
            network,
            parsedTransaction: txResponse.transaction
        })

        return { txResponse: { ...txResponse, transaction: signedTransaction } }
    }
}

export interface BaseHoneycombTransactionParams {
    network?: Network
    payerAddress?: string
}

export interface SignTransactionParams {
    parsedTransaction: string
    network: Network
}

export interface EdgeTxResponse {
    transaction: string
    blockhash: string
    lastValidBlockHeight: number
}

export interface BaseHoneycombTransactionResponse {
    txResponse: EdgeTxResponse
}

export interface CreateCreateProjectTransactionParams extends BaseHoneycombTransactionParams {
    projectName: string
    achievements?: Array<string>
    customDataFields?: Array<string>
}

export interface CreateCreateProjectTransactionResponse extends BaseHoneycombTransactionResponse {
    projectAddress: string
}

export type GetPublicKeyParams = BaseHoneycombTransactionParams

export interface CreateMintResourceTransactionParams extends BaseHoneycombTransactionParams {
    amount: number | string
    resourceAddress: string
    toAddress?: string
}

export type CreateMintResourceTransactionResponse = BaseHoneycombTransactionResponse
export interface CreateCreateResourceTransactionParams extends BaseHoneycombTransactionParams {
    projectAddress?: string
    name?: string
    decimals?: number
    symbol?: string
    uri?: string
    storage?: ResourceStorageEnum
}

export interface CreateCreateResourceResponse extends BaseHoneycombTransactionResponse {
    resourceAddress: string
}

export interface HoneycombProjectValue {
    projectAddress: string
    txHash: string
}

export interface HoneycombTokenValue {
    resourceAddress: string
    txHash: string
    decimals: number
    name: string
    symbol: string
    uri: string
    storage: ResourceStorageEnum
}

export enum HoneycombPrefix {
    Project = "honeycomb-project-",
    Token = "honeycomb-tokens-"
}

export interface SendTransactionParams {
    txResponse: EdgeTxResponse
    network?: Network
}
