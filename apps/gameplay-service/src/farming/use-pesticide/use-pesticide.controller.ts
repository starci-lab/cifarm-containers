import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { UsePesticideRequest } from "./use-pesticide.dto"
import { UsePesticideService } from "./use-pesticide.service"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class UsePesticideController {
    private readonly logger = new Logger(UsePesticideController.name)

    constructor(private readonly usePesticideService: UsePesticideService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "UsePesticide")
    public async usePesticide(request: UsePesticideRequest) {
        this.logger.debug("Use pesticide request called")
        return this.usePesticideService.usePesticide(request)
    }
}
