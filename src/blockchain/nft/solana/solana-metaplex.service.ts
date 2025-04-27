import { Injectable } from "@nestjs/common"
import { ChainKey, envConfig, Network } from "@src/env"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { solanaHttpRpcUrl } from "../../rpcs"
import {
    createNoopSigner,
    generateSigner,
    keypairIdentity,
    publicKey,
    TransactionBuilder,
    Umi
} from "@metaplex-foundation/umi"
import {
    createCollection as metaplexCreateCollection,
    mplCore,
    create,
    fetchCollection,
    ruleSet,
    transferV1,
    fetchAsset,
    AssetV1,
    updatePlugin
} from "@metaplex-foundation/mpl-core"
import { WithFeePayer, WithNetwork } from "../../types"
import base58 from "bs58"
import { PinataService } from "@src/pinata"
import {
    CreateFreezeNFTTransactionResponse,
    CreateMintNFTTransactionParams,
    CreateMintNFTTransactionResponse,
    CreateTransferTokenTransactionParams,
    CreateTransferTokenTransactionResponse,
    CreateUnfreezeNFTTransactionResponse
} from "./types"
import {
    transferTokens,
    findAssociatedTokenPda,
    mplToolbox,
} from "@metaplex-foundation/mpl-toolbox"
import { computeRaw } from "@src/common"

const getUmi = (network: Network) => {
    const umi = createUmi(solanaHttpRpcUrl(ChainKey.Solana, network)).use(mplCore())
    const signer = umi.eddsa.createKeypairFromSecretKey(
        base58.decode(
            envConfig().chainCredentials[ChainKey.Solana].metaplexAuthority[network]
                .privateKey
        )
    )
    umi.use(keypairIdentity(signer)).use(mplToolbox())
    return umi
}

@Injectable()
export class SolanaMetaplexService {
    private umis: Record<Network, Umi>
    constructor(private pinataService: PinataService) {
        // Constructor logic here
        this.umis = {
            [Network.Mainnet]: getUmi(Network.Mainnet),
            [Network.Testnet]: getUmi(Network.Testnet)
        }
    }

    public getUmi(network: Network): Umi {
        return this.umis[network]
    }

    public getVaultUmi(network: Network): Umi {
        const umi = createUmi(solanaHttpRpcUrl(ChainKey.Solana, network)).use(mplCore())
        const signer = umi.eddsa.createKeypairFromSecretKey(
            base58.decode(envConfig().chainCredentials[ChainKey.Solana].vault[network].privateKey)
        )
        umi.use(keypairIdentity(signer)).use(mplToolbox())
        return umi
    }

    public async createCollection({
        network = Network.Mainnet,
        name,
        metadata
    }: CreateCollectionParams): Promise<CreateCollectionResponse> {
        const umi = this.umis[network]
        // Logic to create a collection on Solana
        const metadataUri = await this.pinataService.pinata.upload.public.json(metadata)
        const collection = generateSigner(umi)
        const { signature } = await metaplexCreateCollection(umi, {
            collection,
            name,
            uri: this.pinataService.getUrl(metadataUri.cid)
        }).sendAndConfirm(umi)
        return {
            collectionAddress: collection.publicKey,
            signature: base58.encode(signature)
        }
    }

    public async getNFT({
        network = Network.Mainnet,
        nftAddress
    }: getNFTParams): Promise<AssetV1 | null> {
        try {
            return await fetchAsset(this.umis[network], nftAddress)
        } catch {
            return null
        }
    }

    public async mintNft({
        network = Network.Mainnet,
        name,
        collectionAddress,
        ownerAddress,
        metadata
    }: MintNftParams): Promise<MintNFTResponse> {
        const umi = this.umis[network]
        // Logic to create a collection on Solana
        const metadataUri = await this.pinataService.pinata.upload.public.json(metadata)
        const asset = generateSigner(umi)
        const collection = await fetchCollection(umi, collectionAddress)
        const { signature } = await create(umi, {
            asset,
            collection,
            owner: ownerAddress ? publicKey(ownerAddress) : umi.identity.publicKey,
            name,
            uri: this.pinataService.getUrl(metadataUri.cid),
            plugins: [
                {
                    type: "Royalties",
                    basisPoints: 500,
                    creators: [
                        {
                            address: umi.identity.publicKey,
                            percentage: 100
                        }
                    ],
                    ruleSet: ruleSet("None") // Compatibility rule set
                },
                {
                    type: "PermanentFreezeDelegate",
                    frozen: false,
                    authority: {
                        type: "Owner",
                        address: umi.identity.publicKey
                    }
                },
                {
                    type: "Attributes",
                    attributeList: [
                        {
                            key: AttributeName.Stars,
                            value: "1"
                        },
                        {
                            key: AttributeName.Rarity,
                            value: "common"
                        },
                        {
                            key: AttributeName.Data,
                            value: JSON.stringify({
                                currentStage: 1
                            })
                        },
                        // growth acceleration when the nft is planted
                        {
                            key: AttributeName.GrowthAcceleration,
                            value: "100" // 10% growth speedup
                        },
                        // quality yield chance when the nft is harvested
                        {
                            key: AttributeName.QualityYield,
                            value: "100" // 10% quality yield chance
                        },
                        // disease resistance when the nft is planted
                        {
                            key: AttributeName.DiseaseResistance,
                            value: "100" // 10% disease resistance
                        },
                        // harvest yield bonus when the nft is harvested
                        {
                            key: AttributeName.HarvestYieldBonus,
                            value: "100" // 10% yield bonus
                        }
                    ]
                }
            ]
        }).sendAndConfirm(umi)
        return {
            nftAddress: asset.publicKey,
            signature: base58.encode(signature)
        }
    }

