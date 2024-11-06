import { Injectable, Logger } from "@nestjs/common"
import {
    VerifySignatureRequest,
    VerifySignatureResponse
} from "./verify-signature.dto"
import {
    chainKeyToPlatform,
    defaultChainKey,
    Network,
    Platform,
} from "@src/config"
import { CacheNotFound } from "@src/exceptions"

import {
    AlgorandAuthService,
    AptosAuthService,
    EvmAuthService,
    NearAuthService,
    PolkadotAuthService,
    SolanaAuthService,
} from "@src/services"
import { RequestMessageService } from "../request-message"
import { Cache } from "cache-manager"

@Injectable()
export class GenerateTestSignatureService {
    private readonly logger = new Logger(GenerateTestSignatureService.name)

    constructor(
    private readonly cacheManager: Cache,
    private readonly requestMessageService: RequestMessageService,
    private readonly evmAuthService: EvmAuthService,
    private readonly solanaAuthService: SolanaAuthService,
    private readonly aptosAuthService: AptosAuthService,
    private readonly algorandAuthService: AlgorandAuthService,
    private readonly polkadotAuthService: PolkadotAuthService,
    private readonly nearAuthService: NearAuthService,
    ) {}

    public async verifySignature({
        message,
        publicKey,
        signature,
        chainKey,
        network,
    }: VerifySignatureRequest): Promise<VerifySignatureResponse> {
        const valid = await this.cacheManager.get(message)
        if (!valid) {
            throw new CacheNotFound(message)
        }
        console.log(message, signature, publicKey)
        //await this.cacheManager.del(message)
        let result = false

        chainKey = chainKey ?? defaultChainKey
        network = network ?? Network.Testnet
        //
        console.log(chainKey, network)
        const platform = chainKeyToPlatform(chainKey)
        switch (platform) {
        case Platform.Evm: {
            result = this.evmAuthService.verifyMessage({
                message,
                signature,
                publicKey,
            })
            break
        }
        case Platform.Solana: {
            result = this.solanaAuthService.verifyMessage({
                message,
                signature,
                publicKey,
            })
            break
        }
        case Platform.Aptos: {
            result = this.aptosAuthService.verifyMessage({
                message,
                signature,
                publicKey,
            })
            break
        }
        case Platform.Algorand: {
            result = this.algorandAuthService.verifyMessage({
                message,
                signature,
                publicKey,
            })
            break
        }
        case Platform.Polkadot: {
            result = this.polkadotAuthService.verifyMessage({
                message,
                signature,
                publicKey,
            })
            break
        }
        case Platform.Near: {
            result = this.nearAuthService.verifyMessage({
                message,
                signature,
                publicKey,
            })
            break
        }
        default:
            this.logger.error(`Unknown platform: ${platform}`)
            result = false
            break
        }
        return {
            result
        }
    }
}
