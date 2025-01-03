import { Module } from "@nestjs/common"
import { ToolsResolver } from "./tools.resolver"
import { ToolsService } from "./tools.service"
import { CacheRedisModule } from "@src/cache"
import { CryptoModule } from "@src/crypto"
 

@Module({
    imports: [ CacheRedisModule.forRoot(), CryptoModule ],
    providers: [ToolsService, ToolsResolver]
})
export class ToolsModule {}
