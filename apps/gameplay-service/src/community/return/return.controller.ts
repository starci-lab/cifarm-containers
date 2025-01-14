import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { getGrpcData, GrpcName } from "@src/grpc"
import { ReturnService } from "./return.service"
import { ReturnRequest } from "./return.dto"

@Controller()
export class ReturnController {
    private readonly logger = new Logger(ReturnController.name)

    constructor(private readonly returnService: ReturnService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "Return")
    async return(request: ReturnRequest) {
        this.logger.debug("Return called")
        await this.returnService.return(request)
    }
}
