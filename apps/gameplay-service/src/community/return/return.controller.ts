import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { getGrpcData, GrpcName } from "@src/grpc"
import { ReturnRequest } from "./return.dto"
import { ReturnService } from "./return.service"

@Controller()
export class ReturnController {
    private readonly logger = new Logger(ReturnController.name)

    constructor(private readonly returnService: ReturnService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "Return")
    public async return(request: ReturnRequest) {
        return this.returnService.return(request)
    }
}
