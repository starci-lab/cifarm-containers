import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventorySchema,
    InventoryType,
    KeyValueStoreSchema,
    KeyValueRecord,
    KeyValueStoreId,
    VaultInfos,
    BulkPaids
} from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import {
    SendShipSolanaTransactionRequest,
    SendShipSolanaTransactionResponse
} from "./send-ship-solana-transaction.dto"
import { SolanaService } from "@src/blockchain"
import { StaticService, TCIFARMBalanceService } from "@src/gameplay"
import { InjectCache, CreateShipSolanaTransactionCacheData } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { ShipService, InventoryService } from "@src/gameplay"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import base58 from "bs58"
import { createObjectId, roundNumber } from "@src/common"

@Injectable()
export class SendShipSolanaTransactionService {
    private readonly logger = new Logger(SendShipSolanaTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaService: SolanaService,
        private readonly staticService: StaticService,
        private readonly inventoryService: InventoryService,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service,
        private readonly shipService: ShipService,
        private readonly tCIFARMBalanceService: TCIFARMBalanceService
    ) { }

    async sendShipSolanaTransaction(
        { id }: UserLike,
        { serializedTx }: SendShipSolanaTransactionRequest
    ): Promise<SendShipSolanaTransactionResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                // get the user
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(id)
                    .session(session)
                if (!user) {
                    throw new Error("User not found")
                }
                const tx = this.solanaService
                    .getUmi(user.network)
                    .transactions.deserialize(base58.decode(serializedTx))
                const cacheKey = this.sha256Service.hash(
                    base58.encode(
                        this.solanaService
                            .getUmi(user.network)
                            .transactions.serializeMessage(tx.message)
                    )
                )
                const cachedTx = await this.cacheManager.get<CreateShipSolanaTransactionCacheData>(cacheKey)
                if (!cachedTx) {
                    throw new GraphQLError("Transaction not found in cache", {
                        extensions: {
                            code: "TRANSACTION_NOT_FOUND_IN_CACHE"
                        }
                    })
                }
                const signedTxWithAuthority = await this.solanaService
                    .getUmi(user.network)
                    .identity.signTransaction(tx)
                const signedTxWithVault = await this.solanaService
                    .getVaultUmi(user.network)
                    .identity.signTransaction(signedTxWithAuthority)
                const txHash = await this.solanaService
                    .getUmi(user.network)
                    .rpc.sendTransaction(signedTxWithVault)
                const latestBlockhash = await this.solanaService
                    .getUmi(user.network)
                    .rpc.getLatestBlockhash()
                await this.solanaService
                    .getUmi(user.network)
                    .rpc.confirmTransaction(txHash, {
                        commitment: "finalized",
                        strategy: {
                            type: "blockhash",
                            blockhash: latestBlockhash.blockhash,
                            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
                        }
                    })
                // we must process the transaction first to not have any race condition
                // because the bulk paid is updated in the same transaction
                const { inventoryMap } = await this.shipService.partitionInventories({
                    userId: id,
                    session,
                    bulkId: cachedTx.bulkId
                })
                const inventoryEntries = Object.entries(inventoryMap)
                // we try to delete the inventories
                for (const [productId, { inventories, requiredQuantity }] of inventoryEntries) {
                    const product = this.staticService.products.find(
                        (product) => product.id === productId
                    )
                    if (!product) {
                        throw new GraphQLError("Product not found", {
                            extensions: {
                                code: "PRODUCT_NOT_FOUND"
                            }
                        })
                    }
                    const inventoryType = this.staticService.inventoryTypes.find(
                        (inventoryType) =>
                            inventoryType.type === InventoryType.Product &&
                                inventoryType.product.toString() === product.id
                    )
                    if (!inventoryType) {
                        throw new GraphQLError("Inventory type not found", {
                            extensions: {
                                code: "INVENTORY_TYPE_NOT_FOUND"
                            }
                        })
                    }
                    const { removedInventoryIds, updatedInventories } =
                            this.inventoryService.remove({
                                inventoryType,
                                quantity: requiredQuantity,
                                inventories
                            })
    
                    // delete the inventories
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .deleteMany({ _id: { $in: removedInventoryIds } })
    
                    // update the inventories
                    for (const { inventoryUpdated } of updatedInventories) {
                        await inventoryUpdated.save({ session })
                    }
    
                    // add tCIFARM to the user
                    const bulk = this.staticService.seasons.find(
                        (season) => season.active
                    ).bulks.find(
                        (bulk) => bulk.id === cachedTx.bulkId
                    )
                    if (!bulk) {
                        throw new GraphQLError("Bulk not found", {
                            extensions: {
                                code: "BULK_NOT_FOUND"
                            }
                        })
                    }
                    this.tCIFARMBalanceService.add({
                        amount: bulk.tCIFARM,
                        user
                    })
                    await user.save({ session })
                }
    
