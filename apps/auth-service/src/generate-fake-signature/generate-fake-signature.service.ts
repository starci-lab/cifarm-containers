import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { DataSource } from "typeorm"
import { HealthcheckEntity } from "@src/database"
import { authGrpcConstants } from "../constant"
import { GenerateFakeSignatureRequest, GenerateFakeSignatureResponse } from "./generate-fake-signature.dto"
import { chainKeyToPlatform, defaultChainKey, defaultNetwork, envConfig, Platform, SupportedChainKey } from "@src/config"
import { ChainKeyNotFoundException } from "@src/exceptions"
import { defaultBotType } from "@src/guards"
import { encode } from "punycode"

@Controller()
export class DoHealthcheckService {
    private readonly logger = new Logger(DoHealthcheckService.name)

    constructor(
        private readonly dataSource: DataSource,
        private readonly 
    ) {}

  @GrpcMethod(authGrpcConstants.SERVICE, "GenerateFakeSignature")
    public async generateFakeSignature({
            accountNumber,
            chainKey,
            network,
        }: GenerateFakeSignatureRequest): Promise<GenerateFakeSignatureResponse> {
            network = network || defaultNetwork
            const {
                data: { message },
            } = await this.requestMessage()
            chainKey = chainKey ?? defaultChainKey
            accountNumber = accountNumber ?? 0
    
            const platform = chainKeyToPlatform(chainKey)
            switch (platform) {
            case Platform.Evm: {
                const { privateKey, address } =
              this.evmAuthService.getFakeKeyPair(accountNumber)
                const signature = this.evmAuthService.signMessage(message, privateKey)
                return {
                    message: GET_FAKE_SIGNATURE_RESPONSE_SUCCESS_MESSAGE,
                    data: {
                        message,
                        publicKey: address,
                        signature,
                        chainKey,
                        network,
                        telegramInitDataRaw: envConfig().secrets.telegram.mockAuthorization,
                        botType: defaultBotType,
                        accountAddress: address,
                    },
                }
            }
            case Platform.Solana: {
                const { publicKey, secretKey } =
              this.solanaAuthService.getFakeKeyPair(accountNumber)
                const signature = this.solanaAuthService.signMessage(
                    message,
                    encode(secretKey),
                )
                return {
                    message: GET_FAKE_SIGNATURE_RESPONSE_SUCCESS_MESSAGE,
                    data: {
                        message,
                        publicKey: publicKey.toBase58(),
                        signature,
                        chainKey,
                        network,
                        telegramInitDataRaw: envConfig().secrets.telegram.mockAuthorization,
                        botType: defaultBotType,
                        accountAddress: publicKey.toBase58(),
                    },
                }
            }
            case Platform.Aptos: {
                const { publicKey, privateKey } =
              this.aptosAuthService.getFakeKeyPair(accountNumber)
                const signature = this.aptosAuthService.signMessage(
                    message,
                    privateKey.toString(),
                )
                return {
                    message: GET_FAKE_SIGNATURE_RESPONSE_SUCCESS_MESSAGE,
                    data: {
                        message,
                        publicKey: publicKey.toString(),
                        signature,
                        chainKey,
                        network,
                        telegramInitDataRaw: envConfig().secrets.telegram.mockAuthorization,
                        botType: defaultBotType,
                        accountAddress: this.aptosAuthService.toAddress(publicKey.toString()),
                    },
                }
            }
            case Platform.Algorand: {
                const { addr, sk } =
              this.algorandAuthService.getFakeKeyPair(accountNumber)
                const signature = this.algorandAuthService.signMessage(
                    message,
                    Buffer.from(sk).toString("base64"),
                )
                return {
                    message: GET_FAKE_SIGNATURE_RESPONSE_SUCCESS_MESSAGE,
                    data: {
                        message,
                        publicKey: addr.toString(),
                        signature,
                        chainKey,
                        network,
                        telegramInitDataRaw: envConfig().secrets.telegram.mockAuthorization,
                        botType: defaultBotType,
                        accountAddress: addr.toString(),
                    },
                }
            }
            case Platform.Polkadot: {
                const { publicKey, privateKey } =
              this.polkadotAuthService.getFakeKeyPair(accountNumber)
    
                const signature = this.polkadotAuthService.signMessage(
                    message,
                    privateKey.toString(),
                    publicKey.toString(),
                )
    
                return {
                    message: GET_FAKE_SIGNATURE_RESPONSE_SUCCESS_MESSAGE,
                    data: {
                        message,
                        publicKey: publicKey.toString(),
                        signature,
                        chainKey,
                        network,
                        telegramInitDataRaw: envConfig().secrets.telegram.mockAuthorization,
                        botType: defaultBotType,
                        accountAddress: publicKey.toString(),
                    },
                }
            }
            case Platform.Near: {
                const { publicKey, secretKey } =
              this.nearAuthService.getFakeKeyPair(accountNumber)
                const signature = this.nearAuthService.signMessage(
                    message,
                    secretKey.toString(),
                )
                return {
                    message: GET_FAKE_SIGNATURE_RESPONSE_SUCCESS_MESSAGE,
                    data: {
                        message,
                        publicKey: publicKey.toString(),
                        signature,
                        chainKey,
                        network,
                        telegramInitDataRaw: envConfig().secrets.telegram.mockAuthorization,
                        botType: defaultBotType,
                        accountAddress: `example.${envConfig().chainCredentials[SupportedChainKey.Near].creator[network].accountId}`,
                    },
                }
            }
            default:
                throw new ChainKeyNotFoundException(chainKey)
            }
        }
    }    
}
