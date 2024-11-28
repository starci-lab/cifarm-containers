import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { authGrpcConstants } from "../../app.constants"
import { VerifySignatureService } from "./verify-signature.service"
import { VerifySignatureRequest } from "./verify-signature.dto"

@Controller()
export class VerifySignatureController {
    private readonly logger = new Logger(VerifySignatureController.name)

    constructor(private readonly verifySignatureService: VerifySignatureService) {}

    @GrpcMethod(authGrpcConstants.SERVICE, "VerifySignature")
    public async verifySignature(request: VerifySignatureRequest) {
        this.logger.debug("VerifySignature called")
        return this.verifySignatureService.verifySignature(request)
    }
}
