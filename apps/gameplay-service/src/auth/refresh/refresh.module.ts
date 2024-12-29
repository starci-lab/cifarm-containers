import { Global, Module } from "@nestjs/common"
import { BlockchainModule } from "@src/blockchain"
import { JwtModule } from "@src/jwt"
import { RefreshController } from "./refresh.controller"
import { RefreshService } from "./refresh.service"

@Global()
@Module({
    imports: [JwtModule, BlockchainModule],
    controllers: [RefreshController],
    providers: [RefreshService],
    exports: [RefreshService]
})
export class RefreshModule {}
