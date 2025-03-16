import { Module } from "@nestjs/common"
import { RefreshResolver } from "./refresh.resolver"
import { RefreshService } from "./refresh.service"

 
@Module({
    imports: [],
    providers: [RefreshService, RefreshResolver],
    exports: [RefreshService]
})
export class RefreshModule {}