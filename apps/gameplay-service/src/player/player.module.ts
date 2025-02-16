import { Module } from "@nestjs/common"
import { UpdateTutorialModule } from "./update-tutorial"
import { UpdateInventoryIndexModule } from "./move-inventory"

@Module({
    imports: [UpdateTutorialModule, UpdateInventoryIndexModule]
})
export class PlayerModule {}
