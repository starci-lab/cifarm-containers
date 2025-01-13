import { Injectable, Logger } from "@nestjs/common"
import { CacheNotFound, VerifySignatureTransactionFailedException } from "@src/exceptions"
import { VerifySignatureRequest, VerifySignatureResponse } from "./verify-signature.dto"

import {
    InjectPostgreSQL,
    PlacedItemEntity,
    PlacedItemTypeId,
    SessionEntity,
    Starter,
    SystemEntity,
    SystemId,
    UserEntity
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
        accountAddress
    }: VerifySignatureRequest): Promise<VerifySignatureResponse> {
        const valid = await this.cacheManager.get(message)
        if (!valid) {
            throw new CacheNotFound(message)
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

        if (!result) throw new Error("Signature verification")

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
                        ...positions.home
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
                    this.logger.error("Transaction verify signature failed", error.message)
                    await queryRunner.rollbackTransaction()
                    throw new VerifySignatureTransactionFailedException(error)
                }
            }
            const { accessToken, refreshToken } = await this.jwtService.generateAuthCredentials({
                id: user.id
            })

            const userSession: DeepPartial<SessionEntity> = {
                expiredAt: await this.jwtService.getExpiredAt(refreshToken),
                token: refreshToken,
                userId: user.id
            }

            // Create session
            await queryRunner.manager.save(SessionEntity, userSession)

            return {
                accessToken,
                refreshToken
            }
        } finally {
            await queryRunner.release()
        }
    }
}
