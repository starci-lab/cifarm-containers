import { Module } from "@nestjs/common"
import { ReturnController } from "./return.controller"
import { ReturnService } from "./return.service"

@Module({
    controllers: [ReturnController],
    providers: [ReturnService]
})
export class ReturnModule {}
