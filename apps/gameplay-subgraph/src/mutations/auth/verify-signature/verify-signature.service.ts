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
import { WsException } from "@nestjs/websockets"

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
                    throw new WsException("Message not found")
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
                    throw new WsException("Signature is invalid")
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
                    // create home
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

                    // create tiles
                    const tilePartials: Array<DeepPartial<PlacedItemSchema>> = positions.tiles.map(
                        (tile) => ({
                            placedItemType: createObjectId(PlacedItemTypeId.BasicTile).toString(),
                            user: user.id,
                            tileInfo: {},
                            ...tile
                        })
                    )

                    await this.connection
                        .model<PlacedItemSchema>(PlacedItemSchema.name)
                        .create(tilePartials, { session: mongoSession, ordered: true })

                    // create banana fruit
                    await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).create(
                        [
                            {
                                placedItemType: createObjectId(PlacedItemTypeId.Banana).toString(),
                                fruitInfo: {},
                                user: user.id,
                                ...positions.bananaFruit
                            }
                        ],
                        { session: mongoSession }
                    )

                    // create bee house
                    await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).create(
                        [
                            {
                                placedItemType: createObjectId(PlacedItemTypeId.BeeHouse).toString(),
                                buildingInfo: {
                                    currentUpgrade: 1
                                },
                                user: user.id,
                                beeHouseInfo: {},
                                ...positions.beeHouse
                            }
                        ],
                        { session: mongoSession }
                    )

                    // create coop
                    await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).create(
                        [
                            {
                                placedItemType: createObjectId(PlacedItemTypeId.Coop).toString(),
                                buildingInfo: {
                                    currentUpgrade: 1
                                },
                                user: user.id,
                                ...positions.coop
                            }
                        ],
                        { session: mongoSession }
                    )

                    // create chicken
                    await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).create(
                        [
                            {
                                placedItemType: createObjectId(PlacedItemTypeId.Chicken).toString(),
                                animalInfo: {},
                                user: user.id,
                                ...positions.chicken
                            }
                        ],
                        { session: mongoSession }
                    )

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
                            throw new WsException("Inventory tool type not found")
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
                        throw new WsException("Inventory seed type not found")
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
