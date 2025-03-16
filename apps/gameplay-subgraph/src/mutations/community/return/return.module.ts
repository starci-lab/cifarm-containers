import { Module } from "@nestjs/common"
import { ReturnResolver } from "./return.resolver"
import { ReturnService } from "./return.service"

@Module({
    providers: [ReturnService, ReturnResolver]
})
export class ReturnModule {}
