import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { BuySeedsController } from "./buy-seeds.controller"
import { BuySeedsService } from "./buy-seeds.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        GameplayModule
    ],
    providers: [BuySeedsService],
    exports: [BuySeedsService],
    controllers: [BuySeedsController]
})
export class BuySeedsModule {}
