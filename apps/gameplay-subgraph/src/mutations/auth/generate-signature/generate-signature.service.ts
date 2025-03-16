import { Injectable, Logger } from "@nestjs/common"
import { GenerateSignatureRequest, GenerateSignatureResponse } from "./generate-signature.dto"
import {
    chainKeyToPlatform,
    defaultChainKey,
    defaultNetwork,
    IBlockchainAuthService,
    getBlockchainAuthServiceToken
} from "@src/blockchain"
import { RequestMessageService } from "../request-message"
import { ModuleRef } from "@nestjs/core"

@Injectable()
export class GenerateSignatureService {
    private readonly logger = new Logger(GenerateSignatureService.name)

    constructor(
        private readonly requestMessageService: RequestMessageService,
        private readonly moduleRef: ModuleRef
    ) {}

    public async generateSignature({
        accountNumber,
        chainKey,
        network
    }: GenerateSignatureRequest): Promise<GenerateSignatureResponse> {
        network = network || defaultNetwork
        const { message } = await this.requestMessageService.requestMessage()
        chainKey = chainKey ?? defaultChainKey
        accountNumber = accountNumber ?? 0

        const platform = chainKeyToPlatform(chainKey)

        const authService = this.moduleRef.get<IBlockchainAuthService>(
            getBlockchainAuthServiceToken(platform),
            { strict: false }
        )

        const { publicKey, privateKey, accountAddress } = authService.getKeyPair(accountNumber)
        const signature = authService.signMessage({ message, privateKey })

        return {
            message,
            signature,
            publicKey,
            accountAddress,
            chainKey,
            network
        }
    }
}
