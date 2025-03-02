import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { getGrpcData, GrpcName } from "@src/grpc"
import { UpdateReferralService } from "./update-referral.service"
import { UpdateReferralRequest } from "./update-referral.dto"

@Controller()
export class UpdateReferralController {
    private readonly logger = new Logger(UpdateReferralController.name)

    constructor(private readonly updateReferralService : UpdateReferralService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "UpdateReferral")
    public async updateReferral(request: UpdateReferralRequest) {
        return this.updateReferralService.updateReferral(request)
    }
}
