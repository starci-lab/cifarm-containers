import { Module } from "@nestjs/common"
import { CropModule } from "./crop"
import { bullForRoot, configForRoot, schedulerForRoot, typeOrmForRoot } from "@src/dynamic-modules"
import { DeliveryModule } from "./delivery"

@Module({
    imports: [
        configForRoot(),
        bullForRoot(),
        schedulerForRoot(),
        typeOrmForRoot(),
        CropModule,
        DeliveryModule
        //AnimalsModule
    ]
})
export class AppModule {}
