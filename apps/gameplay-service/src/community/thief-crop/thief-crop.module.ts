import { Module } from "@nestjs/common"
import { EnvModule } from "@src/env"
import { GameplayModule } from "@src/gameplay"
import { ThiefCropController } from "./thief-crop.controller"
import { TheifCropService } from "./thief-crop.service"

 
@Module({
    imports: [EnvModule.forRoot(), GameplayModule],
    providers: [TheifCropService],
    exports: [TheifCropService],
    controllers: [ThiefCropController]
})
export class ThiefCropModule {}
