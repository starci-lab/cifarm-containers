import { Inject, Injectable, Logger } from "@nestjs/common"
import { ChainKey, envConfig, Network } from "@src/env"
import { edgeClientUrlMap } from "./constants"
import createEdgeClient, {
    CharacterConfigInput,
    CharacterCooldownInput,
    CreateSplStakingPoolMetadataInput,
    MintAsInput,
    ProfileInfoInput,
    ResourceStorageEnum,
    TreeSetupConfig,
    UserInfoInput
} from "@honeycomb-protocol/edge-client"
import { EdgeClient } from "@honeycomb-protocol/edge-client/client/types"
import { MODULE_OPTIONS_TOKEN } from "./honeycomb.module-definition"
import { HoneycombOptions } from "./types"
import { SolanaCoreService } from "@src/blockchain"
import { Keypair, VersionedTransaction } from "@solana/web3.js"
import { decode, encode } from "bs58"
import { sendTransaction } from "@honeycomb-protocol/edge-client/client/helpers"
import { Atomic } from "@src/common"

@Injectable()
export class HoneycombService {
    private readonly logger = new Logger(HoneycombService.name)
    private authorityKeypairs: Record<Network, Keypair>
    private edgeClients: Record<Network, EdgeClient>
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: HoneycombOptions,
        private readonly solanaCoreService: SolanaCoreService
    ) {
        this.edgeClients = {
            [Network.Mainnet]: createEdgeClient(edgeClientUrlMap[Network.Mainnet], true),
            [Network.Testnet]: createEdgeClient(edgeClientUrlMap[Network.Testnet], true)
        }
        this.authorityKeypairs = {
            [Network.Mainnet]: this.solanaCoreService.getKeypair(
                this.options.authorityPrivateKeys?.[Network.Mainnet] ??
                    envConfig().chainCredentials[ChainKey.Solana].honeycombAuthority[
                        Network.Mainnet
                    ].privateKey
            ),
            [Network.Testnet]: this.solanaCoreService.getKeypair(
                this.options.authorityPrivateKeys?.[Network.Testnet] ??
                    envConfig().chainCredentials[ChainKey.Solana].honeycombAuthority[
                        Network.Testnet
                    ].privateKey
            )
        }
    }

    private signTransaction({ network, parsedTransaction }: SignTransactionParams) {
        const tx = VersionedTransaction.deserialize(decode(parsedTransaction))
        console.log({
            tx
        })
        tx.sign([this.authorityKeypairs[network]])
        return encode(tx.serialize())
    }

    public sendTransaction({ txResponse, network = Network.Testnet }: SendTransactionParams) {
        return sendTransaction(this.edgeClients[network], txResponse, [
            this.authorityKeypairs[network]
        ])
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
        } = await this.edgeClients[network].createCreateProjectTransaction({
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
        } = await this.edgeClients[network].createCreateNewResourceTransaction({
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
        } = await this.edgeClients[network].createMintResourceTransaction({
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

    public async createCreateSplStakingPoolTransaction({
        network = Network.Testnet,
        projectAddress,
        tokenAddress,
        metadata
    }: CreateCreateSplStakingPoolTransactionParams): Promise<CreateCreateSplStakingPoolTransactionResponse> {
        console.log({
            project: projectAddress.toString(),
            stakeTokenMint: tokenAddress.toString(), // Token's mint address in string format
            authority: this.authorityKeypairs[network].publicKey.toBase58(), // Authority's pubkey address in string format
            payer: this.authorityKeypairs[network].publicKey.toBase58(), // Authority's pubkey address in string format
            metadata,
            multipliers: [
                {
                    // Provide either minAmount or minDuration or both
                    value: "10",
                    type: {
                        minAmount: "1000"
                    }
                },
                {
                    value: "3",
                    type: {
                        minDuration: "60"
                    }
                }
            ]
        })
        const {
            createCreateSplStakingPoolTransaction: {
                tx: txResponse, // The transaction response, you'll need to sign and send this transaction
                splStakingPoolAddress
            }
        } = await this.edgeClients[network].createCreateSplStakingPoolTransaction({
            project: projectAddress.toString(),
            stakeTokenMint: tokenAddress.toString(), // Token's mint address in string format
            authority: this.authorityKeypairs[network].publicKey.toBase58(), // Authority's pubkey address in string format
            payer: this.authorityKeypairs[network].publicKey.toBase58(), // Authority's pubkey address in string format
            metadata,
            multipliers: [
                {
                    // Provide either minAmount or minDuration or both
                    value: "10",
                    type: {
                        minAmount: "1000"
                    }
                },
                {
                    value: "3",
                    type: {
                        minDuration: "60"
                    }
                }
            ]
        })
        console.log({
            txResponse,
            splStakingPoolAddress
        })

        const signedTransaction = this.signTransaction({
            network,
            parsedTransaction: txResponse.transaction
        })

        return {
            txResponse: { ...txResponse, transaction: signedTransaction },
            splStakingPoolAddress
        }
    }

    public async createCreateNewSplStakingPoolTreeTransaction({
        network = Network.Testnet,
        projectAddress,
        splStakingPoolAddress,
        delegateAuthority,
        payerAddress,
        numAssets
    }: CreateCreateNewSplStakingPoolTreeTransactionParams): Promise<CreateCreateNewSplStakingPoolTreeTransactionResponse> {
        const {
            createCreateNewSplStakingPoolTreeTransaction: {
                tx: txResponse, // The transaction response, you'll need to sign and send this transaction
                treeAddress
            }
        } = await this.edgeClients[network].createCreateNewSplStakingPoolTreeTransaction({
            project: projectAddress.toString(),
            splStakingPool: splStakingPoolAddress, // Staking pool address in string format
            authority: this.authorityKeypairs[network].publicKey.toBase58(), // Authority's pubkey address in string format
            delegateAuthority, // Optional, delegate authority's pubkey address in string format
            payer: payerAddress, // Optional, fee payer's pubkey address in string format
            treeConfig: {
                basic: {
                    numAssets
                }
            }
        })

        const signedTransaction = this.signTransaction({
            network,
            parsedTransaction: txResponse.transaction
        })

        return { txResponse: { ...txResponse, transaction: signedTransaction }, treeAddress }
    }

    public async createCreateProfilesTreeTransaction({
        network = Network.Testnet,
        projectAddress,
        numAssets
    }: CreateCreateProfilesTreeTransactionParams): Promise<CreateCreateProfilesTreeTransactionResponse> {
        const {
            createCreateProfilesTreeTransaction: {
                tx: txResponse, // This is the transaction response, you'll need to sign and send this transaction
                treeAddress
            } // This is the transaction response, you'll need to sign and send this transaction
        } = await this.edgeClients[network].createCreateProfilesTreeTransaction({
            payer: this.authorityKeypairs[network].publicKey.toBase58(),
            project: projectAddress.toString(),
            treeConfig: {
                basic: { numAssets }
            }
        })

        const signedTransaction = this.signTransaction({
            network,
            parsedTransaction: txResponse.transaction
        })

        return { txResponse: { ...txResponse, transaction: signedTransaction }, treeAddress }
    }

    public async createNewProfileTransaction({
        network = Network.Testnet,
        projectAddress,
        payerAddress,
        identity,
        info
    }: CreateNewProfileTransactionParams): Promise<CreateNewProfileTransactionResponse> {
        const { createNewProfileTransaction: txResponse } = await this.edgeClients[
            network
        ].createNewProfileTransaction({
            project: projectAddress.toString(), // The project's public key
            payer: payerAddress, // The transaction payer's public key, the profile will also be created for this payer
            identity, // Identity type in string, the value depends on the project's needs
            info // Optional, profile information, all values in the object are optional
        })

        const signedTransaction = this.signTransaction({
            network,
            parsedTransaction: txResponse.transaction
        })

        return { txResponse: { ...txResponse, transaction: signedTransaction } }
    }

    public async createNewUserWithProfileTransaction({
        network = Network.Testnet,
        projectAddress,
        userPublicKey,
        userInfo,
        payerAddress
    }: CreateNewUserWithProfileTransactionParams): Promise<CreateNewUserWithProfileTransactionResponse> {
        const { createNewUserWithProfileTransaction: txResponse } = await this.edgeClients[
            network
        ].createNewUserWithProfileTransaction({
            project: projectAddress.toString(),
            wallet: userPublicKey.toString(),
            profileIdentity: "main",
            payer: payerAddress,
            userInfo
        })

        const signedTransaction = this.signTransaction({
            network,
            parsedTransaction: txResponse.transaction
        })

        return { txResponse: { ...txResponse, transaction: signedTransaction } }
    }

    public async createCreateAssemblerConfigTransaction({
        network = Network.Testnet,
        projectAddress,
        payerAddress,
        treeConfig,
        ticker,
        order
    }: CreateCreateAssemblerConfigTransactionParams): Promise<CreateCreateAssemblerConfigTransactionResponse> {
        const {
            createCreateAssemblerConfigTransaction: { tx: txResponse, assemblerConfig: assemblerConfigAddress }
        } = await this.edgeClients[network].createCreateAssemblerConfigTransaction({
            project: projectAddress.toString(),
            authority: this.authorityKeypairs[network].publicKey.toBase58(),
            payer: payerAddress,
            treeConfig,
            ticker,
            order
        })

        const signedTransaction = this.signTransaction({
            network,
            parsedTransaction: txResponse.transaction
        })

        return { txResponse: { ...txResponse, transaction: signedTransaction }, assemblerConfigAddress }
    }

    public async createCreateCharacterModelTransaction({
        network = Network.Testnet,
        projectAddress,
        payerAddress,
        mintAs,
        config,
        attributes,
        cooldown
    }: CreateCreateCharacterModelTransactionParams): Promise<CreateCreateCharacterModelTransactionResponse> {
        const {
            createCreateCharacterModelTransaction: { tx: txResponse, characterModel: characterModelAddress }
        } = await this.edgeClients[network].createCreateCharacterModelTransaction({
            project: projectAddress.toString(),
            authority: this.authorityKeypairs[network].publicKey.toBase58(),
            payer: payerAddress,
            mintAs,
            config,
            attributes,
            cooldown
        })

        const signedTransaction = this.signTransaction({
            network,
            parsedTransaction: txResponse.transaction
        })

        return { txResponse: { ...txResponse, transaction: signedTransaction }, characterModelAddress }
    }

    public async createCreateCharactersTreeTransaction({
        network = Network.Testnet,
        projectAddress,
        characterModel,
        payerAddress,
        treeConfig
    }: CreateCreateCharactersTreeTransactionParams): Promise<CreateCreateCharactersTreeTransactionResponse> {
        const {
            createCreateCharactersTreeTransaction: { tx: txResponse, treeAddress }
        } = await this.edgeClients[network].createCreateCharactersTreeTransaction({
            authority: this.authorityKeypairs[network].publicKey.toBase58(),
            project: projectAddress.toString(),
            characterModel: characterModel.toString(),
            payer: payerAddress,
            treeConfig
        })

        const signedTransaction = this.signTransaction({
            network,
            parsedTransaction: txResponse.transaction
        })

        return { txResponse: { ...txResponse, transaction: signedTransaction }, treeAddress }
    }

    public async createAssembleCharacterTransaction({
        network = Network.Testnet,
        projectAddress,
        assemblerConfig,
        characterModel,
        userPublicKey,
        payerAddress,
        attributes
    }: CreateAssembleCharacterTransactionParams): Promise<CreateAssembleCharacterTransactionResponse> {
        const { createAssembleCharacterTransaction: txResponse } = await this.edgeClients[
            network
        ].createAssembleCharacterTransaction({
            project: projectAddress.toString(),
            assemblerConfig: assemblerConfig.toString(),
            characterModel: characterModel.toString(),
            attributes,
            authority: this.authorityKeypairs[network].publicKey.toBase58(),
            owner: userPublicKey.toString(),
            payer: payerAddress
        })

        const signedTransaction = this.signTransaction({
            network,
            parsedTransaction: txResponse.transaction
        })

        return { txResponse: { ...txResponse, transaction: signedTransaction } }
    }
}

export interface CreateAssembleCharacterTransactionParams extends BaseHoneycombTransactionParams {
    projectAddress: string
    assemblerConfig: string
    characterModel: string
    userPublicKey: string
    attributes: Array<[Atomic, Atomic]>
}

export type CreateAssembleCharacterTransactionResponse = BaseHoneycombTransactionResponse

export interface CreateCreateCharactersTreeTransactionParams
    extends BaseHoneycombTransactionParams {
    projectAddress: string
    characterModel: string
    treeConfig: TreeSetupConfig
}

export interface CreateCreateCharactersTreeTransactionResponse
    extends BaseHoneycombTransactionResponse {
    treeAddress: string
}

export interface CreateCreateCharacterModelTransactionParams
    extends BaseHoneycombTransactionParams {
    projectAddress: string
    payerAddress: string
    mintAs: MintAsInput
    config: CharacterConfigInput
    attributes: Array<[Atomic, Atomic]>
    cooldown: CharacterCooldownInput
}

export interface CreateCreateCharacterModelTransactionResponse
    extends BaseHoneycombTransactionResponse {
    characterModelAddress: string
}

export interface CreateCreateAssemblerConfigTransactionParams
    extends BaseHoneycombTransactionParams {
    projectAddress: string
    treeConfig: TreeSetupConfig
    ticker: string
    order?: Array<string>
}

export interface CreateCreateAssemblerConfigTransactionResponse
    extends BaseHoneycombTransactionResponse {
    assemblerConfigAddress: string
}

export interface CreateNewUserWithProfileTransactionParams extends BaseHoneycombTransactionParams {
    projectAddress: string
    userPublicKey: string
    userInfo: UserInfoInput
}

export interface CreateNewUserWithProfileTransactionResponse
    extends BaseHoneycombTransactionResponse {
    txResponse: EdgeTxResponse
}

export interface CreateNewProfileTransactionParams extends BaseHoneycombTransactionParams {
    projectAddress: string
    identity: string
    info: ProfileInfoInput
}

export type CreateNewProfileTransactionResponse = BaseHoneycombTransactionResponse

export interface CreateCreateProfilesTreeTransactionParams extends BaseHoneycombTransactionParams {
    projectAddress: string
    numAssets: number
}

export interface CreateCreateProfilesTreeTransactionResponse
    extends BaseHoneycombTransactionResponse {
    treeAddress: string
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

export type BaseHoneycombTransactionResponse = {
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

export interface CreateCreateSplStakingPoolTransactionParams
    extends BaseHoneycombTransactionParams {
    projectAddress: string
    tokenAddress: string
    metadata: CreateSplStakingPoolMetadataInput
}

export interface CreateCreateSplStakingPoolTransactionResponse
    extends BaseHoneycombTransactionResponse {
    splStakingPoolAddress: string
}

export interface CreateCreateNewSplStakingPoolTreeTransactionParams
    extends BaseHoneycombTransactionParams {
    projectAddress: string
    tokenAddress: string
    delegateAuthority: string
    payerAddress: string
    tokenStakingPoolName: string
    splStakingPoolAddress: string
    metadata: CreateSplStakingPoolMetadataInput
    numAssets: number
}

export interface CreateCreateNewSplStakingPoolTreeTransactionResponse
    extends BaseHoneycombTransactionResponse {
    treeAddress: string
}
