import { Module } from "@nestjs/common"
import { GameplayController } from "./gameplay.controller"
import { GrpcModule, GrpcServiceName } from "@src/grpc"

@Module({
    imports: [
        GrpcModule.forRoot({
            name: GrpcServiceName.Gameplay
        }),
    ],
    controllers: [GameplayController],
    providers: [GameplayController],
    exports: [GameplayController],
})
export class GameplayModule {}
