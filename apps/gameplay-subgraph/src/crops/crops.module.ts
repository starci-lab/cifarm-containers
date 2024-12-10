import { Module } from "@nestjs/common"
import { CropsResolver } from "./crops.resolver"
import { CropsService } from "./crops.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature()],
    providers: [CropsService, CropsResolver]
})
export class CropsModule {}
