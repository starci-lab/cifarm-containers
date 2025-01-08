import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { PlantSeedController } from "./plant-seed.controller"
import { PlantSeedService } from "./plant-seed.service"

@Global()
@Module({
    imports: [GameplayModule],
    controllers: [PlantSeedController],
    providers: [PlantSeedService],
    exports: [PlantSeedService]
})
export class PlantSeedModule {}
