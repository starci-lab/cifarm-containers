import { Module } from "@nestjs/common"
import { GameplayModule } from "./gameplay"

@Module({
    imports: [GameplayModule],
    providers: [],
    exports: [GameplayModule]
})
export class AppV1Module {}
