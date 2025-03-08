import { Module } from "@nestjs/common"
import { PlacedItemsModule } from "./placed-items"
import { VisitModule } from "./visit"
import { AuthModule } from "@src/blockchain"
import { ActionModule } from "./action"

@Module({
    imports: [AuthModule, PlacedItemsModule, VisitModule, ActionModule]
})
export class GameplayModule {}
