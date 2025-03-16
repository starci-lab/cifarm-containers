import { Injectable, Logger, BadRequestException, NotFoundException } from "@nestjs/common"
import { VerifySignatureRequest, VerifySignatureResponse } from "./verify-signature.dto"
import {
    DefaultInfo,
    UserSchema,
    InventoryType,
    InjectMongoose,
    SystemId,
    SystemSchema,
    KeyValueRecord,
    InventoryTypeSchema,
    PlacedItemSchema,
    PlacedItemTypeId,
    InventorySchema,
    SessionSchema,
    InventoryKind,
    ToolSchema,
} from "@src/databases"
import {
    IBlockchainAuthService,
    chainKeyToPlatform,
    defaultChainKey,
    getBlockchainAuthServiceToken
} from "@src/blockchain"
import { EnergyService } from "@src/gameplay"
import { InjectCache } from "@src/cache"
import { Network } from "@src/env"
import { JwtService } from "@src/jwt"
import { Cache } from "cache-manager"
import { createObjectId, DeepPartial } from "@src/common"
import { ModuleRef } from "@nestjs/core"
import { Connection } from "mongoose"

@Injectable()
export class VerifySignatureService {
    private readonly logger = new Logger(VerifySignatureService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        @InjectCache() private readonly cacheManager: Cache,
        private readonly moduleRef: ModuleRef,
        private readonly jwtService: JwtService,
        private readonly energyService: EnergyService,
    ) {}

    public async verifySignature({
        message,
        publicKey,
        signature,
        chainKey,
        network,
        accountAddress,
        username
    }: VerifySignatureRequest): Promise<VerifySignatureResponse> {
        const mongoSession = await this.connection.startSession()

        try {
        // Using `withTransaction` for automatic transaction handling
            const result = await mongoSession.withTransaction(async () => {
                const valid = await this.cacheManager.get(message)
                if (!valid) {
                    throw new NotFoundException("Message not found")
                }

                chainKey = chainKey || defaultChainKey
                network = network || Network.Testnet
                const platform = chainKeyToPlatform(chainKey)

                const authService = this.moduleRef.get<IBlockchainAuthService>(
                    getBlockchainAuthServiceToken(platform),
                    { strict: false }
                )

                const verified = authService.verifyMessage({ message, publicKey, signature })
                if (!verified) {
                    throw new BadRequestException("Signature is invalid")
                }

                let user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findOne({ accountAddress, chainKey, network })
                    .session(mongoSession)

                if (!user) {
                    const {
                        value: {
                            defaultCropId,
                            defaultSeedQuantity,
                            golds,
                            positions,
                        }
                    } = await this.connection
                        .model<SystemSchema>(SystemSchema.name)
                        .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))

                    const energy = this.energyService.getMaxEnergy()

                    const [userRaw] = await this.connection.model<UserSchema>(UserSchema.name).create(
                        [
                            {
                                username,
                                accountAddress,
                                chainKey,
                                network,
                                energy,
                                golds,
                            }
                        ],
                        { session: mongoSession, ordered: true }
                    )

                    userRaw.id = userRaw._id.toString()
                    user = userRaw

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

                    const tilePartials: Array<DeepPartial<PlacedItemSchema>> = positions.tiles.map((tile) => ({
                        placedItemType: createObjectId(PlacedItemTypeId.BasicTile),
                        user: user.id,
                        tileInfo: {},
                        ...tile
                    }))

                    await this.connection
                        .model<PlacedItemSchema>(PlacedItemSchema.name)
                        .create(tilePartials, { session: mongoSession, ordered: true })

                    const toolInventories: Array<DeepPartial<InventorySchema>> = []
                    let indexTool = 0

                    const tools = await this.connection.model<ToolSchema>(ToolSchema.name).find({
                        sort: { $exists: true },
                        default: false,
                        givenAsDefault: true
                    }).session(mongoSession)

                    for (const tool of tools) {
                        const inventoryType = await this.connection
                            .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                            .findOne({
                                type: InventoryType.Tool,
                                tool: tool.id
                            }).session(mongoSession)
                        toolInventories.push({
                            inventoryType: inventoryType.id,
                            user: user.id,
                            kind: InventoryKind.Tool,
                            index: indexTool,
                        })
                        indexTool++
                    }

                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .create(toolInventories, { session: mongoSession, ordered: true })

                    const inventoryType = await this.connection
                        .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                        .findOne({
                            type: InventoryType.Seed,
                            crop: createObjectId(defaultCropId)
                        })
                        .session(mongoSession)

                    if (!inventoryType) {
                        throw new NotFoundException("Inventory seed type not found")
                    }
                    
                    await this.connection.model<InventorySchema>(InventorySchema.name).create(
                        [
                            {
                                inventoryType: inventoryType.id,
                                user: user.id,
                                kind: InventoryKind.Storage,
                                quantity: defaultSeedQuantity,
                                index: 0,
                            }
                        ],
                        { session: mongoSession, ordered: true }
                    )
                }

                const { accessToken, refreshToken: { token: refreshToken, expiredAt } } = await this.jwtService.generateAuthCredentials({
                    id: user.id
                })

                await this.connection.model<SessionSchema>(SessionSchema.name).create({
                    refreshToken,
                    expiredAt,
                    user: user.id
                })

                return {
                    accessToken,
                    refreshToken
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
