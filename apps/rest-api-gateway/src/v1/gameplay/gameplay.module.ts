import { Module } from "@nestjs/common"
import { GameplayController } from "./gameplay.controller"

@Module({
    controllers: [GameplayController],
})
export class GameplayModule {}
