import { Module } from "@nestjs/common"
import { WaterModule } from "./water"
import { HarvestCropModule } from "./harvest-crop"

@Module({
    imports: [WaterModule, HarvestCropModule]
})
export class FarmingModule {}
