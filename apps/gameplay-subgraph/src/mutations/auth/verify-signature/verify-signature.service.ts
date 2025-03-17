import { Injectable, Logger } from "@nestjs/common"
import { VerifySignatureRequest, VerifySignatureResponse } from "./verify-signature.dto"
import {
    UserSchema,
    InventoryType,
    InjectMongoose,
    InventoryTypeSchema,
    PlacedItemSchema,
    PlacedItemTypeId,
    InventorySchema,
    SessionSchema,
    InventoryKind,
    ToolSchema
} from "@src/databases"
import {
    IBlockchainAuthService,
    chainKeyToPlatform,
    defaultChainKey,
    getBlockchainAuthServiceToken
} from "@src/blockchain"
import { EnergyService, StaticService } from "@src/gameplay"
import { InjectCache } from "@src/cache"
import { Network } from "@src/env"
import { JwtService } from "@src/jwt"
import { Cache } from "cache-manager"
import { createObjectId, DeepPartial } from "@src/common"
import { ModuleRef } from "@nestjs/core"
import { Connection } from "mongoose"
import { GraphQLError } from "graphql"

@Injectable()
export class VerifySignatureService {
    private readonly logger = new Logger(VerifySignatureService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        @InjectCache() private readonly cacheManager: Cache,
        private readonly moduleRef: ModuleRef,
        private readonly jwtService: JwtService,
        private readonly energyService: EnergyService,
        private readonly staticService: StaticService
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
            const result = await mongoSession.withTransaction(async (mongoSession) => {
                /************************************************************
                 * VALIDATE MESSAGE AND SIGNATURE
                 ************************************************************/
                const valid = await this.cacheManager.get(message)
                if (!valid) {
                    throw new GraphQLError("Message not found", {
                        extensions: {
                            code: "MESSAGE_NOT_FOUND"
                        }
                    })
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
                    throw new GraphQLError("Signature is invalid", {
                        extensions: {
                            code: "INVALID_SIGNATURE"
                        }
                    })
                }

                /************************************************************
                 * FIND OR CREATE USER
                 ************************************************************/
                let user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findOne({ accountAddress, chainKey, network })
                    .session(mongoSession)

                if (!user) {
                    /************************************************************
                     * CREATE NEW USER AND INITIAL ITEMS
                     ************************************************************/
                    const { defaultCropId, defaultSeedQuantity, golds, positions } =
                        this.staticService.defaultInfo

                    const energy = this.energyService.getMaxEnergy()

                    const [userRaw] = await this.connection
                        .model<UserSchema>(UserSchema.name)
                        .create(
                            [
                                {
                                    username,
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

                    /************************************************************
                     * CREATE HOME AND TILES
                     ************************************************************/
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
                            placedItemType: createObjectId(PlacedItemTypeId.BasicTile),
                            user: user.id,
                            tileInfo: {},
                            ...tile
                        })
                    )

                    await this.connection
                        .model<PlacedItemSchema>(PlacedItemSchema.name)
                        .create(tilePartials, { session: mongoSession, ordered: true })

                    /************************************************************
                     * CREATE DEFAULT TOOLS
                     ************************************************************/
                    const toolInventories: Array<DeepPartial<InventorySchema>> = []
                    let indexTool = 0

                    const tools = await this.connection
                        .model<ToolSchema>(ToolSchema.name)
                        .find({
                            sort: { $exists: true },
                            default: false,
                            givenAsDefault: true
                        })
                        .session(mongoSession)

                    for (const tool of tools) {
                        const inventoryType = await this.connection
                            .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                            .findOne({
                                type: InventoryType.Tool,
                                tool: tool.id
                            })
                            .session(mongoSession)

                        if (!inventoryType) {
                            throw new GraphQLError("Inventory tool type not found", {
                                extensions: {
                                    code: "INVENTORY_TOOL_TYPE_NOT_FOUND"
                                }
                            })
                        }

                        toolInventories.push({
                            inventoryType: inventoryType.id,
                            user: user.id,
                            kind: InventoryKind.Tool,
                            index: indexTool
                        })
                        indexTool++
                    }

                    if (toolInventories.length > 0) {
                        await this.connection
                            .model<InventorySchema>(InventorySchema.name)
                            .create(toolInventories, { session: mongoSession, ordered: true })
                    }

                    /************************************************************
                     * CREATE DEFAULT SEEDS
                     ************************************************************/
                    const inventoryType = await this.connection
                        .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                        .findOne({
                            type: InventoryType.Seed,
                            crop: createObjectId(defaultCropId)
                        })
                        .session(mongoSession)

                    if (!inventoryType) {
                        throw new GraphQLError("Inventory seed type not found", {
                            extensions: {
                                code: "INVENTORY_SEED_TYPE_NOT_FOUND"
                            }
                        })
                    }

                    await this.connection.model<InventorySchema>(InventorySchema.name).create(
                        [
                            {
                                inventoryType: inventoryType.id,
                                user: user.id,
                                kind: InventoryKind.Storage,
                                quantity: defaultSeedQuantity,
                                index: 0
                            }
                        ],
                        { session: mongoSession, ordered: true }
                    )
                }

                /************************************************************
                 * GENERATE AUTH TOKENS
                 ************************************************************/
                const {
                    accessToken,
                    refreshToken: { token: refreshToken, expiredAt }
                } = await this.jwtService.generateAuthCredentials({
                    id: user.id
                })

                await this.connection.model<SessionSchema>(SessionSchema.name).create(
                    [
                        {
                            refreshToken,
                            expiredAt,
                            user: user.id
                        }
                    ],
                    { session: mongoSession }
                )

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
