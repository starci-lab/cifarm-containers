import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AnimalEntity, CropEntity, MarketPricingEntity } from "@src/database"
import { AnimalsResolver } from "./animals.resolver"
import { AnimalsService } from "./animals.service"

@Module({
    imports: [TypeOrmModule.forFeature([AnimalEntity, MarketPricingEntity, CropEntity])],
    providers: [AnimalsService, AnimalsResolver]
})
export class AnimalsModule {}
