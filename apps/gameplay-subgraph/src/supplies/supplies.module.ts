import { Module } from "@nestjs/common"
import { SuppliesResolver } from "./supplies.resolver"
import { SuppliesService } from "./supplies.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature()],
    providers: [SuppliesService, SuppliesResolver]
})
export class SuppliesModule {}
