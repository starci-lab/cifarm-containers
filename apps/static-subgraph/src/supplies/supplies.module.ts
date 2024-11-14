import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SupplyEntity } from "@src/database"
import { SuppliesResolver } from "./supplies.resolver"
import { SuppliesService } from "./supplies.service"

@Module({
    imports: [TypeOrmModule.forFeature([SupplyEntity])],
    providers: [SuppliesService, SuppliesResolver]
})
export class SuppliesModule {}
