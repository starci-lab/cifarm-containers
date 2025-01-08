import { Module } from "@nestjs/common"
import { SuppliesResolver } from "./supplies.resolver"
import { SuppliesService } from "./supplies.service"

@Module({
    providers: [SuppliesService, SuppliesResolver]
})
export class SuppliesModule {}
