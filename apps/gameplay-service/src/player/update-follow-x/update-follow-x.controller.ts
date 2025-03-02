import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { getGrpcData, GrpcName } from "@src/grpc"
import { UpdateFollowXService } from "./update-follow-x.service"
import { UpdateFollowXRequest } from "./update-follow-x.dto"

@Controller()
export class UpdateFollowXController {
    private readonly logger = new Logger(UpdateFollowXController.name)

    constructor(private readonly updateFollowXService : UpdateFollowXService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "UpdateFollowX")
    public async updateFollowX(request: UpdateFollowXRequest) {
        return this.updateFollowXService.updateFollowX(request)
    }
}
