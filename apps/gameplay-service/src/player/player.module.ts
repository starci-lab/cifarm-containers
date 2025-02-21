import { Module } from "@nestjs/common"
import { UpdateTutorialModule } from "./update-tutorial"
import { MoveInventoryModule } from "./move-inventory"

@Module({
    imports: [UpdateTutorialModule, MoveInventoryModule]
})
export class PlayerModule {}
