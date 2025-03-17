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
        /************************************************************
         * INITIALIZE PARAMETERS
         ************************************************************/
        // Set default values for optional parameters
        network = network || defaultNetwork
        chainKey = chainKey ?? defaultChainKey
        accountNumber = accountNumber ?? 0

        /************************************************************
         * REQUEST MESSAGE
         ************************************************************/
        // Get a unique message from the request message service
        const { message } = await this.requestMessageService.requestMessage()
        
        /************************************************************
         * GET BLOCKCHAIN AUTH SERVICE
         ************************************************************/
        // Get the appropriate blockchain auth service based on the chain key
        const platform = chainKeyToPlatform(chainKey)
        const authService = this.moduleRef.get<IBlockchainAuthService>(
            getBlockchainAuthServiceToken(platform),
            { strict: false }
        )

        /************************************************************
         * GENERATE KEYS AND SIGNATURE
         ************************************************************/
        // Get key pair and sign the message
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
