import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { getGrpcData, GrpcName } from "@src/grpc"
import { VisitRequest } from "./visit.dto"
import { VisitService } from "./visit.service"

@Controller()
export class VisitController {
    private readonly logger = new Logger(VisitController.name)

    constructor(private readonly visitService: VisitService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "Visit")
    public async visit(request: VisitRequest) {
        return this.visitService.visit(request)
    }
}
