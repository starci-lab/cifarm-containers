import { Module } from "@nestjs/common"
import { CropModule } from "./crop"
import { bullForRoot, configForRoot, schedulerForRoot, typeOrmForRoot } from "@src/dynamic-modules"

@Module({
    imports: [
        configForRoot(),
        bullForRoot(),
        schedulerForRoot(),
        typeOrmForRoot(),
        CropModule
        //AnimalsModule
    ]
})
export class AppModule {}
