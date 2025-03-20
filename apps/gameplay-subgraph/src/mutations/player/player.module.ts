import { Module } from "@nestjs/common"
import { MoveInventoryModule } from "./move-inventory"
import { UpdateReferralModule } from "./update-referral"
import { UpdateFollowXModule } from "./update-follow-x"

@Module({
    imports: [MoveInventoryModule, UpdateReferralModule, UpdateFollowXModule]
})
export class PlayerModule {}
