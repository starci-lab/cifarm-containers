import { Module } from "@nestjs/common"
import { CropsResolver } from "./crops.resolver"
import { CropsService } from "./crops.service"

@Module({
    providers: [CropsService, CropsResolver]
})
export class CropsModule {}
