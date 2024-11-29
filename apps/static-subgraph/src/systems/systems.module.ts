import { SystemsResolver } from "@apps/static-subgraph/src/systems/systems.resolver"
import { SystemsService } from "@apps/static-subgraph/src/systems/systems.service"
import { Module } from "@nestjs/common"

@Module({
    providers: [SystemsService, SystemsResolver]
})
export class SystemsModule {}
