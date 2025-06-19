import { Module } from "@nestjs/common"
import { UpdateReferralModule } from "./update-referral"
import { UpdateFollowXModule } from "./update-follow-x"
import { UpdateDisplayInformationModule } from "./update-display-information"

@Module({
    imports: [UpdateReferralModule, UpdateFollowXModule, UpdateDisplayInformationModule]
})
export class PlayerModule {}
