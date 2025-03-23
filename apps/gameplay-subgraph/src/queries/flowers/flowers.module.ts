import { Module } from "@nestjs/common"
import { FlowersResolver } from "./flowers.resolver"
import { FlowersService } from "./flowers.service"

@Module({
    imports: [],
    providers: [FlowersService, FlowersResolver]
})
export class FlowersModule {}
