import { Module } from "@nestjs/common"
import { PlacedItemsModule } from "./placed-items"
import { VisitModule } from "./visit"
import { AuthModule } from "@src/blockchain"

@Module({
    imports: [AuthModule, PlacedItemsModule, VisitModule]
})
export class GameplayModule {}
