import { Module } from "@nestjs/common"
import { GameplayModule } from "./gameplay"

@Module({
    imports: [GameplayModule],
    providers: [],
    exports: []
})
export class AppModuleV1 {}
