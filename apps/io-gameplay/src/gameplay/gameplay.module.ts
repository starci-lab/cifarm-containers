import { Module } from "@nestjs/common"
import { PlacedItemsModule } from "./placed-items"
import { AuthGateway } from "./auth"
import { VisitModule } from "./visit"

@Module({
    imports: [AuthGateway, PlacedItemsModule, VisitModule]
})
export class GameplayModule {}
