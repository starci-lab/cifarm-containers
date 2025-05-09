import { Injectable, Logger } from "@nestjs/common"
import {
    ValidateGoogleTokenRequest,
    ValidateGoogleTokenResponse
} from "./validate-google-token.dto"
import { FirebaseAdminService } from "@src/firebase-admin"
import {
    InjectMongoose,
    InventoryType,
    InventorySchema,
    InventoryKind,
    OauthProviderName,
    InventoryTypeSchema,
    UserSchema,
    PlacedItemTypeId,
    PlacedItemSchema,
    ToolSchema,
    SessionSchema
} from "@src/databases"
import { Connection } from "mongoose"
import { JwtService } from "@src/jwt"
import { Network } from "@src/env"
import { createObjectId, DeepPartial } from "@src/common"
import { GraphQLError } from "graphql"
import { EnergyService, StaticService } from "@src/gameplay"

@Injectable()
export class ValidateGoogleTokenService {
    private readonly logger = new Logger(ValidateGoogleTokenService.name)

    constructor(
        private readonly firebaseAdminService: FirebaseAdminService,
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly jwtService: JwtService,
        private readonly energyService: EnergyService,
        private readonly staticService: StaticService
    ) {}

    public async validateGoogleToken({
        token,
        network = Network.Testnet
    }: ValidateGoogleTokenRequest): Promise<ValidateGoogleTokenResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const result = await mongoSession.withTransaction(async (session) => {
                const decodedToken = await this.firebaseAdminService.validateToken(token)
                // get user info from google
                const userInfo = await this.firebaseAdminService.getUser(decodedToken.uid)
                // create account if not exists
                let user = await this.connection.model<UserSchema>(UserSchema.name).findOne({
                    email: decodedToken.email,
                    oauthProvider: OauthProviderName.Google
                })
                if (!user) {
                    const energy = this.energyService.getMaxEnergy()

                    const { defaultCropId, defaultSeedQuantity, positions, golds } =
                        this.staticService.defaultInfo

                    const [userRaw] = await this.connection
                        .model<UserSchema>(UserSchema.name)
                        .create(
                            [
                                {
                                    email: decodedToken.email,
                                    oauthProvider: OauthProviderName.Google,
                                    username: userInfo.displayName,
                                    avatarUrl: userInfo.photoURL,
                                    golds,
                                    network,
                                    energy
                                }
                            ],
                            { session }
                        )
                    user = userRaw
                    user.id = userRaw._id

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
                        { session, ordered: true }
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

                    // create banana fruits
                    const bananaFruitPartials: Array<DeepPartial<PlacedItemSchema>> =
                        positions.bananaFruits.map((bananaFruit) => ({
                            placedItemType: createObjectId(PlacedItemTypeId.Banana).toString(),
                            user: user.id,
                            fruitInfo: {},
                            ...bananaFruit
                        }))
                    await this.connection
                        .model<PlacedItemSchema>(PlacedItemSchema.name)
                        .create(bananaFruitPartials, { session: mongoSession, ordered: true })

                    // create bee house
                    await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).create(
                        [
                            {
                                placedItemType: createObjectId(
                                    PlacedItemTypeId.BeeHouse
                                ).toString(),
                                buildingInfo: {
                                    currentUpgrade: 1
                                },
                                user: user.id,
                                beeHouseInfo: {},
                                ...positions.beeHouse
                            }
                        ],
                        { session, ordered: true }
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
                        { session }
                    )

                    // create chickens
                    const chickenPartials: Array<DeepPartial<PlacedItemSchema>> =
                        positions.chickens.map((chicken) => ({
                            placedItemType: createObjectId(PlacedItemTypeId.Chicken).toString(),
                            animalInfo: {},
                            user: user.id,
                            ...chicken
                        }))
                    await this.connection
                        .model<PlacedItemSchema>(PlacedItemSchema.name)
                        .create(chickenPartials, { session, ordered: true })

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
                        .session(session)

                    for (const tool of tools) {
                        const inventoryType = await this.connection
                            .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                            .findOne({
                                type: InventoryType.Tool,
                                tool: tool.id
                            })
                            .session(session)

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
                            .create(toolInventories, { session, ordered: true })
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
                        .session(session)

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
                        { session, ordered: true }
                    )
                }
                // create access token
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
                    { session }
                )

                return {
                    message: "Token validated successfully",
                    success: true,
                    data: {
                        accessToken,
                        refreshToken
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
