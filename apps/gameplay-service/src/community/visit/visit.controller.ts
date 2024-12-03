import { Controller, Logger } from "@nestjs/common"
import { VisitService } from "./visit.service"
import { GrpcMethod } from "@nestjs/microservices"
import { grpcConfig, GrpcServiceName } from "@src/config"
import { VisitRequest } from "./visit.dto"

@Controller()
export class VisitController {
    private readonly logger = new Logger(VisitController.name)

    constructor(private readonly visitService: VisitService) {}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "Visit")
    async visit(request: VisitRequest) {
        this.logger.debug("Unfollow called")
        await this.visitService.visit(request)
    }
}