                // reduce token in the vault
                const vaultInfos = await this.connection
                    .model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
                    .findById<
                            KeyValueRecord<VaultInfos>
                        >(createObjectId(KeyValueStoreId.VaultInfos))
                    .session(session)
                if (!vaultInfos) {
                    throw new GraphQLError("Vault infos not found", {
                        extensions: {
                            code: "VAULTS_INFO_NOT_FOUND"
                        }   
                    })
                }
                const index = vaultInfos.value[user.network].data.findIndex(
                    (data) => data.tokenKey === this.staticService.nftBoxInfo.tokenKey
                )
                if (index === -1) {
                    throw new GraphQLError("Token key not found in vault infos", {
                        extensions: {
                            code: "TOKEN_KEY_NOT_FOUND_IN_VAULT_INFOS"
                        }
                    })
                }
                const newTokenAmount = roundNumber(vaultInfos.value[user.network].data[index].tokenLocked - cachedTx.paidAmount)
                // call the update vault infos function
                await this.connection
                    .model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
                    .updateOne(
                        { _id: createObjectId(KeyValueStoreId.VaultInfos) },
                        { $set: { [`value.${user.network}.data.${index}.tokenLocked`]: newTokenAmount } }
                    )
                    .session(session)
                
                const bulkPaids = await this.connection.model<KeyValueStoreSchema>(
                    KeyValueStoreSchema.name).findById<KeyValueRecord<BulkPaids>>(
                        createObjectId(KeyValueStoreId.BulkPaids)
                    )
                if (!bulkPaids) {
                    throw new GraphQLError("Bulk paids not found", {
                        extensions: {
                            code: "BULK_PAIDS_NOT_FOUND"
                        }
                    })
                }
                const bulkPaid = bulkPaids.value?.[cachedTx.bulkId]?.[user.network] ?? {
                    count: 0,
                    decrementPercentage: 0
                }
                const bulk = this.staticService.seasons.find(
                    (season) => season.active
                ).bulks.find(
                    (bulk) => bulk.id === cachedTx.bulkId
                )
                if (!bulk) {
                    throw new GraphQLError("Bulk not found", {
                        extensions: {
                            code: "BULK_NOT_FOUND"
                        }
                    })
                }
                // update the bulk paid
                console.log(bulkPaid)
                bulkPaid.count += 1
                bulkPaid.decrementPercentage = roundNumber(1 - (1 - bulkPaid.decrementPercentage) * (1 - bulk.decrementPercentage))
                // update the bulk paids
                await this.connection.model<KeyValueStoreSchema>(
                    KeyValueStoreSchema.name
                ).updateOne(
                    { _id: createObjectId(KeyValueStoreId.BulkPaids) },
                    { $set: { [`value.${cachedTx.bulkId}.${user.network}`]: bulkPaid } }
                )
                return {
                    success: true,
                    message: "Ship Solana transaction sent successfully",
                    data: {
                        txHash: base58.encode(txHash),
                    }
                }
            })
            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
