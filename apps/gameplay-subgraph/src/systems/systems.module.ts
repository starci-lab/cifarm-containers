import { Module } from "@nestjs/common"
import { SystemsService } from "./systems.service"
import { SystemsResolver } from "./systems.resolver"
 
@Module({
    providers: [SystemsService, SystemsResolver]
})
export class SystemsModule {}
