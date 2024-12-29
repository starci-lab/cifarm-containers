import { Controller, Logger } from "@nestjs/common"
import { FollowService } from "./follow.service"
import { GrpcMethod } from "@nestjs/microservices"
import { FollowRequest } from "./follow.dto"
import { grpcData, GrpcServiceName } from "@src/grpc"

@Controller()
export class FollowController {
    private readonly logger = new Logger(FollowController.name)

    constructor(private readonly followService: FollowService) {}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "Follow")
    public async follow(request: FollowRequest) {
        this.logger.debug("Follow called")
        return this.followService.follow(request)
    }
}
