import { Controller, Logger } from "@nestjs/common"
import { VisitService } from "./visit.service"
import { GrpcMethod } from "@nestjs/microservices"
import { getGrpcData, GrpcName } from "@src/grpc"
import { VisitRequest } from "./visit.dto"

@Controller()
export class VisitController {
    private readonly logger = new Logger(VisitController.name)

    constructor(private readonly visitService: VisitService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "Visit")
    async visit(request: VisitRequest) {
        this.logger.debug("Visit called")
        await this.visitService.visit(request)
    }
}
