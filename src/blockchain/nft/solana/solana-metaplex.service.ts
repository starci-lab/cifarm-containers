import { Injectable } from "@nestjs/common"
import { ChainKey, envConfig, Network } from "@src/env"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { solanaHttpRpcUrl } from "../../rpcs"
import {
    createNoopSigner,
    generateSigner,
    keypairIdentity,
    publicKey,
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
import base58 from "bs58"
import {
    CreateCollectionParams,
    CreateCollectionResponse,
    CreateFreezeNFTTransactionParams,
    CreateFreezeNFTTransactionResponse,
    CreateMintNFTTransactionParams,
    CreateMintNFTTransactionResponse,
    CreateTransferTokenTransactionParams,
    CreateTransferTokenTransactionResponse,
    CreateUnfreezeNFTTransactionParams,
    CreateUnfreezeNFTTransactionResponse,
    CreateUpgradeNFTTransactionParams,
    CreateUpgradeNFTTransactionResponse,
    GetNFTParams,
    TransferNftParams,
    TransferNftResponse
} from "./types"
import {
    transferTokens,
    findAssociatedTokenPda,
    mplToolbox,
} from "@metaplex-foundation/mpl-toolbox"
import { computeRaw } from "@src/common"
import { S3Service } from "@src/s3"

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
    constructor(private readonly s3Service: S3Service) {
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
        const collection = generateSigner(umi)
        const uri = await this.s3Service.uploadJson(collection.publicKey.toString(), metadata)
        //const uri = await this.s3Service.uploadJson(collection.publicKey.toString(), metadata)
        const { signature } = await metaplexCreateCollection(umi, {
            collection,
            name,
            updateAuthority: umi.identity.publicKey,
            uri
        }).sendAndConfirm(umi)
        return {
            collectionAddress: collection.publicKey,
            signature: base58.encode(signature)
        }
    }

    public async getNFT({
        network = Network.Mainnet,
        nftAddress
    }: GetNFTParams): Promise<AssetV1 | null> {
        try {
            return await fetchAsset(this.umis[network], nftAddress)
        } catch {
            return null
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
        metadata
    }: CreateMintNFTTransactionParams): Promise<CreateMintNFTTransactionResponse> {
        const umi = this.umis[network]
        const asset = generateSigner(umi)
        const uri = await this.s3Service.uploadJson(asset.publicKey.toString(), metadata)
        const collection = await fetchCollection(umi, collectionAddress)
        const nftName = `${name} #${asset.publicKey.toString().slice(0, 5)}`
        const tx = create(umi, {
            asset,
            authority: createNoopSigner(umi.identity.publicKey),
            collection,
            owner: ownerAddress ? publicKey(ownerAddress) : umi.identity.publicKey,
            name: nftName,
            payer: feePayer ? createNoopSigner(publicKey(feePayer)) : createNoopSigner(umi.identity.publicKey),
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
                        type: "UpdateAuthority",
                        address: umi.identity.publicKey
                    }
                }
            ]
        })
        return { transaction: tx, nftAddress: asset.publicKey, nftName }
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

    public async createUpgradeNFTTransaction({
        network = Network.Testnet,
        nftAddress,
        collectionAddress,
        feePayer,
        attributes
    }: CreateUpgradeNFTTransactionParams): Promise<CreateUpgradeNFTTransactionResponse> {
        const umi = this.umis[network]
        const transaction = updatePlugin(umi, {
            asset: publicKey(nftAddress),
            collection: publicKey(collectionAddress),
            authority: createNoopSigner(publicKey(umi.identity.publicKey)),
            plugin: {
                type: "Attributes",
                attributeList: attributes
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
            asset: publicKey(nftAddress),
            collection: publicKey(collectionAddress),
            authority: createNoopSigner(publicKey(umi.identity.publicKey)),
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
