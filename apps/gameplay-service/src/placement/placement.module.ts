import { Module } from "@nestjs/common"
import { MoveModule } from "./move"
import { SellModule } from "./sell"
@Module({
    imports: [
        MoveModule,
        SellModule
    ]
})
export class PlacementModule {}
