import { Controller, Logger } from "@nestjs/common"
import { FollowService } from "./follow.service"
import { GrpcMethod } from "@nestjs/microservices"
import { FollowRequest } from "./follow.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class FollowController {
    private readonly logger = new Logger(FollowController.name)

    constructor(private readonly followService: FollowService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "Follow")
    public async follow(request: FollowRequest) {
        return this.followService.follow(request)
    }
}
