import { Module } from "@nestjs/common"
import { SpinsResolver } from "./spins.resolver"
import { SpinsService } from "./spins.service"

@Module({
    providers: [SpinsService, SpinsResolver]
})
export class SpinsModule {}
