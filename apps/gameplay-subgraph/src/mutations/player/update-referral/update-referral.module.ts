import { Module } from "@nestjs/common"
import { UpdateReferralService } from "./update-referral.service"
import { UpdateReferralResolver } from "./update-referral.resolver"


@Module({
    providers: [UpdateReferralService, UpdateReferralResolver]
})
export class UpdateReferralModule {}
