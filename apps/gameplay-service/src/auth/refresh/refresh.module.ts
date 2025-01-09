import { Module } from "@nestjs/common"
import { JwtModule } from "@src/jwt"
import { RefreshController } from "./refresh.controller"
import { RefreshService } from "./refresh.service"

 
@Module({
    imports: [],
    controllers: [RefreshController],
    providers: [RefreshService],
    exports: [RefreshService]
})
export class RefreshModule {}
