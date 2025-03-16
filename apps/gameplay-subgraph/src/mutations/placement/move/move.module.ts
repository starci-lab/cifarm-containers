import { Module } from "@nestjs/common"
import { MoveService } from "./move.service"
import { MoveResolver } from "./move.resolver"

@Module({
    providers: [MoveService, MoveResolver],
})
export class MoveModule {}
