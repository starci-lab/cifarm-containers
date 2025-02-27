import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { getGrpcData, GrpcName } from "@src/grpc"
import { ClaimHoneycombDailyRewardService } from "./claim-honeycomb-daily-reward.service"
import { ClaimHoneycombDailyRewardRequest } from "./claim-honeycomb-daily-reward.dto"

@Controller()
export class ClaimHoneycombDailyRewardController {
    private readonly logger = new Logger(ClaimHoneycombDailyRewardController.name)

    constructor(private readonly claimHoneycombDailyRewardService : ClaimHoneycombDailyRewardService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "ClaimHoneycombDailyReward")
    public async claimHoneycombDailyReward(request: ClaimHoneycombDailyRewardRequest) {
        return this.claimHoneycombDailyRewardService.claimHoneycombDailyReward(request)
    }
}
