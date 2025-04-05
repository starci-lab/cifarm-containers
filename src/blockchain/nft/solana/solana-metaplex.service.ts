import { Injectable } from "@nestjs/common"
import { ChainKey, envConfig, Network } from "@src/env"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { solanaHttpRpcUrl } from "../../rpcs"
import { generateSigner, keypairIdentity, publicKey, Umi } from "@metaplex-foundation/umi"
import {
    createCollection as metaplexCreateCollection,
    mplCore,
    create,
    fetchCollection,
    ruleSet,
    transferV1
} from "@metaplex-foundation/mpl-core"
import { WithNetwork } from "../../types"
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

    public async mintNft({
        network = Network.Mainnet,
        name,
        collectionAddress,
        ownerAddress,
        metadata
    }: MintNftParams): Promise<MintNFTResponse> {
        const umi = this.umis[network]
        console.log(ownerAddress)
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
                }
            ]
        }).sendAndConfirm(umi)
        return {
            nftAddress: asset.publicKey,
            signature: base58.encode(signature)
        }
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

export interface TransferNftResponse {
    signature: string
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
