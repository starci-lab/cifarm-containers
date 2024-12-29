import { Global, Module } from "@nestjs/common"
import { GameplayModule  } from "@src/gameplay"
import { SpinController } from "./spin.controller"
import { SpinService } from "./spin.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        GameplayModule
    ],
    providers: [SpinService],
    exports: [SpinService],
    controllers: [SpinController]
})
export class SpinModule {}
