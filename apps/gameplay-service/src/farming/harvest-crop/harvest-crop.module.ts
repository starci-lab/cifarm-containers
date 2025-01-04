import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { HarvestCropService } from "./harvest-crop.service"
import { HarvestCropController } from "./harvest-crop.controller"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        GameplayModule
    ],
    controllers: [HarvestCropController],
    providers: [HarvestCropService],
    exports: [HarvestCropService]
})
export class HarvestCropModule {}
