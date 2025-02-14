import { Module } from "@nestjs/common"
import { UpdateTutorialModule } from "./update-tutorial"
import { UpdateInventoryIndexModule } from "./update-inventory-index"

@Module({
    imports: [UpdateTutorialModule, UpdateInventoryIndexModule]
})
export class PlayerModule {}
