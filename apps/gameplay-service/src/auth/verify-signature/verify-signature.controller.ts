import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { gameplayGrpcConstants } from "../../config"
import { VerifySignatureRequest } from "./verify-signature.dto"
import { VerifySignatureService } from "./verify-signature.service"

@Controller()
export class VerifySignatureController {
    private readonly logger = new Logger(VerifySignatureController.name)

    constructor(private readonly verifySignatureService: VerifySignatureService) {}

    @GrpcMethod(gameplayGrpcConstants.service, "VerifySignature")
    public async verifySignature(request: VerifySignatureRequest) {
        this.logger.debug("VerifySignature called")
        return this.verifySignatureService.verifySignature(request)
    }
}
