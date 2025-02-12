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
import { DeepPartial } from "typeorm"
import {
    GrpcInternalException,
    GrpcInvalidArgumentException,
    GrpcNotFoundException
} from "nestjs-grpc-exceptions"
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
    ) {}

    public async verifySignature({
        message,
        publicKey,
        signature,
        chainKey,
        network,
        accountAddress,
    }: VerifySignatureRequest): Promise<VerifySignatureResponse> {
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
            const user = await this.connection.model<UserSchema>(UserSchema.name).findOne({
                accountAddress,
                chainKey,
                network
            })

            if (!user) {
                // get default info
                const { value: { defaultCropKey, defaultSeedQuantity, golds, positions } } = await this.connection.model<SystemSchema>(SystemSchema.name).findOne<SystemRecord<DefaultInfo>>({
                    key: SystemKey.DefaultInfo
                })

                const mongoSession = await this.connection.startSession()  
                const energy = this.energyService.getMaxEnergy()

                const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name).findOne({
                    refKey: defaultCropKey,
                    type: InventoryType.Seed
                })
                if (!inventoryType) {
                    throw new GrpcNotFoundException("Inventory seed type not found")
                }        

                //home & tiles
                const home: DeepPartial<PlacedItemSchema> = {
                    placedItemTypeKey: PlacedItemTypeKey.Home,
                    buildingInfo: {},
                    ...positions.home
                }
                const tiles: Array<DeepPartial<PlacedItemEntity>> = positions.tiles.map(
                    (tile) => ({
                        placedItemTypeId: PlacedItemTypeId.DefaultInfoTile,
                        tileInfo: {},
                        ...tile
                    })
                )
                try {
                    await queryRunner.startTransaction()

                    user = await queryRunner.manager.save(UserSchema, {
                        username: `${chainKey}-${accountAddress.substring(0, 5)}`,
                        accountAddress,
                        chainKey,
                        network,
                        energy,
                        golds,
                        placedItems: [home, ...tiles],
                        inventories: [{
                            inventoryTypeId: inventoryType.id,
                            quantity: defaultSeedQuantity,
                        }]
                    })

                    await queryRunner.commitTransaction()
                } catch (error) {
                    const errorMessage = `Transaction failed, reason: ${error.message}`
                    this.logger.error(errorMessage)
                    await queryRunner.rollbackTransaction()
                    throw new GrpcInternalException(errorMessage)
                }
            }

            const {
                accessToken,
                refreshToken: { token: refreshToken, expiredAt }
            } = await this.jwtService.generateAuthCredentials({
                id: user.id
            })

            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.save(SessionEntity, {
                    expiredAt,
                    refreshToken,
                    userId: user.id,
                    device,
                    os,
                    browser,
                    ipV4
                })
                await queryRunner.commitTransaction()
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }

            return {
                accessToken,
                refreshToken
            }
        } finally {
            await queryRunner.release()
        }
    }
}
