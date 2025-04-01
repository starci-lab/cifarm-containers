import { Module } from "@nestjs/common"
import { MoveService } from "./move.service"
import { MoveGateway } from "./move.gateway"

@Module({
    providers: [MoveService, MoveGateway],
})
export class MoveModule {}
