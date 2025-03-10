import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { ClaimDailyRewardService } from "./claim-daily-reward.service"
import { ClaimDailyRewardRequest } from "./claim-daily-reward.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class ClaimDailyRewardSpinController {
    private readonly logger = new Logger(ClaimDailyRewardSpinController.name)

    constructor(private readonly claimDailyRewardService: ClaimDailyRewardService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "ClaimDailyReward")
    public async claimDailyReward(request: ClaimDailyRewardRequest) {
        this.logger.debug(`Claiming daily reward for user ${request.userId}`)
        return this.claimDailyRewardService.claimDailyReward(request)
    }
}
