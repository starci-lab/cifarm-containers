import { Module } from "@nestjs/common"
import { UpdateReferralService } from "./update-referral.service"
import { UpdateReferralController } from "./update-referral.controller"


@Module({
    imports: [],
    providers: [UpdateReferralService],
    controllers: [UpdateReferralController]
})
export class UpdateReferralModule {}
