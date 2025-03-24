import { Module } from "@nestjs/common"
import { MoveModule } from "./move"

@Module({
    imports: [
        MoveModule
    ]
})
export class PlacementModule {}