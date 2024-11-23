import { Module } from "@nestjs/common"
import { ConstructBuildingModule } from "./construct-building"

@Module({
    imports: [ConstructBuildingModule]
})
export class ShopModule {}
