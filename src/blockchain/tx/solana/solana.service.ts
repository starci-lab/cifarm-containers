import { Injectable } from "@nestjs/common"
import { ChainKey, envConfig, Network } from "@src/env"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { solanaHttpRpcUrl } from "../../rpcs"
import {
    createNoopSigner,
    generateSigner,
    keypairIdentity,
    publicKey,
    sol,
    Umi
} from "@metaplex-foundation/umi"
import {
    createCollection as metaplexCreateSolanaCollection,
    mplCore,
    create,
    fetchCollection,
    ruleSet,
    transferV1,
    fetchAsset,
    AssetV1,
    updatePlugin,
    burn
} from "@metaplex-foundation/mpl-core"
import base58 from "bs58"
import {
    CreateSolanaBurnNFTTransactionParams,
    CreateSolanaBurnNFTTransactionResponse,
    CreateSolanaCollectionParams,
    CreateSolanaCollectionResponse,
    CreateSolanaComputeBudgetTransactionsParams,
    CreateSolanaComputeBudgetTransactionsResponse,
    CreateSolanaFreezeNFTTransactionParams,
    CreateSolanaFreezeNFTTransactionResponse,
    CreateSolanaMintNFTTransactionParams,
    CreateSolanaMintNFTTransactionResponse,
    CreateSolanaTransferSolTransactionParams,
    CreateSolanaTransferSolTransactionResponse,
    CreateSolanaTransferTokenTransactionParams,
    CreateSolanaTransferTokenTransactionResponse,
    CreateSolanaUnfreezeNFTTransactionParams,
    CreateSolanaUnfreezeNFTTransactionResponse,
    CreateSolanaUpgradeNFTTransactionParams,
    CreateSolanaUpgradeNFTTransactionResponse,
    GetNFTParams,
    TransferNftParams,
    TransferNftResponse
} from "./types"
import {
    transferTokens,
    findAssociatedTokenPda,
    mplToolbox,
    transferSol,
    setComputeUnitLimit,
    setComputeUnitPrice,
} from "@metaplex-foundation/mpl-toolbox"
import { computeRaw } from "@src/common"
import { S3Service } from "@src/s3"
import { CipherService } from "@src/crypto"


@Injectable()
export class SolanaService {
    private umis: Record<Network, Umi>
    constructor(private readonly s3Service: S3Service, private readonly cipherService: CipherService) {
        // Constructor logic here
        this.umis = {
            [Network.Mainnet]: this.createUmi(Network.Mainnet),
            [Network.Testnet]: this.createUmi(Network.Testnet)
        }
    }

    private createUmi(network: Network): Umi {
        const umi = createUmi(solanaHttpRpcUrl(ChainKey.Solana, network)).use(mplCore())
        const signer = umi.eddsa.createKeypairFromSecretKey(
            base58.decode(
                this.cipherService.decrypt(
                    envConfig().chainCredentials[ChainKey.Solana].metaplexAuthority[network].privateKey
                )   
            )
        )
        umi.use(keypairIdentity(signer)).use(mplToolbox())
        return umi
    }

    public getUmi(network: Network): Umi {
        return this.umis[network]
    }

    public getVaultUmi(network: Network): Umi {
        const umi = createUmi(solanaHttpRpcUrl(ChainKey.Solana, network)).use(mplCore())
        const signer = umi.eddsa.createKeypairFromSecretKey(
            base58.decode(this.cipherService.decrypt(envConfig().chainCredentials[ChainKey.Solana].vault[network].privateKey)
            )
        )
        umi.use(keypairIdentity(signer)).use(mplToolbox())
        return umi
    }

    public async createCollection({
        network = Network.Mainnet,
        name,
        uri
    }: CreateSolanaCollectionParams): Promise<CreateSolanaCollectionResponse> {
        const umi = this.umis[network]
        // Logic to create a collection on Solana
        const collection = generateSigner(umi)
        //const uri = await this.s3Service.uploadJson(collection.publicKey.toString(), metadata)
        const { signature } = await metaplexCreateSolanaCollection(umi, {
            collection,
            name,
            updateAuthority: umi.identity.publicKey,
            uri,
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
                    ruleSet: ruleSet("None")
                }
            ]
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

    public async createComputeBudgetTransactions({
        network = Network.Mainnet,
        computeUnitLimit = 600_000,
        computeUnitPrice = 1
    }: CreateSolanaComputeBudgetTransactionsParams): Promise<CreateSolanaComputeBudgetTransactionsResponse> {
        const umi = this.umis[network]
        const limitTransaction = setComputeUnitLimit(umi, { units: computeUnitLimit })
        const priceTransaction = setComputeUnitPrice(umi, { microLamports: computeUnitPrice })
        return { limitTransaction, priceTransaction }
    }

    public async createTransferSolTransaction({
        network = Network.Mainnet,
        fromAddress,
        toAddress,
        amount
    }: CreateSolanaTransferSolTransactionParams): Promise<CreateSolanaTransferSolTransactionResponse> {
        const umi = this.umis[network]
        const tx = transferSol(umi, {
            source: createNoopSigner(publicKey(fromAddress)),
            destination: publicKey(toAddress),
            amount: sol(amount)
        })
        return { transaction: tx }
    }


    public async createTransferTokenTransaction({
        network = Network.Mainnet,
        tokenAddress,
        toAddress,
        amount,
        fromAddress,
        decimals = 6
    }: CreateSolanaTransferTokenTransactionParams): Promise<CreateSolanaTransferTokenTransactionResponse> {
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

    public async createBurnNFTTransaction({
        network = Network.Mainnet,
        nftAddress,
        collectionAddress,
        feePayer
    }: CreateSolanaBurnNFTTransactionParams): Promise<CreateSolanaBurnNFTTransactionResponse> {
        const umi = this.umis[network]
        const collection = await fetchCollection(umi, collectionAddress)
        const asset = await fetchAsset(umi, nftAddress)
        const tx = burn(umi, {
            asset,
            collection,
            authority: createNoopSigner(publicKey(feePayer)),
            payer: feePayer ? createNoopSigner(publicKey(feePayer)) : umi.identity,
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
    }: CreateSolanaMintNFTTransactionParams): Promise<CreateSolanaMintNFTTransactionResponse> {
        const umi = this.umis[network]
        const asset = generateSigner(umi)
        const collection = await fetchCollection(umi, collectionAddress)
        const nftName = `${name} #${asset.publicKey.toString().slice(0, 5)}`
        // override the name in the metadata
        metadata.name = nftName
        const uri = await this.s3Service.uploadJson(asset.publicKey.toString(), metadata)
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
    }: CreateSolanaUnfreezeNFTTransactionParams): Promise<CreateSolanaUnfreezeNFTTransactionResponse> {
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
    }: CreateSolanaUpgradeNFTTransactionParams): Promise<CreateSolanaUpgradeNFTTransactionResponse> {
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
    }: CreateSolanaFreezeNFTTransactionParams): Promise<CreateSolanaFreezeNFTTransactionResponse> {
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
