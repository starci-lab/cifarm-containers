import { Module } from "@nestjs/common"
import { UpdateTutorialModule } from "./update-tutorial"
import { MoveInventoryModule } from "./move-inventory"
import { UpdateReferralModule } from "./update-referral"

@Module({
    imports: [UpdateTutorialModule, MoveInventoryModule, UpdateReferralModule]
})
export class PlayerModule {}
