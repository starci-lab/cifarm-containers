import { Module } from "@nestjs/common"
import { GrpcModule } from "@src/grpc"
import { GameplayController } from "./gameplay.controller"

@Module({
    imports: [
        GrpcModule.register(),
    ],
    controllers: [GameplayController],
    providers: [],
    exports: [],
})
export class GameplayModule {}
