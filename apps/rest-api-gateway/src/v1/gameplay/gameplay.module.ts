import { Module } from "@nestjs/common"
import { GameplayController } from "./gameplay.controller"
import { grpcClientRegisterAsync } from "@src/dynamic-modules"
import { GrpcServiceName } from "@src/config"

@Module({
    imports: [
        grpcClientRegisterAsync(GrpcServiceName.Gameplay),
    ],
    controllers: [GameplayController],
    providers: [GameplayController],
    exports: [GameplayController],
})
export class GameplayModule {}
