import { Inject, Injectable, Logger } from "@nestjs/common"
import { VerifySignatureRequest, VerifySignatureResponse } from "./verify-signature.dto"
import { chainKeyToPlatform, defaultChainKey, Network, Platform } from "@src/config"
import { CacheNotFound, VerifySignatureCreateUserTransactionFailedException } from "@src/exceptions"

import {
    AlgorandAuthService,
    AptosAuthService,
    EvmAuthService,
    JwtService,
    NearAuthService,
    PolkadotAuthService,
    SolanaAuthService
} from "@src/services"
import { Cache } from "cache-manager"
import { DataSource } from "typeorm"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { UserEntity } from "@src/database"

@Injectable()
export class VerifySignatureService {
    private readonly logger = new Logger(VerifySignatureService.name)

    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly dataSource: DataSource,
        private readonly evmAuthService: EvmAuthService,
        private readonly solanaAuthService: SolanaAuthService,
        private readonly aptosAuthService: AptosAuthService,
        private readonly algorandAuthService: AlgorandAuthService,
        private readonly polkadotAuthService: PolkadotAuthService,
        private readonly nearAuthService: NearAuthService,
        private readonly jwtService: JwtService
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
            result = false
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
                    user = await queryRunner.manager.save(UserEntity, {
                        username: `${chainKey}-${_accountAddress.substring(0, 5)}`,
                        accountAddress: _accountAddress,
                        chainKey,
                        network
                    })
                    await queryRunner.commitTransaction()
                } catch (error) {
                    this.logger.error("Transaction verify signature failed", error.message)
                    await queryRunner.rollbackTransaction()
                    throw new VerifySignatureCreateUserTransactionFailedException(error)
                }
                const { accessToken, refreshToken } = await this.jwtService.createAuthTokenPair({
                    id: user.id
                })

                return {
                    userId: user.id,
                    accessToken,
                    refreshToken
                }
            }
        } finally {
            await queryRunner.release()
        }
    }
}
