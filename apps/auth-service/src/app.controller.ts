import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { authGrpcConstants } from "./constants"
import {
    GenerateTestSignatureRequest,
    GenerateTestSignatureService
} from "./generate-test-signature"
import { RequestMessageService } from "./request-message"
import { VerifySignatureRequest, VerifySignatureService } from "./verify-signature"

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name)

    constructor(
        private readonly requestMessageService: RequestMessageService,
        private readonly generateTestSignatureService: GenerateTestSignatureService,
        private readonly verifySignatureService: VerifySignatureService
    ) {}

    @GrpcMethod(authGrpcConstants.SERVICE, "RequestMessage")
    public async requestMessage() {
        this.logger.debug("RequestMessage called")
        return this.requestMessageService.requestMessage()
    }

    @GrpcMethod(authGrpcConstants.SERVICE, "GenerateTestSignature")
    public async generateTestSignature(request: GenerateTestSignatureRequest) {
        this.logger.debug("GenerateTestSignature called")
        return this.generateTestSignatureService.generateTestSignature(request)
    }

    @GrpcMethod(authGrpcConstants.SERVICE, "VerifySignature")
    public async verifySignature(request: VerifySignatureRequest) {
        this.logger.debug("VerifySignature called")
        return this.verifySignatureService.verifySignature(request)
    }
}
