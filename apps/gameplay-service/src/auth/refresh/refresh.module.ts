import { Global, Module } from "@nestjs/common"
import { RefreshService } from "./refresh.service"
import { RefreshController } from "./refresh.controller"

@Global()
@Module({
    imports: [],
    controllers: [RefreshController],
    providers: [RefreshService],
    exports: [RefreshService]
})
export class RefreshModule {}
