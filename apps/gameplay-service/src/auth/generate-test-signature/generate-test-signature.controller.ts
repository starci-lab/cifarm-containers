import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { GenerateTestSignatureRequest } from "./generate-test-signature.dto"
import { GenerateTestSignatureService } from "./generate-test-signature.service"
import { grpcConfig } from "@src/config"

@Controller()
export class GenerateTestSignatureController {
    private readonly logger = new Logger(GenerateTestSignatureController.name)

    constructor(private readonly generateTestSignatureService: GenerateTestSignatureService) {}

    @GrpcMethod(grpcConfig.gameplay.service, "GenerateTestSignature")
    public async generateTestSignature(request: GenerateTestSignatureRequest) {
        this.logger.debug("GenerateTestSignature called")
        return this.generateTestSignatureService.generateTestSignature(request)
    }
}
