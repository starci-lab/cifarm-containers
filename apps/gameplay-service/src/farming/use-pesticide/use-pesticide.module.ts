import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { UsePesticideController } from "./use-pesticide.controller"
import { UsePesticideService } from "./use-pesticide.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        GameplayModule
    ],
    controllers: [UsePesticideController],
    providers: [UsePesticideService],
    exports: [UsePesticideService]
})
export class UsePesticideModule {}
