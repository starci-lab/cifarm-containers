import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { GenerateSignatureRequest } from "./generate-signature.dto"
import { GenerateSignatureService } from "./generate-signature.service"
import { grpcData, GrpcServiceName } from "@src/grpc"

@Controller()
export class GenerateSignatureController {
    private readonly logger = new Logger(GenerateSignatureController.name)

    constructor(private readonly generateSignatureService: GenerateSignatureService) {}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "GenerateSignature")
    public async generateSignature(request: GenerateSignatureRequest) {
        this.logger.debug("GenerateSignature called")
        return this.generateSignatureService.generateSignature(request)
    }
}
