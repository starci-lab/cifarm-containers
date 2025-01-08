import { Module } from "@nestjs/common"
import { MoveController } from "./move.controller"
import { MoveService } from "./move.service"

@Module({
    imports: [],
    providers: [MoveService],
    controllers: [MoveController]
})
export class MoveModule {}
