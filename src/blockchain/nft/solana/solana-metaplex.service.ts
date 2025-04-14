import { Injectable } from "@nestjs/common"
import { ChainKey, envConfig, Network } from "@src/env"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { solanaHttpRpcUrl } from "../../rpcs"
import { createNoopSigner, generateSigner, keypairIdentity, publicKey, Umi } from "@metaplex-foundation/umi"
import {
    createCollection as metaplexCreateCollection,
    mplCore,
    create,
    fetchCollection,
    ruleSet,
    transferV1,
    fetchAsset,
    AssetV1,
    updatePlugin,
} from "@metaplex-foundation/mpl-core"
import { WithFeePayer, WithNetwork } from "../../types"
import base58 from "bs58"
import { PinataService } from "@src/pinata"

const getUmi = (network: Network) => {
    const umi = createUmi(solanaHttpRpcUrl(ChainKey.Solana, network)).use(mplCore())
    const signer = umi.eddsa.createKeypairFromSecretKey(
        base58.decode(
            envConfig().chainCredentials[ChainKey.Solana].metaplexAuthority[Network.Testnet]
                .privateKey
        )
    )
    umi.use(keypairIdentity(signer))
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
    public async createCollection({
        network = Network.Mainnet,
        name,
        metadata,
    }: CreateCollectionParams): Promise<CreateCollectionResponse> {
        const umi = this.umis[network]
        // Logic to create a collection on Solana
        const metadataUri = await this.pinataService.pinata.upload.public.json(metadata)
        const collection = generateSigner(umi)
        const { signature } = await metaplexCreateCollection(umi, {
            collection,
            name,
            uri: this.pinataService.getUrl(metadataUri.cid),
        }).sendAndConfirm(umi)
        return {
            collectionAddress: collection.publicKey,
            signature: base58.encode(signature)
        }
    }

    public async getNft({
        network = Network.Mainnet,
        nftAddress,
    }: GetNftParams): Promise<AssetV1> {
        return await fetchAsset(this.umis[network], nftAddress)
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
                            key: AttributeName.Type,
                            value: "fruit"
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

    public async createUnfreezeNFTTransaction({
        network = Network.Mainnet,
        nftAddress,
        collectionAddress,
        feePayer
    }: CreateUnfreezeNFTTransactionParams): Promise<CreateUnfreezeNFTTransactionResponse> {
        const umi = this.umis[network]
        const tx = await updatePlugin(umi, {
            asset: publicKey(nftAddress),
            collection: publicKey(collectionAddress),
            plugin: {
                type: "PermanentFreezeDelegate",
                frozen: false,
            },
            payer: feePayer ? createNoopSigner(publicKey(feePayer)) : umi.identity
        }).useV0()
            .setBlockhash(await umi.rpc.getLatestBlockhash())
            .buildAndSign(umi)

        return { serializedTx: base58.encode(umi.transactions.serialize(tx)) }
    }

    public async createFreezeNFTTransaction({
        network = Network.Mainnet,
        nftAddress,
        collectionAddress,
        feePayer
    }: CreateFreezeNFTTransactionParams): Promise<CreateFreezeNFTTransactionResponse> {
        const umi = this.umis[network]
        const tx = await updatePlugin(umi, {
            asset: publicKey(nftAddress),
            collection: publicKey(collectionAddress),
            plugin: {
                type: "PermanentFreezeDelegate",
                frozen: true,
            },
            payer: feePayer ? createNoopSigner(publicKey(feePayer)) : umi.identity
        }).useV0()
            .setBlockhash(await umi.rpc.getLatestBlockhash())
            .buildAndSign(umi)

        return { serializedTx: base58.encode(umi.transactions.serialize(tx)) }
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

export interface CreateFreezeNFTTransactionResponse {
    serializedTx: string
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

export interface CreateUnfreezeNFTTransactionResponse {
    serializedTx: string
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

export interface GetNftParams extends WithNetwork {
    nftAddress: string
}

export interface TransferNftResponse {
    signature: string
}

export enum AttributeName {
    Stars = "stars",
    Rarity = "rarity",
    Type = "type",
    GrowthAcceleration = "growthAcceleration",
    QualityYield = "qualityYield",
    DiseaseResistance = "diseaseResistance",
    HarvestYieldBonus = "harvestYieldBonus"
}

export enum AttributeTypeValue {
    Fruit = "fruit",
}
