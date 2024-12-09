import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { VerifySignatureRequest } from "./verify-signature.dto"
import { VerifySignatureService } from "./verify-signature.service"
import { grpcConfig, GrpcServiceName } from "@src/config"

@Controller()
export class VerifySignatureController {
    private readonly logger = new Logger(VerifySignatureController.name)

    constructor(private readonly verifySignatureService: VerifySignatureService) {}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "VerifySignature")
    public async verifySignature(request: VerifySignatureRequest) {
        this.logger.debug("VerifySignature called")
        return this.verifySignatureService.verifySignature(request)
    }
}
