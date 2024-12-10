import { Module } from "@nestjs/common"
import { BuildingsResolver } from "./buildings.resolver"
import { BuildingsService } from "./buildings.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature()],
    providers: [BuildingsService, BuildingsResolver]
})
export class BuildingsModule {}