    public async createTransferTokenTransaction({
        network = Network.Mainnet,
        tokenAddress,
        toAddress,
        amount,
        fromAddress,
        decimals = 6
    }: CreateTransferTokenTransactionParams): Promise<CreateTransferTokenTransactionResponse> {
        const umi = this.umis[network]
        const splToken = publicKey(tokenAddress)
        // Find the associated token account for the SPL Token on the senders wallet.
        const sourceTokenAccount = findAssociatedTokenPda(umi, {
            mint: splToken,
            owner: publicKey(fromAddress)
        })
        // Find the associated token account for the SPL Token on the receivers wallet.
        const destinationTokenAccount = findAssociatedTokenPda(umi, {
            mint: splToken,
            owner: publicKey(toAddress)
        })
        const tx = transferTokens(umi, {
            source: sourceTokenAccount,
            destination: destinationTokenAccount,
            authority: createNoopSigner(publicKey(fromAddress)),
            amount: computeRaw(amount, decimals)
        })
        return { transaction: tx }
    }

    public async createMintNFTTransaction({
        network = Network.Mainnet,
        ownerAddress,
        feePayer,
        attributes,
        collectionAddress,
        name,
        uri
    }: CreateMintNFTTransactionParams): Promise<CreateMintNFTTransactionResponse> {
        const umi = this.umis[network]
        const asset = generateSigner(umi)
        const collection = await fetchCollection(umi, collectionAddress)
        const tx = create(umi, {
            asset,
            authority: createNoopSigner(umi.identity.publicKey),
            collection,
            owner: ownerAddress ? publicKey(ownerAddress) : umi.identity.publicKey,
            name,
            payer: feePayer ? createNoopSigner(publicKey(feePayer)) : createNoopSigner(umi.identity.publicKey),
            // no uri required since solana store attributes on-chain
            uri,
            plugins: [
                {
                    type: "Attributes",
                    attributeList: attributes
                },
                {
                    type: "Royalties",
                    basisPoints: 500,
                    creators: [
                        {
                            address: umi.identity.publicKey,
                            percentage: 100
                        }
                    ],
                    ruleSet: ruleSet("None") // Compatibility rule set
                },
                {
                    type: "PermanentFreezeDelegate",
                    frozen: false,
                    authority: {
                        type: "Owner",
                        address: umi.identity.publicKey
                    }
                }
            ]
        })
        return { transaction: tx, nftAddress: asset.publicKey }
    }

    public async createUnfreezeNFTTransaction({
        network = Network.Testnet,
        nftAddress,
        collectionAddress,
        feePayer
    }: CreateUnfreezeNFTTransactionParams): Promise<CreateUnfreezeNFTTransactionResponse> {
        const umi = this.umis[network]
        const transaction = updatePlugin(umi, {
            asset: publicKey(nftAddress),
            authority: createNoopSigner(publicKey(umi.identity.publicKey)),
            collection: publicKey(collectionAddress),
            plugin: {
                type: "PermanentFreezeDelegate",
                frozen: false
            },
            payer: feePayer ? createNoopSigner(publicKey(feePayer)) : umi.identity
        })
        return { transaction }
    }

    public async createFreezeNFTTransaction({
        network = Network.Testnet,
        nftAddress,
        collectionAddress,
        feePayer
    }: CreateFreezeNFTTransactionParams): Promise<CreateFreezeNFTTransactionResponse> {
        const umi = this.umis[network]
        const transaction = updatePlugin(umi, {
            authority: createNoopSigner(publicKey(umi.identity.publicKey)),
            asset: publicKey(nftAddress),
            collection: publicKey(collectionAddress),
            plugin: {
                type: "PermanentFreezeDelegate",
                frozen: true
            },
            payer: feePayer ? createNoopSigner(publicKey(feePayer)) : createNoopSigner(umi.identity.publicKey)
        })
        return { transaction }
    }

    public async transferNft({
        network = Network.Mainnet,
        nftAddress,
        toAddress,
        collectionAddress
    }: TransferNftParams): Promise<TransferNftResponse> {
        const umi = this.umis[network]
        const { signature } = await transferV1(umi, {
            newOwner: publicKey(toAddress),
            asset: publicKey(nftAddress),
            collection: publicKey(collectionAddress)
        }).sendAndConfirm(umi)
        return { signature: base58.encode(signature) }
    }
}

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
    description: string
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
    description: string
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

export interface getNFTParams extends WithNetwork {
    nftAddress: string
}

export interface TransferNftResponse {
    signature: string
}

export enum AttributeName {
    Stars = "stars",
    Rarity = "rarity",
    Data = "data",
    GrowthAcceleration = "growthAcceleration",
    QualityYield = "qualityYield",
    DiseaseResistance = "diseaseResistance",
    HarvestYieldBonus = "harvestYieldBonus"
}

export enum AttributeTypeValue {
    Fruit = "fruit"
}
