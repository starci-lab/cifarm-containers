import { Module } from "@nestjs/common"
import { ReturnController } from "./return.controller"
import { ReturnService } from "./return.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [GameplayPostgreSQLModule.forFeature()],
    controllers: [ReturnController],
    providers: [ReturnService]
})
export class ReturnModule {}
