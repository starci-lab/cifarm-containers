import { Module } from "@nestjs/common"
import { PlacedItemsModule } from "./placed-items"
import { MainModule } from "./main"

@Module({
    imports: [MainModule, PlacedItemsModule]
})
export class GameplayModule {}
