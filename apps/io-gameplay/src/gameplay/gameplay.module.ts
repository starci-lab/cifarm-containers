import { Module } from "@nestjs/common"
import { PlacedItemsModule } from "./placed-items"
import { VisitModule } from "./visit"
import { AuthModule } from "@src/blockchain"
import { ActionModule } from "./action"
import { EnergyModule } from "./energy"

@Module({
    imports: [AuthModule, PlacedItemsModule, VisitModule, ActionModule, EnergyModule]
})
export class GameplayModule {}
