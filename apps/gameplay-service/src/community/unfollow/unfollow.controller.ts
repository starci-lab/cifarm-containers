import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { getGrpcData, GrpcName } from "@src/grpc"
import { UnfollowService } from "./unfollow.service"
import { UnfollowRequest } from "./unfollow.dto"

@Controller()
export class UnfollowController {
    private readonly logger = new Logger(UnfollowController.name)

    constructor(private readonly unfollowService: UnfollowService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "Unfollow")
    public async follow(request: UnfollowRequest) {
        this.logger.debug("Unfollow called")
        return this.unfollowService.unfollow(request)
    }}
