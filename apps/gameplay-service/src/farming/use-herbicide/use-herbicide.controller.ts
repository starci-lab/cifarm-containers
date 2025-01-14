import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { UseHerbicideService } from "./use-herbicide.service"
import { UseHerbicideRequest } from "./use-herbicide.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class UseHerbicideController {
    private readonly logger = new Logger(UseHerbicideController.name)

    constructor(private readonly useHerbicideService: UseHerbicideService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "UseHerbicide")
    public async useHerbicide(request: UseHerbicideRequest) {
        this.logger.debug("Use herbicide request called")
        return this.useHerbicideService.useHerbicide(request)
    }
}
