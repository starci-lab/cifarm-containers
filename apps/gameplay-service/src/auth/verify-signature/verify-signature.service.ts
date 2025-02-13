import { Injectable, Logger } from "@nestjs/common"
import { GrpcCacheNotFound } from "@src/exceptions"
import { VerifySignatureRequest, VerifySignatureResponse } from "./verify-signature.dto"
import {
    DefaultInfo,
    UserSchema,
    InventoryType,
    InjectMongoose,
    SystemKey,
    SystemSchema,
    SystemRecord,
    InventoryTypeSchema,
    PlacedItemSchema,
    PlacedItemTypeKey,
    InventorySchema,
    SessionSchema,
    MongooseTransaction
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
import { DeepPartial } from "@src/common"
import {
    GrpcInvalidArgumentException,
    GrpcNotFoundException
} from "nestjs-grpc-exceptions"
import { ModuleRef } from "@nestjs/core"
import { ClientSession, Connection } from "mongoose"

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

    @MongooseTransaction()
    public async verifySignature(
        {
            message,
            publicKey,
            signature,
            chainKey,
            network,
            accountAddress
        }: VerifySignatureRequest,
        mongoSession: ClientSession
    ): Promise<VerifySignatureResponse> {
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
                value: { defaultCropKey, defaultSeedQuantity, golds, positions, inventoryCapacity }
            } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findOne<SystemRecord<DefaultInfo>>({
                    key: SystemKey.DefaultInfo
                })

            // inventories params
            const inventoryType = await this.connection
                .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                .findOne({
                    refKey: defaultCropKey,
                    type: InventoryType.Seed
                })
                .session(mongoSession)

            if (!inventoryType) {
                throw new GrpcNotFoundException("Inventory seed type not found")
            }

            const energy = this.energyService.getMaxEnergy()

            await this.connection.model<UserSchema>(UserSchema.name).create(
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

            user = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findOne({
                    accountAddress,
                    chainKey,
                    network
                })
                .session(mongoSession)

            const { count, inventories } = await this.inventoryService.getParams({
                connection: this.connection,
                inventoryType,
                userId: user.id,
                session: mongoSession
            })

            await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).create(
                [
                    {
                        placedItemTypeKey: PlacedItemTypeKey.Home,
                        buildingInfo: {},
                        user: user.id,
                        ...positions.home
                    }
                ],
                { session: mongoSession, ordered: true }
            )

            const tilePartials: Array<DeepPartial<PlacedItemSchema>> = positions.tiles.map(
                (tile) => ({
                    placedItemTypeKey: PlacedItemTypeKey.StarterTile,
                    user: user.id,
                    tileInfo: {},
                    ...tile
                })
            )

            await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .create(tilePartials, { session: mongoSession, ordered: true })

            const { createdInventories, updatedInventories } = this.inventoryService.add({
                inventoryType,
                inventories,
                count,
                capacity: inventoryCapacity,
                quantity: defaultSeedQuantity,
                userId: user.id
            })

            await this.connection
                .model<InventorySchema>(InventorySchema.name)
                .create(createdInventories, { session: mongoSession, ordered: true })
            for (const inventory of updatedInventories) {
                await this.connection.model<InventorySchema>(InventorySchema.name).updateOne(
                    {
                        _id: inventory._id
                    },
                    inventory,
                    { session: mongoSession }
                )
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
            
            return {
                accessToken,
                refreshToken
            }
        }
    }
}
