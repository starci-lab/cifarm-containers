import { Global, Module } from "@nestjs/common"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/services/gameplay/energy/energy.module"
import { FeedAnimalController } from "./feed-animal.controller"
import { FeedAnimalService } from "./feed-animal.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        EnergyModule,
        LevelModule,
        InventoryModule,
    ],
    controllers: [FeedAnimalController],
    providers: [FeedAnimalService],
    exports: [FeedAnimalService],
})
export class FeedAnimalModule {}
