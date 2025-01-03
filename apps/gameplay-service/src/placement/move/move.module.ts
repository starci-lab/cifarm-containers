import { Module } from "@nestjs/common"
import { MoveController } from "./move.controller"
import { MoveService } from "./move.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot()
    ],
    providers: [MoveService],
    controllers: [MoveController]
})
export class MoveModule {}
