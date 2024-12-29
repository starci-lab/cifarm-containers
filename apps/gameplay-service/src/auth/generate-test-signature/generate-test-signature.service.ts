import { Injectable, Logger } from "@nestjs/common"
import {
    GenerateTestSignatureRequest,
    GenerateTestSignatureResponse
} from "./generate-test-signature.dto"
import {
    chainKeyToPlatform,
    defaultChainKey,
    defaultNetwork,
    envConfig,
    Platform,
    SupportedChainKey
} from "@src/config"
import { ChainKeyNotFoundException } from "@src/exceptions"
import { defaultBotType } from "@src/guards"
import {
    AlgorandAuthService,
    AptosAuthService,
    EvmAuthService,
    NearAuthService,
    PolkadotAuthService,
    SolanaAuthService
} from "@src/blockchain"
import { RequestMessageService } from "../request-message"
import { encode } from "bs58"

@Injectable()
export class GenerateTestSignatureService {
    private readonly logger = new Logger(GenerateTestSignatureService.name)

    constructor(
        private readonly requestMessageService: RequestMessageService,
        private readonly evmAuthService: EvmAuthService,
        private readonly solanaAuthService: SolanaAuthService,
        private readonly aptosAuthService: AptosAuthService,
        private readonly algorandAuthService: AlgorandAuthService,
        private readonly polkadotAuthService: PolkadotAuthService,
        private readonly nearAuthService: NearAuthService
    ) {}

    public async generateTestSignature({
        accountNumber,
        chainKey,
        network
    }: GenerateTestSignatureRequest): Promise<GenerateTestSignatureResponse> {
        network = network || defaultNetwork
        const { message } = await this.requestMessageService.requestMessage()
        chainKey = chainKey ?? defaultChainKey
        accountNumber = accountNumber ?? 0

        const platform = chainKeyToPlatform(chainKey)
        switch (platform) {
        case Platform.Evm: {
            const { privateKey, address } = this.evmAuthService.getFakeKeyPair(accountNumber)
            const signature = this.evmAuthService.signMessage(message, privateKey)
            return {
                message,
                publicKey: address,
                signature,
                chainKey,
                network,
                telegramInitDataRaw: envConfig().secrets.telegram.mockAuthorization,
                botType: defaultBotType,
                accountAddress: address
            }
        }
        case Platform.Solana: {
            const { publicKey, secretKey } =
                    this.solanaAuthService.getFakeKeyPair(accountNumber)
            const signature = this.solanaAuthService.signMessage(message, encode(secretKey))
            return {
                message,
                publicKey: publicKey.toBase58(),
                signature,
                chainKey,
                network,
                telegramInitDataRaw: envConfig().secrets.telegram.mockAuthorization,
                botType: defaultBotType,
                accountAddress: publicKey.toBase58()
            }
        }
        case Platform.Aptos: {
            const { publicKey, privateKey } =
                    this.aptosAuthService.getFakeKeyPair(accountNumber)
            const signature = this.aptosAuthService.signMessage(message, privateKey.toString())
            return {
                message,
                publicKey: publicKey.toString(),
                signature,
                chainKey,
                network,
                telegramInitDataRaw: envConfig().secrets.telegram.mockAuthorization,
                botType: defaultBotType,
                accountAddress: this.aptosAuthService.toAddress(publicKey.toString())
            }
        }
        case Platform.Algorand: {
            const { addr, sk } = this.algorandAuthService.getFakeKeyPair(accountNumber)
            const signature = this.algorandAuthService.signMessage(
                message,
                Buffer.from(sk).toString("base64")
            )
            return {
                message,
                publicKey: addr.toString(),
                signature,
                chainKey,
                network,
                telegramInitDataRaw: envConfig().secrets.telegram.mockAuthorization,
                botType: defaultBotType,
                accountAddress: addr.toString()
            }
        }
        case Platform.Polkadot: {
            const { publicKey, privateKey } =
                    this.polkadotAuthService.getFakeKeyPair(accountNumber)

            const signature = this.polkadotAuthService.signMessage(
                message,
                privateKey.toString(),
                publicKey.toString()
            )

            return {
                message,
                publicKey: publicKey.toString(),
                signature,
                chainKey,
                network,
                telegramInitDataRaw: envConfig().secrets.telegram.mockAuthorization,
                botType: defaultBotType,
                accountAddress: publicKey.toString()
            }
        }
        case Platform.Near: {
            const { publicKey, secretKey } = this.nearAuthService.getFakeKeyPair(accountNumber)
            const signature = this.nearAuthService.signMessage(message, secretKey.toString())
            return {
                message,
                publicKey: publicKey.toString(),
                signature,
                chainKey,
                network,
                telegramInitDataRaw: envConfig().secrets.telegram.mockAuthorization,
                botType: defaultBotType,
                accountAddress: `example.${envConfig().chainCredentials[SupportedChainKey.Near].creator[network].accountId}`
            }
        }
        default:
            throw new ChainKeyNotFoundException(chainKey)
        }
    }
}
