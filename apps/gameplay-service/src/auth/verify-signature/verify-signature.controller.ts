import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { VerifySignatureRequest } from "./verify-signature.dto"
import { VerifySignatureService } from "./verify-signature.service"
import { grpcData, GrpcServiceName } from "@src/grpc"

@Controller()
export class VerifySignatureController {
    private readonly logger = new Logger(VerifySignatureController.name)

    constructor(private readonly verifySignatureService: VerifySignatureService) {}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "VerifySignature")
    public async verifySignature(request: VerifySignatureRequest) {
        this.logger.debug("VerifySignature called")
        return this.verifySignatureService.verifySignature(request)
    }
}
