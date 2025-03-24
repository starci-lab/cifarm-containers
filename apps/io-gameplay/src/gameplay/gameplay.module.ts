import { Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { HandlersModule } from "./handlers"
import { EmitterModule } from "./emitter"

@Module({
    imports: [
        AuthModule.register({
            isGlobal: true
        }),
        EmitterModule.register({
            isGlobal: true
        }),
        HandlersModule
    ]
})
export class GameplayNamespaceModule {}
