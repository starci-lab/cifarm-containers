import { Injectable, Logger } from "@nestjs/common"
import { GrpcCacheNotFound } from "@src/exceptions"
import { VerifySignatureRequest, VerifySignatureResponse } from "./verify-signature.dto"
import {
    DefaultInfo,
    UserSchema,
    InventoryType,
    InjectMongoose,
    SystemId,
    SystemSchema,
    SystemRecord,
    InventoryTypeSchema,
    PlacedItemSchema,
    PlacedItemTypeId,
    InventorySchema,
    SessionSchema,
    ToolId,
} from "@src/databases"
import {
    IBlockchainAuthService,
    chainKeyToPlatform,
    defaultChainKey,
    getBlockchainAuthServiceToken
} from "@src/blockchain"

import { EnergyService, InventoryService } from "@src/gameplay"
import { InjectCache } from "@src/cache"
import { Network } from "@src/env"
import { JwtService } from "@src/jwt"
import { Cache } from "cache-manager"
import { createObjectId, DeepPartial } from "@src/common"
import { GrpcInvalidArgumentException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { ModuleRef } from "@nestjs/core"
import { Connection } from "mongoose"

@Injectable()
export class VerifySignatureService {
    private readonly logger = new Logger(VerifySignatureService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly moduleRef: ModuleRef,
        private readonly jwtService: JwtService,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService
    ) {}

    public async verifySignature({
        message,
        publicKey,
        signature,
        chainKey,
        network,
        accountAddress
    }: VerifySignatureRequest): Promise<VerifySignatureResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            const valid = await this.cacheManager.get(message)
            if (!valid) {
                throw new GrpcCacheNotFound(message)
            }

            chainKey = chainKey || defaultChainKey
            network = network || Network.Testnet
            const platform = chainKeyToPlatform(chainKey)

            const authService = this.moduleRef.get<IBlockchainAuthService>(
                getBlockchainAuthServiceToken(platform),
                { strict: false }
            )

            const verified = authService.verifyMessage({
                message,
                publicKey,
                signature
            })

            if (!verified) throw new GrpcInvalidArgumentException("Signature is invalid")
            let user = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findOne({
                    accountAddress,
                    chainKey,
                    network
                })
                .session(mongoSession)

            if (!user) {
                // get default info
                const {
                    value: {
                        defaultCropId,
                        defaultSeedQuantity,
                        golds,
                        positions,
                        inventoryCapacity
                    }
                } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<SystemRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))

                // inventories params
                const inventoryType = await this.connection
                    .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findOne({
                        type: InventoryType.Seed,
                        crop: createObjectId(defaultCropId)
                    })
                    .session(mongoSession)

                if (!inventoryType) {
                    throw new GrpcNotFoundException("Inventory seed type not found")
                }

                const energy = this.energyService.getMaxEnergy()

                const [userRaw] = await this.connection.model<UserSchema>(UserSchema.name).create(
                    [
                        {
                            username: `${chainKey}-${accountAddress.substring(0, 5)}`,
                            accountAddress,
                            chainKey,
                            network,
                            energy,
                            golds
                        }
                    ],
                    { session: mongoSession, ordered: true }
                )

                userRaw.id = userRaw._id.toString()
                user = userRaw

                const { occupiedIndexes, inventories } = await this.inventoryService.getParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session: mongoSession
                })

                await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).create(
                    [
                        {
                            placedItemType: createObjectId(PlacedItemTypeId.Home),
                            buildingInfo: {},
                            user: user.id,
                            ...positions.home
                        }
                    ],
                    { session: mongoSession, ordered: true }
                )

                const tilePartials: Array<DeepPartial<PlacedItemSchema>> = positions.tiles.map(
                    (tile) => ({
                        placedItemType: createObjectId(PlacedItemTypeId.StarterTile),
                        user: user.id,
                        tileInfo: {},
                        ...tile
                    })
                )

                await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .create(tilePartials, { session: mongoSession, ordered: true })

                // add tools to inventories
                const toolInventories: Array<DeepPartial<InventorySchema>> = []

                let index = 0
                for (const toolId of Object.values(ToolId)) {
                    const inventoryType = await this.connection
                        .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                        .findOne({
                            type: InventoryType.Tool,
                            tool: createObjectId(toolId)
                        }).session(mongoSession)
                    toolInventories.push({
                        inventoryType: inventoryType.id,
                        user: user.id,
                        inToolbar: true,
                        index,
                    })
                    index++
                }

                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .create(toolInventories, { session: mongoSession, ordered: true })

                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    occupiedIndexes,
                    capacity: inventoryCapacity,
                    quantity: defaultSeedQuantity,
                    userId: user.id,
                    inToolbar: false
                })

                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .create(createdInventories, { session: mongoSession, ordered: true })
                for (const inventory of updatedInventories) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .updateOne({ _id: inventory._id }, inventory, { session: mongoSession })
                }
            }

            const {
                accessToken,
                refreshToken: { token: refreshToken, expiredAt }
            } = await this.jwtService.generateAuthCredentials({
                id: user.id
            })

            await this.connection.model<SessionSchema>(SessionSchema.name).create({
                refreshToken,
                expiredAt,
                user: user.id
            })

            await mongoSession.commitTransaction()

            return {
                accessToken,
                refreshToken
            }
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
