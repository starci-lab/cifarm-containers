import { Global, Module } from "@nestjs/common"
import { InventoryModule, LevelModule } from "@src/gameplay"
import { EnergyModule } from "@src/gameplay/energy/energy.module"
import { FeedAnimalController } from "./feed-animal.controller"
import { FeedAnimalService } from "./feed-animal.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        EnergyModule,
        LevelModule,
        InventoryModule,
    ],
    controllers: [FeedAnimalController],
    providers: [FeedAnimalService],
    exports: [FeedAnimalService],
})
export class FeedAnimalModule {}
