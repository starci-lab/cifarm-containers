import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { UseFertilizerRequest } from "./use-fertilizer.dto"
import { UseFertilizerService } from "./use-fertilizer.service"
import { grpcData, GrpcServiceName } from "@src/grpc"

@Controller()
export class UseFertilizerController {
    private readonly logger = new Logger(UseFertilizerController.name)

    constructor(private readonly useFertilizerService: UseFertilizerService) {}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "UseFertilizer")
    public async useFertilizer(request: UseFertilizerRequest) {
        this.logger.debug("Use Fertilizer request called")
        return this.useFertilizerService.useFertilizer(request)
    }
}
