import { Module } from "@nestjs/common"
import { UpdateTutorialModule } from "./update-tutorial"
import { MoveInventoryModule } from "./move-inventory"
import { UpdateReferralModule } from "./update-referral"
import { UpdateFollowXModule } from "./update-follow-x"

@Module({
    imports: [UpdateTutorialModule, MoveInventoryModule, UpdateReferralModule, UpdateFollowXModule]
})
export class PlayerModule {}
