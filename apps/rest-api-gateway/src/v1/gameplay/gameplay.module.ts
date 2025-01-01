import { Module } from "@nestjs/common"
import { GrpcModule, GrpcServiceName } from "@src/grpc"
import { GameplayController } from "./gameplay.controller"

@Module({
    imports: [
        GrpcModule.register({
            name: GrpcServiceName.Gameplay
        }),
    ],
    controllers: [GameplayController],
    providers: [],
    exports: [],
})
export class GameplayModule {}
