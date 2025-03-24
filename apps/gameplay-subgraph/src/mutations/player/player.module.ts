import { Module } from "@nestjs/common"
import { UpdateReferralModule } from "./update-referral"
import { UpdateFollowXModule } from "./update-follow-x"

@Module({
    imports: [UpdateReferralModule, UpdateFollowXModule]
})
export class PlayerModule {}
