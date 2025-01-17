import { Injectable, Logger } from "@nestjs/common"
import { GrpcCacheNotFound } from "@src/exceptions"
import { VerifySignatureRequest, VerifySignatureResponse } from "./verify-signature.dto"
import {
    InjectPostgreSQL,
    PlacedItemEntity,
    PlacedItemTypeId,
    Starter,
    SystemEntity,
    SystemId,
    UserEntity,
    SessionEntity
} from "@src/databases"
import {
    AlgorandAuthService,
    AptosAuthService,
    chainKeyToPlatform,
    defaultChainKey,
    EvmAuthService,
    NearAuthService,
    Platform,
    PolkadotAuthService,
    SolanaAuthService
} from "@src/blockchain"
import { EnergyService } from "@src/gameplay"
import { InjectCache } from "@src/cache"
import { Network } from "@src/env"
import { JwtService } from "@src/jwt"
import { Cache } from "cache-manager"
import { DataSource, DeepPartial } from "typeorm"
import { GrpcInternalException } from "nestjs-grpc-exceptions"

@Injectable()
export class VerifySignatureService {
    private readonly logger = new Logger(VerifySignatureService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly evmAuthService: EvmAuthService,
        private readonly solanaAuthService: SolanaAuthService,
        private readonly aptosAuthService: AptosAuthService,
        private readonly algorandAuthService: AlgorandAuthService,
        private readonly polkadotAuthService: PolkadotAuthService,
        private readonly nearAuthService: NearAuthService,
        private readonly jwtService: JwtService,
        private readonly energyService: EnergyService
    ) {}

    public async verifySignature({
        message,
        publicKey,
        signature,
        chainKey,
        network,
        accountAddress,
        deviceInfo
    }: VerifySignatureRequest): Promise<VerifySignatureResponse> {
        //use destructuring to get device, os, browser from deviceInfo, even if deviceInfo is null
        const { device, os, browser, ipV4 } = { ...deviceInfo }

        const valid = await this.cacheManager.get(message)
        if (!valid) {
            throw new GrpcCacheNotFound(message)
        }
        let result = false
        chainKey = chainKey || defaultChainKey
        network = network || Network.Testnet
        const platform = chainKeyToPlatform(chainKey)

        let _accountAddress = publicKey
        switch (platform) {
        case Platform.Evm: {
            result = this.evmAuthService.verifyMessage({
                message,
                signature,
                publicKey
            })
            break
        }
        case Platform.Solana: {
            result = this.solanaAuthService.verifyMessage({
                message,
                signature,
                publicKey
            })
            break
        }
        case Platform.Aptos: {
            if (!accountAddress) throw new Error("Account address is required")
            result = this.aptosAuthService.verifyMessage({
                message,
                signature,
                publicKey
            })
            _accountAddress = accountAddress
            break
        }
        case Platform.Algorand: {
            result = this.algorandAuthService.verifyMessage({
                message,
                signature,
                publicKey
            })
            break
        }
        case Platform.Polkadot: {
            if (!accountAddress) throw new Error("Account address is required")
            result = this.polkadotAuthService.verifyMessage({
                message,
                signature,
                publicKey
            })
            _accountAddress = accountAddress
            break
        }
        case Platform.Near: {
            if (!accountAddress) throw new Error("Account address is required")
            result = this.nearAuthService.verifyMessage({
                message,
                signature,
                publicKey
            })
            _accountAddress = accountAddress
            break
        }
        default:
            this.logger.error(`Unknown platform: ${platform}`)
            break
        }

        if (!result) throw new GrpcInternalException("Signature is invalid")

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            let user = await queryRunner.manager.findOne(UserEntity, {
                where: {
                    accountAddress: _accountAddress,
                    chainKey,
                    network
                }
            })
            //if user not found, create user
            if (!user) {
                await queryRunner.startTransaction()
                try {
                    // get starter info
                    const { value } = await queryRunner.manager.findOne(SystemEntity, {
                        where: { id: SystemId.Starter }
                    })
                    const { golds, positions } = value as Starter
                    const energy = this.energyService.getMaxEnergy()

                    //home & tiles
                    const home: DeepPartial<PlacedItemEntity> = {
                        placedItemTypeId: PlacedItemTypeId.Home,
                        ...positions.home,
                    }
                    const tiles: Array<DeepPartial<PlacedItemEntity>> = positions.tiles.map(
                        (tile) => ({
                            placedItemTypeId: PlacedItemTypeId.StarterTile,
                            ...tile
                        })
                    )
                    user = await queryRunner.manager.save(UserEntity, {
                        username: `${chainKey}-${_accountAddress.substring(0, 5)}`,
                        accountAddress: _accountAddress,
                        chainKey,
                        network,
                        energy,
                        golds,
                        placedItems: [home, ...tiles]
                    })

                    await queryRunner.commitTransaction()
                } catch (error) {
                    const errorMessage = `Transaction user creation failed, reason: ${error.message}`
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
                const errorMessage = `Transaction session creation failed, reason: ${error.message}`
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
