import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { HarvestCropController } from "./harvest-crop.controller"
import { HarvestCropService } from "./harvest-crop.service"

@Global()
@Module({
    imports: [GameplayModule],
    controllers: [HarvestCropController],
    providers: [HarvestCropService],
    exports: [HarvestCropService]
})
export class HarvestCropModule {}
