import { Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { EmitterModule } from "./emitter"
import { HandlersModule } from "./handlers"

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
