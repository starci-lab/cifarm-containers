import { Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { GameplayModule } from "./gameplay"

@Module({
    imports: [AuthModule, GameplayModule],
    providers: [],
    exports: [AuthModule, GameplayModule]
})
export class AppModuleV1 {}
